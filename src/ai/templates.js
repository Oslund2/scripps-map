export function getTemplates(regulatoryMode = 'current') {
  const isDeregulated = regulatoryMode === 'deregulated';

  return [
    {
      id: 'swap',
      label: 'Swap Analyzer',
      prompt: isDeregulated
        ? 'Analyze this station swap: Scripps trades WMAR (Baltimore, ABC) to Nexstar in exchange for their CW affiliate WUXP in Nashville. With no FCC ownership caps, evaluate strategic impact for both parties, estimated deal value, consolidation leverage gained, and any DOJ antitrust concerns.'
        : 'Analyze this station swap: Scripps trades WMAR (Baltimore, ABC) to Nexstar in exchange for their CW affiliate WUXP in Nashville. Evaluate FCC compliance for both parties, strategic impact, estimated deal value, and regulatory risk.',
      placeholder: true,
    },
    {
      id: 'gap',
      label: 'Market Gaps',
      prompt: isDeregulated
        ? 'Score the top 10 consolidation targets across all Scripps markets. Without ownership caps, identify EVERY acquirable station in each market (not just one for a duopoly). Rank by: market size, number of stations Scripps could acquire, total revenue uplift from full market consolidation, affiliation value, and strategic fit. For each market, estimate the maximum station cluster Scripps could build.'
        : 'Score the top 10 acquisition targets across all Scripps single-station "opportunity" markets. For each, identify the best independent, CW, or secondary station to acquire for a duopoly. Rank by: market size, FCC feasibility (voice count), affiliation value, and strategic fit. Include likely seller and estimated difficulty.',
      placeholder: false,
    },
    {
      id: 'risk',
      label: isDeregulated ? 'Opportunity Score' : 'Risk Score',
      prompt: isDeregulated
        ? 'Score the consolidation opportunity (LOW/MEDIUM/HIGH) for every Scripps market, including INYO acquisition markets. For each market, evaluate: number of acquirable stations beyond current holdings, potential revenue uplift from full consolidation, competitive moat creation (what % of market would Scripps control?), political ad inventory gain, and DOJ antitrust exposure. Flag the 3 highest-opportunity markets and recommend an acquisition sequence.'
        : 'Score the regulatory risk (LOW/MEDIUM/HIGH) for every current and planned Scripps duopoly, including INYO acquisition markets. For each market, evaluate: voice count margin above 8, top-4 exposure, grandfathering dependency, and likelihood of FCC challenge. Flag the 3 most at-risk markets and recommend mitigation strategies.',
      placeholder: false,
    },
    {
      id: 'merger',
      label: 'Best Merger',
      prompt: isDeregulated
        ? 'Of all major broadcast groups (Nexstar, Sinclair, Gray, Tegna, Hearst, Cox, Graham, Hubbard), which single group would create the most shareholder value if merged with Scripps? With no FCC ownership caps, evaluate: combined revenue & reach, consolidation synergies (no divestitures required), multi-station cluster depth in top markets, stock price upside, and DOJ antitrust feasibility. Rank the top 3 candidates with deal value estimates and expected stock reaction. Also identify the single worst merger target and explain why.'
        : 'Of all major broadcast groups (Nexstar, Sinclair, Gray, Tegna, Hearst, Cox, Graham, Hubbard), which single group would create the most shareholder value if merged with Scripps? Evaluate: combined revenue & reach, FCC overlap/divestiture count, synergy potential, stock price upside, and regulatory feasibility. Rank the top 3 candidates with deal value estimates and expected stock reaction. Also identify the single worst merger target and explain why.',
      placeholder: false,
    },
    {
      id: 'compare',
      label: 'Compare Scenarios',
      prompt: 'Compare the current FCC regulatory environment vs. a deregulated (no ownership cap) environment for Scripps. For the top 5 Scripps markets by revenue: (1) Under CURRENT FCC rules, what is the maximum feasible consolidation and what are the regulatory constraints? (2) Under NO OWNERSHIP CAPS, what additional stations could Scripps acquire and what would full consolidation look like? (3) Revenue delta between the two scenarios. Present as a comparison table, then provide a total portfolio-level impact estimate.',
      placeholder: true,
    },
  ];
}
