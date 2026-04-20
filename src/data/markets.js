// Duopoly / M&A market analysis — DMA-level groupings with FCC compliance data
// FCC Rule: 47 CFR §73.3555(b)
//   Test 1 — Top-4: at least one station must NOT be top-4 rated
//   Test 2 — 8 Voices: 8+ independently owned full-power stations in the DMA
//
// ION / Bounce / Independent stations are virtually never top-4, so any
// combo of a network affiliate + ION/ind passes Test 1 automatically.

export const CATEGORY_META = {
  existing:    { label: "Existing Duopoly",        color: "#FFB81C", icon: "\u25CF" },
  expanded:    { label: "Expanded (INYO)",         color: "#2ECC71", icon: "\u25B2" },
  new_duopoly: { label: "New Duopoly (INYO)",      color: "#27AE60", icon: "\u2605" },
  opportunity: { label: "Duopoly Opportunity",     color: "#3498DB", icon: "\u25CB" },
  new_market:  { label: "New INYO Market",         color: "#7F8C8D", icon: "\u25C7" },
};

// All markets where Scripps has (or will have) broadcast presence, plus opportunity markets.
// voices = estimated independent full-power station owners in the DMA.
export const MARKETS = [
  // ========== EXISTING DUOPOLIES (not expanded by INYO) ==========
  { id: "las-vegas",       name: "Las Vegas",        dmaRank: 39,  lat: 36.1699, lon: -115.1398, category: "existing",
    stations: { scripps: ["KTNV","KMCC"], inyo: [] }, voices: 10,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "KMCC (ind) is non-top-4. 10 voices." } },
  { id: "salt-lake-city",  name: "Salt Lake City",   dmaRank: 33,  lat: 40.7608, lon: -111.8910, category: "existing",
    stations: { scripps: ["KSTU","KUPX"], inyo: [] }, voices: 9,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "KUPX (ind) is non-top-4. 9 voices." } },
  { id: "green-bay",       name: "Green Bay",        dmaRank: 69,  lat: 44.5133, lon: -88.0133, category: "existing",
    stations: { scripps: ["WGBA","WACY"], inyo: [] }, voices: 8,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "WACY (ind) is non-top-4. Passes 8-voice test." } },
  { id: "tucson",          name: "Tucson",           dmaRank: 68,  lat: 32.2226, lon: -110.9747, category: "existing",
    stations: { scripps: ["KGUN","KWBA"], inyo: [] }, voices: 9,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "KWBA (ind) is non-top-4. 9 voices." } },
  { id: "tampa",           name: "Tampa",            dmaRank: 11,  lat: 27.9506, lon: -82.4572, category: "existing",
    stations: { scripps: ["WFTS","WXPX"], inyo: [] }, voices: 14,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "WXPX (ind) is non-top-4. 14 voices — large market." } },
  { id: "corpus-christi",  name: "Corpus Christi",   dmaRank: 129, lat: 27.8006, lon: -97.3964, category: "existing",
    stations: { scripps: ["KRIS","KZTV"], inyo: [] }, voices: 6,
    fcc: { top4Pass: false, voices8Pass: false, compliant: false, notes: "Both are top-4 affiliates. <8 voices. Grandfathered duopoly." } },
  { id: "miami",           name: "Miami",            dmaRank: 16,  lat: 25.7617, lon: -80.1918, category: "existing",
    stations: { scripps: ["WSFL","WPXM"], inyo: [] }, voices: 16,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "Both non-top-4 (ind + ION). 16 voices." } },
  { id: "helena",          name: "Helena",           dmaRank: 205, lat: 46.5891, lon: -112.0391, category: "existing",
    stations: { scripps: ["KTVH","KXLH"], inyo: [] }, voices: 4,
    fcc: { top4Pass: false, voices8Pass: false, compliant: false, notes: "Small market. <8 voices. Grandfathered/MTN satellite arrangement." } },
  { id: "great-falls",     name: "Great Falls",      dmaRank: 190, lat: 47.5050, lon: -111.3008, category: "existing",
    stations: { scripps: ["KRTV","KTGF"], inyo: [] }, voices: 4,
    fcc: { top4Pass: false, voices8Pass: false, compliant: false, notes: "Small market. <8 voices. Grandfathered/MTN arrangement." } },

  // ========== EXPANDED DUOPOLIES (existing + INYO adds station) ==========
  { id: "detroit",         name: "Detroit",          dmaRank: 14,  lat: 42.3314, lon: -83.0458, category: "expanded",
    stations: { scripps: ["WXYZ","WMYD"], inyo: ["WPXD"] }, voices: 12, wasExisting: true,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "WMYD (ind) + WPXD (ION) both non-top-4. 12 voices." } },
  { id: "phoenix",         name: "Phoenix",          dmaRank: 11,  lat: 33.4484, lon: -112.0740, category: "expanded",
    stations: { scripps: ["KNXV","KASW"], inyo: ["KPPX"] }, voices: 14, wasExisting: true,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "KASW (ind) + KPPX (ION) non-top-4. 14 voices." } },
  { id: "west-palm-beach", name: "West Palm Beach",  dmaRank: 38,  lat: 26.7153, lon: -80.0534, category: "expanded",
    stations: { scripps: ["WPTV","WFLX","WHDT"], inyo: ["WPXP"] }, voices: 10, wasExisting: true,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "WHDT (ind) + WPXP (ION) non-top-4. 10 voices." } },
  { id: "denver",          name: "Denver",           dmaRank: 17,  lat: 39.7392, lon: -104.9903, category: "expanded",
    stations: { scripps: ["KMGH","KCDO"], inyo: ["KPXC"] }, voices: 13, wasExisting: true,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "KCDO (ind) + KPXC (ION) non-top-4. 13 voices." } },
  { id: "norfolk",         name: "Norfolk",          dmaRank: 44,  lat: 36.8508, lon: -76.2859, category: "expanded",
    stations: { scripps: ["WTKR","WGNT"], inyo: ["WPXV"] }, voices: 10, wasExisting: true,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "WGNT (ind) + WPXV (ION) non-top-4. 10 voices." } },
  { id: "lexington",       name: "Lexington",        dmaRank: 64,  lat: 38.0406, lon: -84.5037, category: "expanded",
    stations: { scripps: ["WLEX","WTVQ"], inyo: ["WUPX"] }, voices: 8, wasExisting: true,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "WUPX (ION) non-top-4. 8 voices — at threshold." } },

  // ========== NEW DUOPOLIES (INYO creates duopoly in single-station Scripps market) ==========
  { id: "boise",           name: "Boise",            dmaRank: 112, lat: 43.6150, lon: -116.2023, category: "new_duopoly",
    stations: { scripps: ["KIVI"], inyo: ["KTRV"] }, voices: 8,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "KTRV (ION) is non-top-4. Borderline 8 voices." } },
  { id: "buffalo",         name: "Buffalo",          dmaRank: 52,  lat: 42.8864, lon: -78.8784, category: "new_duopoly",
    stations: { scripps: ["WKBW"], inyo: ["WPXJ"] }, voices: 10,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "WPXJ (ION) is non-top-4. 10 voices." } },
  { id: "cleveland",       name: "Cleveland",        dmaRank: 19,  lat: 41.4993, lon: -81.6944, category: "new_duopoly",
    stations: { scripps: ["WEWS"], inyo: ["WVPX","WDLI"] }, voices: 12,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "WVPX (ION) + WDLI (Bounce) non-top-4. 12 voices." } },
  { id: "grand-rapids",    name: "Grand Rapids",     dmaRank: 38,  lat: 42.9634, lon: -85.6681, category: "new_duopoly",
    stations: { scripps: ["WXMI"], inyo: ["WZPX"] }, voices: 9,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "WZPX (ION) is non-top-4. 9 voices." } },
  { id: "kansas-city",     name: "Kansas City",      dmaRank: 34,  lat: 39.0997, lon: -94.5786, category: "new_duopoly",
    stations: { scripps: ["KSHB"], inyo: ["KPXE"] }, voices: 11,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "KPXE (ION) is non-top-4. 11 voices." } },

  // ========== DUOPOLY OPPORTUNITIES (single Scripps station, no INYO) ==========
  { id: "san-diego",       name: "San Diego",        dmaRank: 27,  lat: 32.7157, lon: -117.1611, category: "opportunity",
    stations: { scripps: ["KGTV"], inyo: [] }, voices: 11,
    fcc: { top4Pass: null, voices8Pass: true, compliant: null, notes: "Large market, 11 voices. Need non-top-4 target." } },
  { id: "baltimore",       name: "Baltimore",        dmaRank: 26,  lat: 39.2904, lon: -76.6122, category: "opportunity",
    stations: { scripps: ["WMAR"], inyo: [] }, voices: 11,
    fcc: { top4Pass: null, voices8Pass: true, compliant: null, notes: "Large market, 11 voices. Ind/CW target ideal." } },
  { id: "nashville",       name: "Nashville",        dmaRank: 29,  lat: 36.1627, lon: -86.7816, category: "opportunity",
    stations: { scripps: ["WTVF"], inyo: [] }, voices: 10,
    fcc: { top4Pass: null, voices8Pass: true, compliant: null, notes: "Growing market. 10 voices." } },
  { id: "milwaukee",       name: "Milwaukee",        dmaRank: 35,  lat: 43.0389, lon: -87.9065, category: "opportunity",
    stations: { scripps: ["WTMJ"], inyo: [] }, voices: 10,
    fcc: { top4Pass: null, voices8Pass: true, compliant: null, notes: "10 voices. Ind/CW target viable." } },
  { id: "tulsa",           name: "Tulsa",            dmaRank: 61,  lat: 36.1540, lon: -95.9928, category: "opportunity",
    stations: { scripps: ["KJRH"], inyo: [] }, voices: 9,
    fcc: { top4Pass: null, voices8Pass: true, compliant: null, notes: "9 voices. CW or MyNet target." } },
  { id: "omaha",           name: "Omaha",            dmaRank: 76,  lat: 41.2565, lon: -95.9345, category: "opportunity",
    stations: { scripps: ["KMTV"], inyo: [] }, voices: 8,
    fcc: { top4Pass: null, voices8Pass: true, compliant: null, notes: "8 voices — at threshold." } },
  { id: "richmond",        name: "Richmond",         dmaRank: 56,  lat: 37.5407, lon: -77.4360, category: "opportunity",
    stations: { scripps: ["WTVR"], inyo: [] }, voices: 9,
    fcc: { top4Pass: null, voices8Pass: true, compliant: null, notes: "9 voices. Good duopoly candidate." } },
  { id: "fort-myers",      name: "Fort Myers",       dmaRank: 58,  lat: 26.6406, lon: -81.8723, category: "opportunity",
    stations: { scripps: ["WFTX"], inyo: [] }, voices: 9,
    fcc: { top4Pass: null, voices8Pass: true, compliant: null, notes: "9 voices. Growing SW Florida market." } },
  { id: "colorado-springs",name: "Colorado Springs", dmaRank: 89,  lat: 38.8339, lon: -104.8214, category: "opportunity",
    stations: { scripps: ["KOAA"], inyo: [] }, voices: 8,
    fcc: { top4Pass: null, voices8Pass: true, compliant: null, notes: "8 voices — borderline." } },
  { id: "lansing",         name: "Lansing",          dmaRank: 113, lat: 42.7325, lon: -84.5555, category: "opportunity",
    stations: { scripps: ["WSYM"], inyo: [] }, voices: 7,
    fcc: { top4Pass: null, voices8Pass: false, compliant: null, notes: "~7 voices. May not qualify — waiver needed." } },
  { id: "tallahassee",     name: "Tallahassee",      dmaRank: 108, lat: 30.4383, lon: -84.2807, category: "opportunity",
    stations: { scripps: ["WTXL"], inyo: [] }, voices: 7,
    fcc: { top4Pass: null, voices8Pass: false, compliant: null, notes: "~7 voices. Waiver likely needed." } },
  { id: "waco",            name: "Waco",             dmaRank: 86,  lat: 31.5493, lon: -97.1467, category: "opportunity",
    stations: { scripps: ["KXXV"], inyo: [] }, voices: 8,
    fcc: { top4Pass: null, voices8Pass: true, compliant: null, notes: "8 voices — borderline. KRHD nearby in Bryan DMA." } },
  { id: "bakersfield",     name: "Bakersfield",      dmaRank: 126, lat: 35.3733, lon: -119.0187, category: "opportunity",
    stations: { scripps: ["KERO"], inyo: [] }, voices: 6,
    fcc: { top4Pass: null, voices8Pass: false, compliant: null, notes: "Small market. <8 voices. Waiver required." } },
  { id: "san-luis-obispo", name: "San Luis Obispo",  dmaRank: 124, lat: 35.2828, lon: -120.6596, category: "opportunity",
    stations: { scripps: ["KSBY"], inyo: [] }, voices: 6,
    fcc: { top4Pass: null, voices8Pass: false, compliant: null, notes: "Small market. <8 voices. Waiver required." } },
  { id: "lafayette",       name: "Lafayette",        dmaRank: 123, lat: 30.2241, lon: -92.0198, category: "opportunity",
    stations: { scripps: ["KATC"], inyo: [] }, voices: 6,
    fcc: { top4Pass: null, voices8Pass: false, compliant: null, notes: "Small market. <8 voices. Waiver required." } },

  // ========== NEW INYO MARKETS (no existing Scripps local station) ==========
  { id: "albany",          name: "Albany",            dmaRank: 57,  lat: 42.6526, lon: -73.7562, category: "new_market",
    stations: { scripps: [], inyo: ["WYPX"] }, voices: 9,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "Single ION station. Future duopoly base." } },
  { id: "birmingham",      name: "Birmingham",        dmaRank: 45,  lat: 33.5207, lon: -86.8025, category: "new_market",
    stations: { scripps: [], inyo: ["WPXH"] }, voices: 10,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "Single ION station. Future duopoly base." } },
  { id: "greensboro",      name: "Greensboro",        dmaRank: 47,  lat: 36.0726, lon: -79.7920, category: "new_market",
    stations: { scripps: [], inyo: ["WGPX"] }, voices: 10,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "Single ION station. Future duopoly base." } },
  { id: "hartford",        name: "Hartford",           dmaRank: 30,  lat: 41.7658, lon: -72.6734, category: "new_market",
    stations: { scripps: [], inyo: ["WHPX"] }, voices: 11,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "Single ION station. Large market — strong duopoly base." } },
  { id: "honolulu",        name: "Honolulu",           dmaRank: 71,  lat: 21.3069, lon: -157.8583, category: "new_market",
    stations: { scripps: [], inyo: ["KPXO"] }, voices: 9,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "Single ION station. Island market." } },
  { id: "indianapolis",    name: "Indianapolis",       dmaRank: 25,  lat: 39.7684, lon: -86.1581, category: "new_market",
    stations: { scripps: [], inyo: ["WIPX","WCLJ"] }, voices: 12,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "WRTV sold to clear. Two INYO stations (ION + Bounce)." } },
  { id: "memphis",         name: "Memphis",            dmaRank: 51,  lat: 35.1495, lon: -90.0490, category: "new_market",
    stations: { scripps: [], inyo: ["WPXX"] }, voices: 10,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "Single ION station. Future duopoly base." } },
  { id: "oklahoma-city",   name: "Oklahoma City",      dmaRank: 41,  lat: 35.4676, lon: -97.5164, category: "new_market",
    stations: { scripps: [], inyo: ["KOPX"] }, voices: 11,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "Single ION station. Future duopoly base." } },
  { id: "providence",      name: "Providence",         dmaRank: 52,  lat: 41.8240, lon: -71.4128, category: "new_market",
    stations: { scripps: [], inyo: ["WLWC"] }, voices: 10,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "Single Bounce station. Future duopoly base." } },
  { id: "spokane",         name: "Spokane",            dmaRank: 73,  lat: 47.6588, lon: -117.4260, category: "new_market",
    stations: { scripps: [], inyo: ["KGPX"] }, voices: 8,
    fcc: { top4Pass: true, voices8Pass: true, compliant: true, notes: "Single ION station. 8 voices — at threshold." } },
];

// ========== FINANCIAL & DEMOGRAPHIC ENRICHMENT ==========
// TV households: Nielsen 2024-25 season (via ustvdb.com)
// Revenue: estimated from DMA tier ratios (BIA/Pew published benchmarks)
//   Top 10: ~$180-350M, 11-25: ~$80-170M, 26-50: ~$40-100M,
//   51-100: ~$15-55M, 101+: ~$5-20M annual local TV ad revenue
// Political swing: competitive state markets where political ad spend adds 25-40% in even years

const ENRICHMENT = {
  // Existing duopolies
  "las-vegas":        { tvHouseholds: 896460,  estRevenueM: 72,  politicalSwing: true },
  "salt-lake-city":   { tvHouseholds: 1163520, estRevenueM: 85,  politicalSwing: false },
  "green-bay":        { tvHouseholds: 478970,  estRevenueM: 38,  politicalSwing: true },
  "tucson":           { tvHouseholds: 497660,  estRevenueM: 35,  politicalSwing: true },
  "tampa":            { tvHouseholds: 2221240, estRevenueM: 170, politicalSwing: true },
  "corpus-christi":   { tvHouseholds: 209780,  estRevenueM: 12,  politicalSwing: false },
  "miami":            { tvHouseholds: 1756920, estRevenueM: 145, politicalSwing: true },
  "helena":           { tvHouseholds: 32420,   estRevenueM: 3,   politicalSwing: false },
  "great-falls":      { tvHouseholds: 66390,   estRevenueM: 5,   politicalSwing: false },
  // Expanded duopolies
  "detroit":          { tvHouseholds: 1940750, estRevenueM: 155, politicalSwing: true },
  "phoenix":          { tvHouseholds: 2198200, estRevenueM: 175, politicalSwing: true },
  "west-palm-beach":  { tvHouseholds: 936790,  estRevenueM: 68,  politicalSwing: true },
  "denver":           { tvHouseholds: 1806270, estRevenueM: 140, politicalSwing: true },
  "norfolk":          { tvHouseholds: 779970,  estRevenueM: 52,  politicalSwing: true },
  "lexington":        { tvHouseholds: 517660,  estRevenueM: 35,  politicalSwing: false },
  // New duopolies (INYO)
  "boise":            { tvHouseholds: 345250,  estRevenueM: 22,  politicalSwing: false },
  "buffalo":          { tvHouseholds: 637090,  estRevenueM: 45,  politicalSwing: true },
  "cleveland":        { tvHouseholds: 1554340, estRevenueM: 120, politicalSwing: true },
  "grand-rapids":     { tvHouseholds: 801030,  estRevenueM: 55,  politicalSwing: true },
  "kansas-city":      { tvHouseholds: 1033680, estRevenueM: 78,  politicalSwing: false },
  // Opportunities
  "san-diego":        { tvHouseholds: 1116150, estRevenueM: 82,  politicalSwing: false },
  "baltimore":        { tvHouseholds: 1155000, estRevenueM: 88,  politicalSwing: false },
  "nashville":        { tvHouseholds: 1199400, estRevenueM: 90,  politicalSwing: false },
  "milwaukee":        { tvHouseholds: 944900,  estRevenueM: 70,  politicalSwing: true },
  "tulsa":            { tvHouseholds: 575780,  estRevenueM: 38,  politicalSwing: false },
  "omaha":            { tvHouseholds: 458080,  estRevenueM: 32,  politicalSwing: false },
  "richmond":         { tvHouseholds: 625380,  estRevenueM: 42,  politicalSwing: true },
  "fort-myers":       { tvHouseholds: 641850,  estRevenueM: 45,  politicalSwing: true },
  "colorado-springs": { tvHouseholds: 388730,  estRevenueM: 25,  politicalSwing: true },
  "lansing":          { tvHouseholds: 265830,  estRevenueM: 16,  politicalSwing: true },
  "tallahassee":      { tvHouseholds: 303530,  estRevenueM: 18,  politicalSwing: true },
  "waco":             { tvHouseholds: 419600,  estRevenueM: 28,  politicalSwing: false },
  "bakersfield":      { tvHouseholds: 244310,  estRevenueM: 14,  politicalSwing: false },
  "san-luis-obispo":  { tvHouseholds: 245950,  estRevenueM: 14,  politicalSwing: false },
  "lafayette":        { tvHouseholds: 245210,  estRevenueM: 14,  politicalSwing: false },
  // New INYO markets
  "albany":           { tvHouseholds: 575590,  estRevenueM: 40,  politicalSwing: true },
  "birmingham":       { tvHouseholds: 771860,  estRevenueM: 52,  politicalSwing: false },
  "greensboro":       { tvHouseholds: 766980,  estRevenueM: 50,  politicalSwing: true },
  "hartford":         { tvHouseholds: 1060910, estRevenueM: 78,  politicalSwing: false },
  "honolulu":         { tvHouseholds: 470520,  estRevenueM: 32,  politicalSwing: false },
  "indianapolis":     { tvHouseholds: 1232210, estRevenueM: 95,  politicalSwing: true },
  "memphis":          { tvHouseholds: 666300,  estRevenueM: 45,  politicalSwing: false },
  "oklahoma-city":    { tvHouseholds: 762700,  estRevenueM: 50,  politicalSwing: false },
  "providence":       { tvHouseholds: 662810,  estRevenueM: 45,  politicalSwing: false },
  "spokane":          { tvHouseholds: 496260,  estRevenueM: 32,  politicalSwing: false },
};

// Merge enrichment into MARKETS
for (const m of MARKETS) {
  const e = ENRICHMENT[m.id];
  if (e) {
    m.tvHouseholds = e.tvHouseholds;
    m.estRevenueM = e.estRevenueM;
    m.politicalSwing = e.politicalSwing;
  }
}

export function getMarketsByCategory(cat) {
  return MARKETS.filter(m => m.category === cat);
}

export function getCategoryCounts() {
  const counts = {};
  for (const m of MARKETS) counts[m.category] = (counts[m.category] || 0) + 1;
  counts.total = MARKETS.length;
  return counts;
}

export function getMarketStationObjects(market, allStations) {
  const all = [...market.stations.scripps, ...market.stations.inyo];
  return all.map(call => allStations.find(s => s.callsign === call)).filter(Boolean);
}

export function getTotalStationCount() {
  let s = 0, i = 0;
  for (const m of MARKETS) {
    s += m.stations.scripps.length;
    i += m.stations.inyo.length;
  }
  return { scripps: s, inyo: i, total: s + i };
}

// Top 3 M&A opportunities for TV Monitor display
// Scored by: market size, revenue, FCC feasibility, strategic value, category
export function getTopOpportunities() {
  const scored = MARKETS
    .filter(m => m.category !== 'new_market') // exclude markets with no Scripps presence
    .map(m => {
      let score = 0;
      // Bigger market = better (invert rank: DMA #11 = 200 pts, DMA #112 = 99 pts)
      score += Math.max(0, 211 - (m.dmaRank || 200));
      // Revenue
      score += (m.estRevenueM || 0) * 0.5;
      // Voice count margin above 8 (more voices = easier FCC)
      score += Math.max(0, (m.voices - 8)) * 15;
      // Political swing bonus
      if (m.politicalSwing) score += 20;
      // Category bonus
      if (m.category === 'new_duopoly') score += 40; // INYO creates new duopoly — most actionable
      else if (m.category === 'opportunity') score += 30; // open opportunity
      else if (m.category === 'expanded') score += 20; // already happening
      // FCC compliant bonus
      if (m.fcc.compliant === true) score += 15;

      // Generate reason
      let reason;
      if (m.category === 'new_duopoly') {
        reason = `INYO creates new duopoly — ${m.voices} voices, ~$${m.estRevenueM}M revenue`;
      } else if (m.category === 'opportunity') {
        reason = `Single-station market — ${m.voices} voices, ripe for duopoly`;
      } else if (m.category === 'expanded') {
        reason = `INYO expands existing duopoly to ${m.stations.scripps.length + m.stations.inyo.length} stations`;
      } else {
        reason = `Existing duopoly — ${m.voices} voices, $${m.estRevenueM}M market`;
      }
      if (m.politicalSwing) reason += ' (swing market)';

      return { ...m, score, reason };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return scored;
}
