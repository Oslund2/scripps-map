// Scripps station dataset — used by the globe + driving tour
// Sources: scripps.com/our-brands/local-media, en.wikipedia.org/wiki/E._W._Scripps_Company
// Coordinates are city-center approximations for the city of license.

export const SCRIPPS_STATIONS = [
  // ===== NETWORK OPERATIONS =====
  { callsign: "HQ",    type: "hq",       city: "Cincinnati",           state: "OH", lat: 39.1031, lon: -84.5120, affiliation: "Scripps Center HQ",            logo: null,              notes: "Corporate HQ — 312 Walnut St." },
  { callsign: "HQ2",   type: "hq",       city: "West Palm Beach",      state: "FL", lat: 26.7153, lon: -80.0534, affiliation: "Scripps Networks / Ion",       logo: null,              notes: "Scripps Networks operations center" },
  { callsign: "BEE",   type: "event",    city: "Washington",           state: "DC", lat: 38.9072, lon: -77.0369, affiliation: "Scripps National Spelling Bee", logo: null,              notes: "Annual Bee finals, National Harbor MD" },

  // ===== LOCAL TELEVISION =====
  { callsign: "WXYZ",  type: "abc",      city: "Detroit",              state: "MI", lat: 42.3314, lon: -83.0458, affiliation: "ABC 7",              logo: "wxyz.png" },
  { callsign: "WMYD",  type: "ind",      city: "Detroit",              state: "MI", lat: 42.3314, lon: -83.0458, affiliation: "Independent 20",     logo: null },
  { callsign: "KSHB",  type: "nbc",      city: "Kansas City",          state: "MO", lat: 39.0997, lon: -94.5786, affiliation: "NBC 41",             logo: "kshb.png" },
  { callsign: "KMGH",  type: "abc",      city: "Denver",               state: "CO", lat: 39.7392, lon: -104.9903, affiliation: "ABC Denver 7",     logo: "kmgh.png" },
  { callsign: "WTMJ",  type: "nbc",      city: "Milwaukee",            state: "WI", lat: 43.0389, lon: -87.9065, affiliation: "NBC TMJ4",           logo: "wtmj.png" },
  { callsign: "WFTS",  type: "abc",      city: "Tampa",                state: "FL", lat: 27.9506, lon: -82.4572, affiliation: "ABC Action News 28", logo: "wfts.png" },
  { callsign: "KNXV",  type: "abc",      city: "Phoenix",              state: "AZ", lat: 33.4484, lon: -112.0740, affiliation: "ABC15 Arizona",    logo: "knxv.png" },
  { callsign: "KASW",  type: "ind",      city: "Phoenix",              state: "AZ", lat: 33.4484, lon: -112.0740, affiliation: "The Spot AZ 61",    logo: null },
  { callsign: "WCPO",  type: "abc",      city: "Cincinnati",           state: "OH", lat: 39.1031, lon: -84.5120, affiliation: "ABC WCPO 9",         logo: "wcpo.png", notes: "Flagship — Cincinnati" },
  { callsign: "WEWS",  type: "abc",      city: "Cleveland",            state: "OH", lat: 41.4993, lon: -81.6944, affiliation: "News 5 Cleveland",   logo: "wews.png", notes: "First Scripps TV station (1947)" },
  { callsign: "KGTV",  type: "abc",      city: "San Diego",            state: "CA", lat: 32.7157, lon: -117.1611, affiliation: "ABC 10News",      logo: "kgtv.png" },
  { callsign: "WPTV",  type: "nbc",      city: "West Palm Beach",      state: "FL", lat: 26.7153, lon: -80.0534, affiliation: "NBC WPTV 5",         logo: "wptv.png" },
  { callsign: "WFLX",  type: "fox",      city: "West Palm Beach",      state: "FL", lat: 26.7153, lon: -80.0534, affiliation: "Fox 29",             logo: null },
  { callsign: "WHDT",  type: "ind",      city: "West Palm Beach",      state: "FL", lat: 26.7153, lon: -80.0534, affiliation: "South Florida's 9",  logo: null },
  { callsign: "WMAR",  type: "abc",      city: "Baltimore",            state: "MD", lat: 39.2904, lon: -76.6122, affiliation: "ABC WMAR 2",         logo: "wmar.png" },
  { callsign: "KTNV",  type: "abc",      city: "Las Vegas",            state: "NV", lat: 36.1699, lon: -115.1398, affiliation: "ABC KTNV 13",     logo: "ktnv.png" },
  { callsign: "KMCC",  type: "ind",      city: "Las Vegas",            state: "NV", lat: 36.1699, lon: -115.1398, affiliation: "Vegas 34",         logo: null, notes: "Flagship: Vegas Golden Knights" },
  { callsign: "WKBW",  type: "abc",      city: "Buffalo",              state: "NY", lat: 42.8864, lon: -78.8784, affiliation: "ABC WKBW 7",         logo: "wkbw.png" },
  { callsign: "WTVF",  type: "cbs",      city: "Nashville",            state: "TN", lat: 36.1627, lon: -86.7816, affiliation: "NewsChannel 5",      logo: "wtvf.png" },
  { callsign: "WRTV",  type: "abc",      city: "Indianapolis",         state: "IN", lat: 39.7684, lon: -86.1581, affiliation: "ABC WRTV 6",         logo: null },
  { callsign: "KJRH",  type: "nbc",      city: "Tulsa",                state: "OK", lat: 36.1540, lon: -95.9928, affiliation: "2 News Oklahoma",    logo: "kjrh.png" },
  { callsign: "KMTV",  type: "cbs",      city: "Omaha",                state: "NE", lat: 41.2565, lon: -95.9345, affiliation: "3 News Now",        logo: "kmtv.png" },
  { callsign: "KSTU",  type: "fox",      city: "Salt Lake City",       state: "UT", lat: 40.7608, lon: -111.8910, affiliation: "Fox 13 Utah",     logo: "kstu.png" },
  { callsign: "KUPX",  type: "ind",      city: "Salt Lake City",       state: "UT", lat: 40.7608, lon: -111.8910, affiliation: "Utah 16",          logo: null },
  { callsign: "WXMI",  type: "fox",      city: "Grand Rapids",         state: "MI", lat: 42.9634, lon: -85.6681, affiliation: "Fox 17",             logo: "wxmi.png" },
  { callsign: "WTKR",  type: "cbs",      city: "Norfolk",              state: "VA", lat: 36.8508, lon: -76.2859, affiliation: "News 3",             logo: "wtkr.png" },
  { callsign: "WGNT",  type: "ind",      city: "Norfolk",              state: "VA", lat: 36.8508, lon: -76.2859, affiliation: "The Spot 27",        logo: null },
  { callsign: "WTVR",  type: "cbs",      city: "Richmond",             state: "VA", lat: 37.5407, lon: -77.4360, affiliation: "CBS 6 News",         logo: "wtvr.png" },
  { callsign: "WSFL",  type: "ind",      city: "Miami",                state: "FL", lat: 25.7617, lon: -80.1918, affiliation: "SFL CW 39",          logo: "wsfl.png" },
  { callsign: "KIVI",  type: "abc",      city: "Boise",                state: "ID", lat: 43.6150, lon: -116.2023, affiliation: "Idaho News 6",     logo: "kivi.png" },
  { callsign: "KSAW",  type: "abc",      city: "Twin Falls",           state: "ID", lat: 42.5629, lon: -114.4609, affiliation: "Idaho News 6",     logo: null },
  { callsign: "KOAA",  type: "nbc",      city: "Colorado Springs",     state: "CO", lat: 38.8339, lon: -104.8214, affiliation: "News5",            logo: "koaa.png" },
  { callsign: "KCDO",  type: "ind",      city: "Denver",               state: "CO", lat: 39.7392, lon: -104.9903, affiliation: "The Spot Denver",   logo: null },
  { callsign: "KERO",  type: "abc",      city: "Bakersfield",          state: "CA", lat: 35.3733, lon: -119.0187, affiliation: "23ABC News",       logo: "kero.png" },
  { callsign: "KSBY",  type: "nbc",      city: "San Luis Obispo",      state: "CA", lat: 35.2828, lon: -120.6596, affiliation: "KSBY 6",            logo: "ksby.png" },
  { callsign: "KGUN",  type: "abc",      city: "Tucson",               state: "AZ", lat: 32.2226, lon: -110.9747, affiliation: "KGUN 9",            logo: "kgun.png" },
  { callsign: "KWBA",  type: "ind",      city: "Tucson",               state: "AZ", lat: 32.2226, lon: -110.9747, affiliation: "Arizona 58",        logo: null },
  { callsign: "KXXV",  type: "abc",      city: "Waco",                 state: "TX", lat: 31.5493, lon: -97.1467, affiliation: "ABC 25",             logo: "kxxv.png" },
  { callsign: "KRHD",  type: "abc",      city: "Bryan",                state: "TX", lat: 30.6744, lon: -96.3698, affiliation: "KRHD 40",           logo: null },
  { callsign: "KRIS",  type: "nbc",      city: "Corpus Christi",       state: "TX", lat: 27.8006, lon: -97.3964, affiliation: "KRIS 6",             logo: "kris.png" },
  { callsign: "KZTV",  type: "cbs",      city: "Corpus Christi",       state: "TX", lat: 27.8006, lon: -97.3964, affiliation: "KZTV 10",            logo: null },
  { callsign: "KATC",  type: "abc",      city: "Lafayette",            state: "LA", lat: 30.2241, lon: -92.0198, affiliation: "KATC 3",             logo: "katc.png" },
  { callsign: "WLEX",  type: "nbc",      city: "Lexington",            state: "KY", lat: 38.0406, lon: -84.5037, affiliation: "LEX 18",             logo: "wlex.png" },
  { callsign: "WTVQ",  type: "abc",      city: "Lexington",            state: "KY", lat: 38.0406, lon: -84.5037, affiliation: "ABC 36",             logo: null },
  { callsign: "WGBA",  type: "nbc",      city: "Green Bay",            state: "WI", lat: 44.5133, lon: -88.0133, affiliation: "NBC 26",             logo: "wgba.png" },
  { callsign: "WACY",  type: "ind",      city: "Green Bay",            state: "WI", lat: 44.5133, lon: -88.0133, affiliation: "The Spot 32",        logo: null },
  { callsign: "WSYM",  type: "fox",      city: "Lansing",              state: "MI", lat: 42.7325, lon: -84.5555, affiliation: "Fox 47",             logo: "wsym.png" },
  { callsign: "WFTX",  type: "fox",      city: "Fort Myers",           state: "FL", lat: 26.6406, lon: -81.8723, affiliation: "Fox 4",              logo: "wftx.png" },
  { callsign: "WTXL",  type: "abc",      city: "Tallahassee",          state: "FL", lat: 30.4383, lon: -84.2807, affiliation: "ABC 27",             logo: "wtxl.png" },
  { callsign: "WXPX",  type: "ind",      city: "Tampa",                state: "FL", lat: 27.9506, lon: -82.4572, affiliation: "Tampa Bay 66",       logo: null },

  // Montana Television Network (MTN)
  { callsign: "KTVQ",  type: "cbs",      city: "Billings",             state: "MT", lat: 45.7833, lon: -108.5007, affiliation: "MTN Billings",     logo: "ktvq.png" },
  { callsign: "KXLF",  type: "cbs",      city: "Butte",                state: "MT", lat: 46.0038, lon: -112.5348, affiliation: "MTN Butte",        logo: "kxlf.png" },
  { callsign: "KBZK",  type: "cbs",      city: "Bozeman",              state: "MT", lat: 45.6770, lon: -111.0429, affiliation: "MTN Bozeman",      logo: null },
  { callsign: "KRTV",  type: "cbs",      city: "Great Falls",          state: "MT", lat: 47.5050, lon: -111.3008, affiliation: "MTN Great Falls",  logo: "krtv.png" },
  { callsign: "KTGF",  type: "nbc",      city: "Great Falls",          state: "MT", lat: 47.5050, lon: -111.3008, affiliation: "NBC Great Falls",  logo: null },
  { callsign: "KTVH",  type: "nbc",      city: "Helena",               state: "MT", lat: 46.5891, lon: -112.0391, affiliation: "KTVH 12",          logo: "ktvh.png" },
  { callsign: "KXLH",  type: "cbs",      city: "Helena",               state: "MT", lat: 46.5891, lon: -112.0391, affiliation: "KXLH 9",           logo: null },
  { callsign: "KPAX",  type: "cbs",      city: "Missoula",             state: "MT", lat: 46.8721, lon: -113.9940, affiliation: "MTN Missoula",     logo: "kpax.png" },

  // ===== SELECTED ION / NETWORK STATIONS =====
  { callsign: "WPXN",  type: "ion",      city: "New York",             state: "NY", lat: 40.7128, lon: -74.0060, affiliation: "Ion Television",     logo: null },
  { callsign: "KPXN",  type: "ion",      city: "Los Angeles",          state: "CA", lat: 34.0522, lon: -118.2437, affiliation: "Ion Television",    logo: null },
  { callsign: "WCPX",  type: "ion",      city: "Chicago",              state: "IL", lat: 41.8781, lon: -87.6298, affiliation: "Ion Television",    logo: null },
  { callsign: "KKPX",  type: "ion",      city: "San Francisco",        state: "CA", lat: 37.7749, lon: -122.4194, affiliation: "Ion Television",   logo: null },
  { callsign: "WBPX",  type: "ion",      city: "Boston",               state: "MA", lat: 42.3601, lon: -71.0589, affiliation: "Ion Television",    logo: null },
  { callsign: "WPPX",  type: "ion",      city: "Philadelphia",         state: "PA", lat: 39.9526, lon: -75.1652, affiliation: "Ion Television",    logo: null },
  { callsign: "WPXW",  type: "ion",      city: "Washington",           state: "DC", lat: 38.9072, lon: -77.0369, affiliation: "Ion Television",    logo: null },
  { callsign: "KPXD",  type: "ion",      city: "Dallas",               state: "TX", lat: 32.7767, lon: -96.7970, affiliation: "Ion Television",    logo: null },
  { callsign: "KPXB",  type: "ion",      city: "Houston",              state: "TX", lat: 29.7604, lon: -95.3698, affiliation: "Ion Television",    logo: null },
  { callsign: "WPXM",  type: "ion",      city: "Miami",                state: "FL", lat: 25.7617, lon: -80.1918, affiliation: "Ion Television",    logo: null },
  { callsign: "WOPX",  type: "ion",      city: "Orlando",              state: "FL", lat: 28.5383, lon: -81.3792, affiliation: "Ion Television",    logo: null },
  { callsign: "WPXA",  type: "ion",      city: "Atlanta",              state: "GA", lat: 33.7490, lon: -84.3880, affiliation: "Ion Television",    logo: null },
  { callsign: "KPXM",  type: "ion",      city: "Minneapolis",          state: "MN", lat: 44.9778, lon: -93.2650, affiliation: "Ion Television",    logo: null },
  { callsign: "WRBU",  type: "ion",      city: "St. Louis",            state: "MO", lat: 38.6270, lon: -90.1994, affiliation: "Ion Television",    logo: null },
  { callsign: "KWPX",  type: "ion",      city: "Seattle",              state: "WA", lat: 47.6062, lon: -122.3321, affiliation: "Ion Television",   logo: null },
  { callsign: "KPXG",  type: "ion",      city: "Portland",             state: "OR", lat: 45.5152, lon: -122.6784, affiliation: "Ion Television",   logo: null },
  { callsign: "KSPX",  type: "ion",      city: "Sacramento",           state: "CA", lat: 38.5816, lon: -121.4944, affiliation: "Ion Television",   logo: null },

  // ===== INYO BROADCAST HOLDINGS (Pending Scripps acquisition — $54M, Feb 2026) =====
  // 23 stations divested during 2021 ION Media acquisition, now being re-acquired.
  // Overlapping Scripps markets
  { callsign: "KTRV",  type: "inyo",     city: "Boise",                state: "ID", lat: 43.6150, lon: -116.2023, affiliation: "ION Television",   logo: null, notes: "INYO — new duopoly w/ KIVI" },
  { callsign: "WPXJ",  type: "inyo",     city: "Buffalo",              state: "NY", lat: 42.8864, lon: -78.8784,  affiliation: "ION Television",   logo: null, notes: "INYO — new duopoly w/ WKBW" },
  { callsign: "WVPX",  type: "inyo",     city: "Cleveland",            state: "OH", lat: 41.4993, lon: -81.6944,  affiliation: "ION Television",   logo: null, notes: "INYO — new duopoly w/ WEWS" },
  { callsign: "WDLI",  type: "inyo",     city: "Canton",               state: "OH", lat: 40.7989, lon: -81.3784,  affiliation: "Bounce TV",        logo: null, notes: "INYO — Cleveland DMA" },
  { callsign: "WZPX",  type: "inyo",     city: "Grand Rapids",         state: "MI", lat: 42.9634, lon: -85.6681,  affiliation: "ION Television",   logo: null, notes: "INYO — new duopoly w/ WXMI" },
  { callsign: "KPXE",  type: "inyo",     city: "Kansas City",          state: "MO", lat: 39.0997, lon: -94.5786,  affiliation: "ION Television",   logo: null, notes: "INYO — new duopoly w/ KSHB" },
  { callsign: "KPXC",  type: "inyo",     city: "Denver",               state: "CO", lat: 39.7392, lon: -104.9903, affiliation: "ION Television",   logo: null, notes: "INYO — expands KMGH+KCDO duopoly" },
  { callsign: "WPXD",  type: "inyo",     city: "Detroit",              state: "MI", lat: 42.3314, lon: -83.0458,  affiliation: "ION Television",   logo: null, notes: "INYO — expands WXYZ+WMYD duopoly" },
  { callsign: "WUPX",  type: "inyo",     city: "Lexington",            state: "KY", lat: 38.0406, lon: -84.5037,  affiliation: "ION Television",   logo: null, notes: "INYO — expands WLEX+WTVQ duopoly" },
  { callsign: "WPXV",  type: "inyo",     city: "Norfolk",              state: "VA", lat: 36.8508, lon: -76.2859,  affiliation: "ION Television",   logo: null, notes: "INYO — expands WTKR+WGNT duopoly" },
  { callsign: "KPPX",  type: "inyo",     city: "Phoenix",              state: "AZ", lat: 33.4484, lon: -112.0740, affiliation: "ION Television",   logo: null, notes: "INYO — expands KNXV+KASW duopoly" },
  { callsign: "WPXP",  type: "inyo",     city: "West Palm Beach",      state: "FL", lat: 26.7153, lon: -80.0534,  affiliation: "ION Television",   logo: null, notes: "INYO — expands WPTV+WFLX+WHDT" },
  // New markets (no existing Scripps local presence)
  { callsign: "WYPX",  type: "inyo",     city: "Albany",               state: "NY", lat: 42.6526, lon: -73.7562,  affiliation: "ION Television",   logo: null, notes: "INYO — new market" },
  { callsign: "WPXH",  type: "inyo",     city: "Birmingham",           state: "AL", lat: 33.5207, lon: -86.8025,  affiliation: "ION Television",   logo: null, notes: "INYO — new market" },
  { callsign: "WGPX",  type: "inyo",     city: "Greensboro",           state: "NC", lat: 36.0726, lon: -79.7920,  affiliation: "ION Television",   logo: null, notes: "INYO — new market" },
  { callsign: "WHPX",  type: "inyo",     city: "Hartford",             state: "CT", lat: 41.7658, lon: -72.6734,  affiliation: "ION Television",   logo: null, notes: "INYO — new market" },
  { callsign: "KPXO",  type: "inyo",     city: "Honolulu",             state: "HI", lat: 21.3069, lon: -157.8583, affiliation: "ION Television",   logo: null, notes: "INYO — new market" },
  { callsign: "WIPX",  type: "inyo",     city: "Indianapolis",         state: "IN", lat: 39.7684, lon: -86.1581,  affiliation: "ION Television",   logo: null, notes: "INYO — WRTV sold to clear" },
  { callsign: "WCLJ",  type: "inyo",     city: "Indianapolis",         state: "IN", lat: 39.7684, lon: -86.1581,  affiliation: "Bounce TV",        logo: null, notes: "INYO — Indianapolis duo" },
  { callsign: "WPXX",  type: "inyo",     city: "Memphis",              state: "TN", lat: 35.1495, lon: -90.0490,  affiliation: "ION Television",   logo: null, notes: "INYO — new market" },
  { callsign: "KOPX",  type: "inyo",     city: "Oklahoma City",        state: "OK", lat: 35.4676, lon: -97.5164,  affiliation: "ION Television",   logo: null, notes: "INYO — new market" },
  { callsign: "WLWC",  type: "inyo",     city: "Providence",           state: "RI", lat: 41.8240, lon: -71.4128,  affiliation: "Bounce TV",        logo: null, notes: "INYO — new market" },
  { callsign: "KGPX",  type: "inyo",     city: "Spokane",              state: "WA", lat: 47.6588, lon: -117.4260, affiliation: "ION Television",   logo: null, notes: "INYO — new market" },
];

// Driving tour — every station & operation, shortest highway route.
// 78 stops, Cincinnati HQ to the Pacific coast.
// Optimized: Lexington→STL direct (saves 94mi vs Indy detour),
// Tallahassee after Miami (saves 95mi on FL exit),
// Indianapolis after Norfolk (breaks the 1500mi west jump into two hops).
export const TOUR = [
  // ═══ CINCINNATI HOME BASE ═══
  "HQ",   "WCPO",
  // ═══ KENTUCKY (I-75 S) ═══
  "WLEX", "WTVQ",
  // ═══ MISSOURI (I-64 W via Louisville) ═══
  "WRBU",
  // ═══ TENNESSEE (I-57 S, I-24) ═══
  "WTVF",
  // ═══ GEORGIA (I-24, I-75 S) ═══
  "WPXA",
  // ═══ FLORIDA — IN via I-75 S ═══
  "WOPX",           // Orlando
  "WFTS", "WXPX",   // Tampa
  "WFTX",           // Fort Myers
  "HQ2", "WPTV", "WFLX", "WHDT",  // West Palm Beach
  "WSFL", "WPXM",   // Miami
  // ═══ FLORIDA — OUT (I-75 N, I-10 W) ═══
  "WTXL",           // Tallahassee (exit FL via panhandle)
  // ═══ GULF COAST (I-10 W) ═══
  "KATC",
  // ═══ TEXAS (I-10, I-37, TX-6, I-35) ═══
  "KPXB",           // Houston
  "KRIS", "KZTV",   // Corpus Christi
  "KRHD",           // Bryan
  "KXXV",           // Waco
  "KPXD",           // Dallas
  // ═══ PLAINS NORTH (I-35, I-44, I-29) ═══
  "KJRH",           // Tulsa
  "KSHB",           // Kansas City
  "KMTV",           // Omaha
  "KPXM",           // Minneapolis
  // ═══ UPPER MIDWEST (I-94, I-43) ═══
  "WGBA", "WACY",   // Green Bay
  "WTMJ",           // Milwaukee
  "WCPX",           // Chicago
  // ═══ MICHIGAN (I-94, I-196, I-96) ═══
  "WXMI",           // Grand Rapids
  "WSYM",           // Lansing
  "WXYZ", "WMYD",   // Detroit
  // ═══ GREAT LAKES EAST (I-90) ═══
  "WEWS",           // Cleveland
  "WKBW",           // Buffalo
  // ═══ NORTHEAST (I-90, I-95) ═══
  "WBPX",           // Boston
  "WPXN",           // New York
  "WPPX",           // Philadelphia
  // ═══ MID-ATLANTIC (I-95, I-64) ═══
  "WMAR",           // Baltimore
  "BEE", "WPXW",    // Washington DC
  "WTVR",           // Richmond
  "WTKR", "WGNT",   // Norfolk
  // ═══ HEARTLAND RETURN (I-64, I-77, I-70) ═══
  "WRTV",           // Indianapolis
  // ═══ MOUNTAIN WEST (I-70, I-25) ═══
  "KOAA",           // Colorado Springs
  "KMGH", "KCDO",   // Denver
  // ═══ MONTANA (I-25, I-90, I-15) ═══
  "KTVQ",           // Billings
  "KBZK",           // Bozeman
  "KXLF",           // Butte
  "KTVH", "KXLH",   // Helena
  "KRTV", "KTGF",   // Great Falls
  "KPAX",           // Missoula
  // ═══ IDAHO (US-93, I-84) ═══
  "KIVI",           // Boise
  "KSAW",           // Twin Falls
  // ═══ UTAH (I-84, I-86, I-15) ═══
  "KSTU", "KUPX",   // Salt Lake City
  // ═══ SOUTHWEST (I-15, US-93, I-10) ═══
  "KTNV", "KMCC",   // Las Vegas
  "KNXV", "KASW",   // Phoenix
  "KGUN", "KWBA",   // Tucson
  // ═══ CALIFORNIA (I-8, I-5, CA-99, US-101) ═══
  "KGTV",           // San Diego
  "KPXN",           // Los Angeles
  "KERO",           // Bakersfield
  "KSBY",           // San Luis Obispo
  "KKPX",           // San Francisco
  "KSPX",           // Sacramento
  // ═══ PACIFIC NORTHWEST (I-5) ═══
  "KPXG",           // Portland
  "KWPX",           // Seattle
];

// Highway route info for each tour stop — roads from the previous stop, approx miles.
// null roads = co-located with previous stop (same city).
export const TOUR_VIA = {
  HQ:   { roads: null, miles: 0 },
  WCPO: { roads: null, miles: 0 },
  WLEX: { roads: "I-75 S", miles: 85 },
  WTVQ: { roads: null, miles: 0 },
  WRBU: { roads: "I-64 W via Louisville", miles: 265 },
  WTVF: { roads: "I-57 S, I-24 W", miles: 310 },
  WPXA: { roads: "I-24 to I-75 S", miles: 250 },
  WOPX: { roads: "I-75 S to FL Turnpike", miles: 440 },
  WFTS: { roads: "I-4 W", miles: 80 },
  WXPX: { roads: null, miles: 0 },
  WFTX: { roads: "I-75 S", miles: 140 },
  HQ2:  { roads: "US-27 E, I-95 N", miles: 160 },
  WPTV: { roads: null, miles: 0 },
  WFLX: { roads: null, miles: 0 },
  WHDT: { roads: null, miles: 0 },
  WSFL: { roads: "I-95 S", miles: 70 },
  WPXM: { roads: null, miles: 0 },
  WTXL: { roads: "FL Turnpike, I-75 N, I-10 W", miles: 470 },
  KATC: { roads: "I-10 W", miles: 500 },
  KPXB: { roads: "I-10 W", miles: 210 },
  KRIS: { roads: "US-59 S, I-37 S", miles: 210 },
  KZTV: { roads: null, miles: 0 },
  KRHD: { roads: "US-77 N, TX-36", miles: 240 },
  KXXV: { roads: "TX-6 N to I-35", miles: 100 },
  KPXD: { roads: "I-35 E", miles: 100 },
  KJRH: { roads: "I-35 N, Turner Turnpike", miles: 260 },
  KSHB: { roads: "I-44, US-71", miles: 250 },
  KMTV: { roads: "I-29 N", miles: 190 },
  KPXM: { roads: "I-80 E, I-35 N", miles: 390 },
  WGBA: { roads: "I-94 E, I-43 N", miles: 280 },
  WACY: { roads: null, miles: 0 },
  WTMJ: { roads: "I-43 S", miles: 120 },
  WCPX: { roads: "I-94 S", miles: 90 },
  WXMI: { roads: "I-94 E to I-196 N", miles: 180 },
  WSYM: { roads: "I-96 E", miles: 70 },
  WXYZ: { roads: "I-96 E", miles: 90 },
  WMYD: { roads: null, miles: 0 },
  WEWS: { roads: "I-80 E, I-90 E", miles: 170 },
  WKBW: { roads: "I-90 E", miles: 190 },
  WBPX: { roads: "I-90 E (Mass Pike)", miles: 450 },
  WPXN: { roads: "I-95 S, I-84 W", miles: 215 },
  WPPX: { roads: "NJ Turnpike, I-95 S", miles: 95 },
  WMAR: { roads: "I-95 S", miles: 100 },
  BEE:  { roads: "I-95 S, I-295", miles: 40 },
  WPXW: { roads: null, miles: 0 },
  WTVR: { roads: "I-95 S", miles: 110 },
  WTKR: { roads: "I-64 E", miles: 95 },
  WGNT: { roads: null, miles: 0 },
  WRTV: { roads: "I-64 W, I-77 N, I-70 W", miles: 700 },
  KOAA: { roads: "I-70 W, I-25 S", miles: 1060 },
  KMGH: { roads: "I-25 N", miles: 70 },
  KCDO: { roads: null, miles: 0 },
  KTVQ: { roads: "I-25 N, I-90 E", miles: 550 },
  KBZK: { roads: "I-90 W", miles: 140 },
  KXLF: { roads: "I-90 W", miles: 80 },
  KTVH: { roads: "I-15 N", miles: 65 },
  KXLH: { roads: null, miles: 0 },
  KRTV: { roads: "I-15 N", miles: 90 },
  KTGF: { roads: null, miles: 0 },
  KPAX: { roads: "I-15 S, I-90 W", miles: 250 },
  KIVI: { roads: "I-90 W, I-15 S, I-84 W", miles: 390 },
  KSAW: { roads: "I-84 E", miles: 130 },
  KSTU: { roads: "I-84 E, I-86, I-15 S", miles: 220 },
  KUPX: { roads: null, miles: 0 },
  KTNV: { roads: "I-15 S", miles: 420 },
  KMCC: { roads: null, miles: 0 },
  KNXV: { roads: "US-93 S, I-10 E", miles: 300 },
  KASW: { roads: null, miles: 0 },
  KGUN: { roads: "I-10 SE", miles: 115 },
  KWBA: { roads: null, miles: 0 },
  KGTV: { roads: "I-10 W, I-8 W", miles: 405 },
  KPXN: { roads: "I-5 N", miles: 120 },
  KERO: { roads: "I-5 N, CA-99", miles: 110 },
  KSBY: { roads: "CA-46 W, US-101 N", miles: 160 },
  KKPX: { roads: "US-101 N", miles: 230 },
  KSPX: { roads: "I-80 E", miles: 90 },
  KPXG: { roads: "I-5 N", miles: 580 },
  KWPX: { roads: "I-5 N", miles: 175 },
};

export function getAffilColor(type) {
  const m = {
    abc: "#ffffff", nbc: "#4A9CFF", cbs: "#6FB5FF", fox: "#F37021",
    ion: "#F58220", ind: "#B9B0A0", hq: "#FFB81C", event: "#FFB81C",
    inyo: "#9B59B6",
  };
  return m[type] || "#ffffff";
}

export function affilLabel(t) {
  const m = { abc: "ABC", nbc: "NBC", cbs: "CBS", fox: "Fox", ion: "Ion",
              ind: "Independent", hq: "HQ / Operations", event: "Event",
              inyo: "INYO (Pending)" };
  return m[t] || t;
}

export function fmtLat(l) { return `${Math.abs(l).toFixed(3)}\u00B0${l >= 0 ? "N" : "S"}`; }
export function fmtLon(l) { return `${Math.abs(l).toFixed(3)}\u00B0${l >= 0 ? "E" : "W"}`; }
