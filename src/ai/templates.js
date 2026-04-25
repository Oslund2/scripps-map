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
    {
      id: 'endstate',
      label: 'Big 4 + Sports',
      prompt: isDeregulated
        ? 'Map the path to Scripps\'s strategic end state — two Big 4 affiliates + one independent sports station — in every Scripps market, with no FCC ownership restrictions. For each of the 33 Scripps markets: (1) Current state: what Scripps owns and what Big 4 affiliations are missing. (2) Direct acquisition targets: which Big 4 affiliates in the market are acquirable, who owns them, estimated price, and seller motivation. (3) Affiliation optimization: after acquiring multiple stations, should any affiliation be renegotiated for better signal/infrastructure fit? (4) The sports indie play: which station becomes the local sports independent, and what local team broadcast rights are available or acquirable? (5) Total deal cost to reach the end state per market. (6) Priority ranking of all 33 markets by ROI potential and execution speed. Search for recent station sale activity, group divestitures, RSN distress, and local sports rights availability.'
        : 'Map the path to Scripps\'s strategic end state — two Big 4 affiliates + one independent sports station — in every Scripps market, using affiliation switching as the key mechanism under current FCC rules. For each of the 33 Scripps markets: (1) Current state: what Scripps owns and what Big 4 affiliations are missing. (2) The "Acquire, then Affiliate" path: which secondary station (CW/MyNet/indie/ION) could Scripps acquire that passes the FCC top-4 test, and which Big 4 network affiliation could realistically be moved to it? Why would the network agree — what is the incumbent affiliate\'s vulnerability? (3) FCC compliance check on the acquisition step. (4) The sports indie play: which station becomes the local sports independent, and what local team rights are available? (5) Timeline and sequencing: which markets should move first? (6) Risk rating (LOW/MEDIUM/HIGH) for both the acquisition and the affiliation switch. Prioritize the 10 markets with the clearest path to the end state. Search for recent news on affiliation agreement renewals, distressed broadcasters, and local sports rights deals in Scripps markets.',
      placeholder: false,
    },
    {
      id: 'affiliation',
      label: 'Affil. Switches',
      prompt: isDeregulated
        ? 'Even without FCC ownership caps, affiliation switching is a powerful value-creation and competitive disruption tool. Identify the top affiliation optimization opportunities across all 33 Scripps markets. For each opportunity: (1) Switch scenario: which affiliation could move, from which station to which Scripps station, and why? (2) Value creation: how does the switch increase total Scripps portfolio value — better signal, higher ratings potential, stronger retrans position, lower reverse comp costs? (3) Network leverage: which networks would most benefit from consolidating their affiliate relationships with Scripps, and what multi-market deal could Scripps offer? (4) Competitive disruption: which competitor groups would be most damaged by losing affiliations to Scripps, and how does this reshape market competition or force distressed asset sales? (5) Price advantage: where can Scripps acquire a secondary station and switch in a Big 4 affiliation for less than the cost of buying the existing Big 4 affiliate directly? Rank opportunities by net value creation (revenue gain minus acquisition cost). Search for current network strategy news and affiliate relationship developments.'
        : 'Identify the most actionable affiliation switch opportunities across all 33 Scripps markets. For each opportunity, analyze: (1) The target affiliation: which Big 4 network\'s affiliation could move to a Scripps-owned or Scripps-acquirable station? (2) The vulnerable incumbent: who currently holds the affiliation, why are they vulnerable — financial distress, ratings decline, reverse comp disputes, aging infrastructure, or affiliation agreement nearing expiration? (3) The Scripps receiving station: which existing Scripps station or acquirable secondary station would receive the affiliation? Does it have the signal strength, channel position, and news infrastructure to support a Big 4 affiliation? (4) Network incentive: why would the network agree to switch — what does Scripps offer that the incumbent cannot? Consider multi-market retrans leverage, investment commitment, and operational track record. (5) FCC pathway: if Scripps needs to acquire a new station first, does the acquisition pass the top-4 and 8-voice tests? (6) Timing: when do current affiliation agreements likely expire? (7) Probability score: rate each switch opportunity HIGH (>50%), MEDIUM (25–50%), or LOW (<25%). Rank the top 10 switch opportunities by a combined score of probability × revenue impact × strategic value. Search for recent news on network-affiliate disputes, affiliation renewals, and financially distressed broadcasters in Scripps markets.',
      placeholder: false,
    },
  ];
}
