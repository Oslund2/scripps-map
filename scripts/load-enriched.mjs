#!/usr/bin/env node
/**
 * Loads enriched FCC station data (1,761 stations) into Supabase.
 * Replaces all existing data with fresh enriched dataset.
 * Usage: SUPABASE_SERVICE_KEY=... node scripts/load-enriched.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://flhdowregzampvnxunck.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_KEY) { console.error('Set SUPABASE_SERVICE_KEY'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const rows = JSON.parse(readFileSync('fcc_enriched.json', 'utf-8'));
  console.log(`Loading ${rows.length} enriched stations into Supabase...`);

  // Clear existing data
  console.log('Clearing existing data...');
  const { error: delErr } = await supabase.from('fcc_stations').delete().neq('facility_id', 0);
  if (delErr) {
    console.error('Delete failed:', delErr.message);
    // Try alternate approach
    const { error: delErr2 } = await supabase.from('fcc_stations').delete().gte('facility_id', 0);
    if (delErr2) console.error('Delete v2 also failed:', delErr2.message);
  }
  console.log('Cleared.');

  // Batch upsert
  const BATCH = 200;
  let ok = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('fcc_stations')
      .upsert(batch, { onConflict: 'facility_id' });
    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
    } else {
      ok += batch.length;
    }
    process.stdout.write(`\r  ${ok}/${rows.length} inserted`);
  }

  console.log('\n');

  // Verify
  const { count } = await supabase.from('fcc_stations').select('*', { count: 'exact', head: true });
  console.log(`Total in DB: ${count}`);

  // Check owner group counts
  const { data: allStations } = await supabase.from('fcc_stations').select('owner_group');
  if (allStations) {
    const groups = {};
    for (const s of allStations) groups[s.owner_group] = (groups[s.owner_group] || 0) + 1;
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
    console.log('\nOwner group counts in DB:');
    for (const [g, c] of sorted.slice(0, 20)) {
      console.log(`  ${g}: ${c}`);
    }
  }
}

main().catch(console.error);
