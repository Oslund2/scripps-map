#!/usr/bin/env node
/**
 * Load enriched FCC data into Supabase via REST API (no service key needed - uses anon key + RPC).
 * Reads fcc_enriched.json and upserts in batches.
 * Usage: node scripts/load-via-rest.mjs
 */
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://flhdowregzampvnxunck.supabase.co';
// Try service key from env, fall back to anon key
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('Set SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY env var');
  process.exit(1);
}

async function main() {
  const rows = JSON.parse(readFileSync('fcc_enriched.json', 'utf-8'));
  console.log(`Loading ${rows.length} stations...`);

  // Delete existing
  console.log('Clearing existing data...');
  const delRes = await fetch(`${SUPABASE_URL}/rest/v1/fcc_stations?facility_id=gte.0`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
  });
  console.log(`Delete: ${delRes.status} ${delRes.statusText}`);

  // Upsert in batches
  const BATCH = 100;
  let ok = 0, errors = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/fcc_stations`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(batch),
    });
    if (res.ok) {
      ok += batch.length;
    } else {
      const err = await res.text();
      console.error(`\nBatch ${Math.floor(i/BATCH)+1} failed: ${res.status} ${err.slice(0,200)}`);
      errors++;
    }
    process.stdout.write(`\r  ${ok}/${rows.length} inserted (${errors} errors)`);
  }

  console.log('\n\nVerifying...');
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/fcc_stations?select=facility_id&limit=1`, {
    method: 'HEAD',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'count=exact',
    },
  });
  const total = countRes.headers.get('content-range');
  console.log(`Total in DB: ${total}`);
}

main().catch(console.error);
