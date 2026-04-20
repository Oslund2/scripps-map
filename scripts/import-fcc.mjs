#!/usr/bin/env node
/**
 * FCC Full-Power TV Station Import
 * Fetches all licensed DT stations from the FCC TV Query, state by state,
 * maps licensees to owner groups, and loads into Supabase.
 *
 * Usage: node scripts/import-fcc.mjs
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_KEY env vars
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://flhdowregzampvnxunck.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_KEY) {
  console.error('Set SUPABASE_SERVICE_KEY env var (service role key from Supabase dashboard)');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Owner group patterns
const OWNER_PATTERNS = [
  [/nexstar|tribune|mission broadcasting|white knight/i, "Nexstar"],
  [/sinclair|cunningham|deerfield/i, "Sinclair"],
  [/gray television|raycom|quincy|meredith/i, "Gray"],
  [/tegna/i, "Tegna"],
  [/hearst/i, "Hearst"],
  [/scripps/i, "Scripps"],
  [/inyo/i, "INYO"],
  [/ion television/i, "ION"],
  [/fox television stations/i, "Fox O&O"],
  [/cbs broadcasting/i, "CBS O&O"],
  [/nbc telemundo|nbcuniversal/i, "NBC O&O"],
  [/abc holding|disney general/i, "ABC O&O"],
  [/univision/i, "Univision"],
  [/entravision/i, "Entravision"],
  [/cox media|cox television/i, "Cox"],
  [/graham media/i, "Graham"],
  [/hubbard/i, "Hubbard"],
  [/allen media/i, "Allen Media"],
  [/weigel/i, "Weigel"],
  [/block commun/i, "Block"],
  [/bahakel/i, "Bahakel"],
  [/emmis/i, "Emmis"],
  [/saga commun/i, "Saga"],
  [/lilly broadcasting/i, "Lilly"],
  [/morgan murphy/i, "Morgan Murphy"],
  [/public broadcasting|educational television|university|state board|board of regents|community tv/i, "Public/PBS"],
  [/religious|faith|christian|daystar|trinity|tbn|cornerstone|lesea|worship/i, "Religious"],
];

function mapOwner(licensee) {
  if (!licensee) return "Other";
  for (const [pat, group] of OWNER_PATTERNS) {
    if (pat.test(licensee)) return group;
  }
  return "Other";
}

// DMA mapping by state+city (approximate — covers major markets)
// For a full mapping, use FCC contour data or Nielsen county-to-DMA files
const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VA","VT","WA","WV","WI","WY","PR","VI","GU","AS"
];

async function fetchState(state) {
  const url = `https://transition.fcc.gov/fcc-bin/tvq?list=4&state=${state}&serv=DT&status=L&type=4&LastAction=Search`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'ScrippsMap/1.0 FCC-Import' } });
    if (!res.ok) { console.warn(`  Failed ${state}: ${res.status}`); return []; }
    const html = await res.text();
    return parseStations(html, state);
  } catch (err) {
    console.warn(`  Error fetching ${state}: ${err.message}`);
    return [];
  }
}

function parseStations(html, state) {
  // FCC TV Query returns an HTML page with a <pre> block containing pipe-delimited data
  // Each station entry spans multiple lines in a table. We parse the text content.
  const stations = [];
  const seen = new Set();

  // Extract text content, strip HTML tags
  const text = html.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Pattern: callsign followed by channel number, city, state
  // FCC format varies but callsigns are 3-5 uppercase letters optionally followed by -TV or -DT
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Look for a callsign pattern: starts with K or W (or C for Canadian), 3-8 chars
    const callMatch = line.match(/^([KWCX][A-Z0-9]{2,7}(?:-[A-Z]{1,3})?)\s*$/);
    if (callMatch) {
      const callsign = callMatch[1];
      // Skip duplicates
      if (!seen.has(callsign)) {
        seen.add(callsign);
        // Look ahead for channel, city, licensee, coordinates
        const entry = parseEntry(lines, i, callsign, state);
        if (entry) stations.push(entry);
      }
    }
    i++;
  }

  return stations;
}

function parseEntry(lines, startIdx, callsign, defaultState) {
  // Scan nearby lines (within 20) for channel, city, coordinates, licensee
  const window = lines.slice(startIdx, startIdx + 25).join(' | ');

  // Channel number
  const chanMatch = window.match(/\|\s*(\d{1,2})\s*\|/);
  const channel = chanMatch ? parseInt(chanMatch[1]) : null;

  // Coordinates: look for patterns like 41- 5-42.00 N or decimal degrees
  const latMatch = window.match(/(\d{1,2})-\s*(\d{1,2})-\s*([\d.]+)\s*N/);
  const lonMatch = window.match(/(\d{1,3})-\s*(\d{1,2})-\s*([\d.]+)\s*W/);
  let lat = null, lon = null;
  if (latMatch) {
    lat = parseInt(latMatch[1]) + parseInt(latMatch[2]) / 60 + parseFloat(latMatch[3]) / 3600;
  }
  if (lonMatch) {
    lon = -(parseInt(lonMatch[1]) + parseInt(lonMatch[2]) / 60 + parseFloat(lonMatch[3]) / 3600);
  }

  // City: typically on the line after callsign or nearby
  let city = null;
  for (let j = startIdx + 1; j < startIdx + 5 && j < lines.length; j++) {
    const l = lines[j];
    if (l.match(/^[A-Z][A-Z .-]+$/) && l.length > 2 && l.length < 30 && !l.match(/^[KWCX][A-Z0-9]/)) {
      city = l.replace(/\s+/g, ' ').trim();
      // Title case
      city = city.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
      break;
    }
  }

  // Licensee: look for LLC, INC, CORP, BROADCASTING, etc.
  let licensee = null;
  for (let j = startIdx; j < startIdx + 20 && j < lines.length; j++) {
    const l = lines[j];
    if (l.match(/\b(LLC|INC|CORP|BROADCASTING|TELEVISION|MEDIA|LICENSE|FOUNDATION|UNIVERSITY)\b/i) && l.length > 10) {
      licensee = l.trim();
      break;
    }
  }

  // Need at least coordinates to be useful
  if (!lat || !lon) return null;

  return {
    callsign,
    channel,
    city: city || 'Unknown',
    state: defaultState,
    lat,
    lon,
    licensee,
    owner_group: mapOwner(licensee),
    is_scripps: /scripps/i.test(licensee || ''),
    is_inyo: /inyo/i.test(licensee || ''),
  };
}

// Generate a deterministic facility_id from callsign (since FCC query doesn't always include it)
function facilityHash(callsign) {
  let hash = 0;
  for (let i = 0; i < callsign.length; i++) {
    hash = ((hash << 5) - hash) + callsign.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 900000 + 100000;
}

async function main() {
  console.log('FCC Full-Power TV Station Import');
  console.log('================================\n');

  let allStations = [];

  for (const state of STATES) {
    process.stdout.write(`Fetching ${state}... `);
    const stations = await fetchState(state);
    console.log(`${stations.length} stations`);
    allStations.push(...stations);
    // Small delay to be respectful to FCC servers
    await new Promise(r => setTimeout(r, 300));
  }

  // Deduplicate by callsign
  const unique = new Map();
  for (const s of allStations) {
    if (!unique.has(s.callsign)) unique.set(s.callsign, s);
  }
  const final = [...unique.values()];
  console.log(`\nTotal unique stations: ${final.length}`);

  // Prepare rows for Supabase
  const rows = final.map(s => ({
    facility_id: facilityHash(s.callsign),
    callsign: s.callsign,
    channel: s.channel,
    city: s.city,
    state: s.state,
    lat: s.lat,
    lon: s.lon,
    network: null, // Will be enriched later
    owner_group: s.owner_group,
    dma_name: null, // Will be enriched later
    dma_rank: null,
    license_status: 'LICENSED',
    service_type: 'DT',
    is_scripps: s.is_scripps,
    is_inyo: s.is_inyo,
  }));

  // Batch upsert (Supabase limit ~1000 per request)
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('fcc_stations')
      .upsert(batch, { onConflict: 'facility_id' });
    if (error) {
      console.error(`Batch ${i / BATCH + 1} failed:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`Inserted: ${inserted} stations`);

  // Final count
  const { count } = await supabase
    .from('fcc_stations')
    .select('*', { count: 'exact', head: true });
  console.log(`Total in database: ${count}`);
}

main().catch(console.error);
