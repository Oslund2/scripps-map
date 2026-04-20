#!/usr/bin/env node
/**
 * Loads the curated 285-station dataset from marketStations.js into Supabase.
 * Usage: SUPABASE_SERVICE_KEY=... node scripts/load-market-stations.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { MARKET_STATIONS } from '../src/data/marketStations.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://flhdowregzampvnxunck.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_KEY) { console.error('Set SUPABASE_SERVICE_KEY'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h) % 900000 + 100000;
}

const SCRIPPS_GROUPS = new Set(["Scripps"]);
const INYO_GROUPS = new Set(["INYO"]);

async function main() {
  const rows = MARKET_STATIONS.map(s => ({
    facility_id: hash(s.callsign + s.dma_name),
    callsign: s.callsign,
    channel: s.channel,
    city: s.city,
    state: s.state,
    lat: s.lat,
    lon: s.lon,
    network: s.network,
    owner_group: s.owner_group,
    dma_name: s.dma_name,
    dma_rank: s.dma_rank,
    license_status: 'LICENSED',
    service_type: 'DT',
    is_scripps: SCRIPPS_GROUPS.has(s.owner_group),
    is_inyo: INYO_GROUPS.has(s.owner_group),
  }));

  console.log(`Loading ${rows.length} stations into Supabase...`);

  // Batch upsert
  const BATCH = 200;
  let ok = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('fcc_stations').upsert(batch, { onConflict: 'facility_id' });
    if (error) console.error(`Batch ${i / BATCH + 1} error:`, error.message);
    else ok += batch.length;
  }

  console.log(`Loaded: ${ok} stations`);
  const { count } = await supabase.from('fcc_stations').select('*', { count: 'exact', head: true });
  console.log(`Total in DB: ${count}`);
}

main().catch(console.error);
