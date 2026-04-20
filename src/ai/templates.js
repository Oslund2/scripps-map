export const TEMPLATES = [
  {
    id: 'swap',
    label: 'Swap Analyzer',
    prompt: 'Analyze this station swap: Scripps trades WMAR (Baltimore, ABC) to Nexstar in exchange for their CW affiliate WUXP in Nashville. Evaluate FCC compliance for both parties, strategic impact, estimated deal value, and regulatory risk.',
    placeholder: true,
  },
  {
    id: 'gap',
    label: 'Market Gaps',
    prompt: 'Score the top 10 acquisition targets across all Scripps single-station "opportunity" markets. For each, identify the best independent, CW, or secondary station to acquire for a duopoly. Rank by: market size, FCC feasibility (voice count), affiliation value, and strategic fit. Include likely seller and estimated difficulty.',
    placeholder: false,
  },
  {
    id: 'risk',
    label: 'Risk Score',
    prompt: 'Score the regulatory risk (LOW/MEDIUM/HIGH) for every current and planned Scripps duopoly, including INYO acquisition markets. For each market, evaluate: voice count margin above 8, top-4 exposure, grandfathering dependency, and likelihood of FCC challenge. Flag the 3 most at-risk markets and recommend mitigation strategies.',
    placeholder: false,
  },
  {
    id: 'merger',
    label: 'Best Merger',
    prompt: 'Of all major broadcast groups (Nexstar, Sinclair, Gray, Tegna, Hearst, Cox, Graham, Hubbard), which single group would create the most shareholder value if merged with Scripps? Evaluate: combined revenue & reach, FCC overlap/divestiture count, synergy potential, stock price upside, and regulatory feasibility. Rank the top 3 candidates with deal value estimates and expected stock reaction. Also identify the single worst merger target and explain why.',
    placeholder: false,
  },
];
