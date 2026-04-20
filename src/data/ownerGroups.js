// Licensee name → owner group mapping for major US TV station groups
// Used to normalize FCC licensee names into recognizable group names.
// Patterns are matched case-insensitively against the licensee field.

export const OWNER_PATTERNS = [
  // Major groups (ordered by size)
  { pattern: /nexstar/i, group: "Nexstar" },
  { pattern: /sinclair/i, group: "Sinclair" },
  { pattern: /gray television/i, group: "Gray" },
  { pattern: /tegna/i, group: "Tegna" },
  { pattern: /hearst/i, group: "Hearst" },
  { pattern: /scripps/i, group: "Scripps" },
  { pattern: /inyo/i, group: "INYO" },
  { pattern: /ion television/i, group: "ION" },
  { pattern: /fox television/i, group: "Fox O&O" },
  { pattern: /cbs broadcasting/i, group: "CBS O&O" },
  { pattern: /nbc telemundo|nbcuniversal/i, group: "NBC O&O" },
  { pattern: /abc holding|disney/i, group: "ABC O&O" },
  { pattern: /univision/i, group: "Univision" },
  { pattern: /telemundo/i, group: "Telemundo" },
  { pattern: /cox media|cox television/i, group: "Cox" },
  { pattern: /hubbard/i, group: "Hubbard" },
  { pattern: /meredith/i, group: "Gray" }, // Gray acquired Meredith TV stations
  { pattern: /tribune/i, group: "Nexstar" }, // Nexstar acquired Tribune
  { pattern: /mission broadcasting/i, group: "Nexstar" }, // Nexstar sidecar
  { pattern: /white knight/i, group: "Nexstar" }, // Nexstar sidecar
  { pattern: /cunningham broadcasting/i, group: "Sinclair" }, // Sinclair sidecar
  { pattern: /deerfield media/i, group: "Sinclair" }, // Sinclair sidecar
  { pattern: /graham media/i, group: "Graham" },
  { pattern: /allen media/i, group: "Allen Media" },
  { pattern: /entravision/i, group: "Entravision" },
  { pattern: /weigel/i, group: "Weigel" },
  { pattern: /block commun/i, group: "Block" },
  { pattern: /quincy media|quincy newspapers/i, group: "Gray" }, // Gray acquired Quincy
  { pattern: /raycom/i, group: "Gray" }, // Gray acquired Raycom
  { pattern: /lkqd|local tv/i, group: "Tegna" },
  { pattern: /emmis/i, group: "Emmis" },
  { pattern: /lockwood/i, group: "Lockwood" },
  { pattern: /saga commun/i, group: "Saga" },
  { pattern: /townsquare/i, group: "Townsquare" },
  { pattern: /public broadcasting|educational|university|state board/i, group: "Public/PBS" },
  { pattern: /religious|faith|christian|daystar|trinity|tbn|cornerstone/i, group: "Religious" },
];

export function mapLicenseeToGroup(licensee) {
  if (!licensee) return "Other";
  for (const { pattern, group } of OWNER_PATTERNS) {
    if (pattern.test(licensee)) return group;
  }
  return "Other";
}

// Color assignments for globe rendering
export const GROUP_COLORS = {
  "Scripps":     "#FFB81C",  // gold
  "INYO":        "#9B59B6",  // purple
  "ION":         "#F58220",  // orange
  "Nexstar":     "#E74C3C",  // red
  "Sinclair":    "#2ECC71",  // green
  "Gray":        "#3498DB",  // blue
  "Tegna":       "#1ABC9C",  // teal
  "Hearst":      "#E67E22",  // dark orange
  "Fox O&O":     "#F39C12",  // amber
  "CBS O&O":     "#2980B9",  // navy
  "NBC O&O":     "#8E44AD",  // violet
  "ABC O&O":     "#C0392B",  // dark red
  "Graham":      "#16A085",  // sea green
  "Cox":         "#D35400",  // rust
  "Hubbard":     "#27AE60",  // forest
  "Allen Media": "#7F8C8D",  // gray
  "Univision":   "#9B59B6",  // purple
  "Entravision": "#8E44AD",  // deep purple
  "Marquee":     "#5D6D7E",  // slate
  "SagamoreHill":"#117A65",  // dark teal
  "Forum":       "#6C3483",  // plum
  "Griffin":     "#1A5276",  // dark blue
  "Lilly":       "#148F77",  // jade
  "Bonneville":  "#1F618D",  // steel blue
  "Block":       "#4A235A",  // aubergine
  "Berkshire Hathaway": "#7B241C", // maroon
  "Capitol":     "#0E6655",  // emerald
  "Bhtv":        "#5B2C6F",  // dark violet
  "Bahakel":     "#784212",  // brown
  "Weigel":      "#1B4F72",  // midnight blue
  "Lockwood":    "#6E2C00",  // chocolate
  "Public/PBS":  "#95A5A6",  // light gray
  "Religious":   "#BDC3C7",  // pale
  "Other":       "#7F8C8D",  // gray
};
