export const TEMPLATES = [
  {
    id: 'swap',
    label: 'Swap Analyzer',
    prompt: 'Analyze this station swap: Scripps trades [STATION] in [MARKET] to [COMPANY] in exchange for their [STATION] in [MARKET]. Evaluate FCC compliance for both parties, strategic impact, and regulatory risk.',
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
];
