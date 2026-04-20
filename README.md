# Scripps M&A Intelligence Platform

**AI-powered broadcast television M&A analysis for the E.W. Scripps Company**

Live at **[scripps-map.netlify.app](https://scripps-map.netlify.app)**

---

## What This Tool Does

This platform gives Scripps leadership — M&A specialists, the CFO, and the CEO — an interactive command center for evaluating broadcast television deals. It combines a complete FCC station database with AI-powered analysis to deliver multi-party, multi-market, multi-station M&A recommendations **in seconds** rather than the weeks traditionally required for comparable analysis.

### The Problem It Solves

Evaluating a broadcast M&A scenario today requires analysts to manually cross-reference FCC ownership data, Nielsen DMA rankings, revenue benchmarks, regulatory compliance rules, and competitive landscape intelligence across dozens of markets. A single swap analysis can take days. A full merger evaluation takes weeks. By the time the analysis is complete, market conditions may have changed.

### How It Changes the Game

Select two or three broadcast groups on a map. Click a button. In under 60 seconds, receive a comprehensive analysis that includes:

- **FCC compliance checks** for every affected DMA (Top-4 test + 8-voice test)
- **Station-level deal valuations** using revenue benchmarks and broadcast M&A multiples
- **Divestiture modeling** identifying which stations must be sold to clear regulatory review
- **Revenue and synergy projections** including retransmission consent leverage and political ad inventory
- **Stock market impact estimates** based on historical deal comps (Nexstar-Tribune, Gray-Raycom, Scripps-ION, Nexstar-Tegna)
- **Live news context** — the AI searches the web for the latest headlines about every company in the analysis
- **DMA overlap heatmap** — pulsing red rings on the globe instantly show regulatory conflict zones

---

## Key Capabilities

### Interactive Station Globe
- **1,761 full-power FCC stations** plotted across all 210 US DMAs
- **33 owner groups** color-coded — from Nexstar (197 stations) down to single-station operators
- Click any group to filter the map. Check boxes to select groups for analysis.
- Toggle **Scripps Only** to filter down to the Scripps + ION + INYO portfolio (98 stations)
- All stations load on first view — no extra clicks to see the full competitive landscape

### DMA Overlap Heatmap
When 2+ owner groups are checked, **pulsing red rings** appear on the globe at every DMA where those groups both have stations. These are the regulatory conflict zones — markets where divestitures would be required in a merger, or where swap/acquisition opportunities exist. Visible instantly, before the AI even runs.

### AI Merger Analysis
Select 2-5 owner groups and click **Merger** to analyze a hypothetical full combination:
- Combined portfolio overview and competitive ranking
- Every DMA overlap identified with FCC compliance evaluation
- Divestiture count and revenue impact
- Synergy quantification (cost, revenue, retrans, political)
- Pro-forma valuation and expected stock price reaction
- Strategic attractiveness rating (1-10)

### AI Deal Analysis
Select 2-3 owner groups and click **Deals** to find the best transactions between them:
- **Swaps** — balanced station trades that create duopolies for both parties
- **Sales** — non-core divestitures that unlock value for the buyer
- **Acquisitions** — stations one group should buy from another
- Every deal ranked by total value created across all parties
- Deal scorecard with revenue impact, FCC status, and risk rating
- Multi-deal package recommendations for negotiated bundles

### Pre-Built Analysis Templates
- **Swap Analyzer** — Evaluate a specific station trade scenario
- **Market Gaps** — Score the top 10 acquisition targets across Scripps opportunity markets
- **Risk Score** — Regulatory risk rating for every current and planned Scripps duopoly
- **Best Merger** — Rank all major groups as Scripps merger targets by shareholder value

### Live Web Search
The AI searches for the latest headlines about every company being analyzed — pending mergers, FCC rulings, earnings reports, stock movements, activist investors, and leadership changes. Analysis is grounded in today's reality, not stale data.

### Accuracy Guardrails
All financial estimates are labeled as estimates with their source methodology (DMA tier benchmarks, retrans subscriber math, M&A multiples). The AI is instructed to never fabricate data — if it can't verify a number, it says so. When web search returns no results, it flags the gap rather than guessing. Critical for a tool informing real capital allocation decisions.

### Expandable Focus Mode
Click the expand button on the AI panel to open a centered overlay reading view (720px wide, blurred backdrop). Ideal for watching analysis stream in during presentations or screen-sharing with deal teams. Click the X or backdrop to collapse back.

### Scripps Portfolio
A sortable, filterable table of all 98 Scripps + ION + INYO stations with network affiliation, city, state, and notes. Filter by station type (ABC/NBC/CBS/Fox/ION/Independent/INYO). Accessible via the **Scripps Portfolio** tab.

---

## How to Use

### Spot Overlaps Instantly
1. Open the **M&A Intelligence** tab (default view)
2. **Check the boxes** next to 2+ owner groups in the left panel
3. Pulsing red rings appear on the globe at every overlapping DMA
4. These are your deal opportunity zones

### Evaluate a Full Merger
1. **Check 2-5 groups** (e.g., Scripps + Tegna)
2. Click **Merger** (solid gold button)
3. In the AI panel, click the **Analyze** button
4. Click the **expand icon** (top-right of AI panel) for a centered reading view

### Find the Best Deals Between Groups
1. **Check 2-3 groups** (e.g., Scripps + Sinclair + Gray)
2. Click **Deals** (outlined button)
3. Click **Analyze Deals** in the AI panel
4. The AI identifies every swap, sale, and acquisition opportunity — ranked by value created

### Explore Smaller Groups
Scroll to the bottom of the owner groups list and click **More groups** to reveal 18 additional operators (Capitol, Morgan Murphy, Lilly, Weigel, etc.) that are often strong acquisition candidates for duopoly plays.

### Quick Analysis with Templates
In the AI panel, click any template button (**Swap Analyzer**, **Market Gaps**, **Risk Score**, **Best Merger**) to run a pre-built analysis instantly.

### Filter and Explore
- Click any **group name** (not the checkbox) to filter the globe to just that group's stations
- Toggle **Scripps Only** to see just the Scripps + ION + INYO portfolio
- Use the **search bar** (top) to find any station by callsign, city, or state

### Mobile
On mobile, use the **Groups** tab in the bottom panel to access owner group checkboxes and the merger/deals buttons. Tap any tab to open the panel; tap the arrow to expand for full-screen AI output. The panel starts collapsed so the globe gets maximum screen.

---

## Data Sources

| Source | Coverage |
|---|---|
| FCC TV Query (full-power DT) | 1,761 stations across all 50 states + DC |
| Wikipedia station ownership lists | Tegna, Sinclair, Hearst, Fox/CBS/NBC/ABC O&O verification |
| Nielsen DMA Rankings (2024-25) | TV household counts and market rankings |
| BIA/Pew revenue benchmarks | DMA-tier ad revenue estimates (labeled as estimates) |
| FCC 47 CFR 73.3555(b) | Local television ownership rules |
| Anthropic web search | Real-time headlines and news context |

Station counts reflect full-power (DT) licenses only. Low-power (LD/CD), translators, and digital subchannels are not included. Group totals may differ from company-reported numbers that include these.

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend | React + Vite, D3.js orthographic globe |
| AI Engine | Claude Sonnet (Anthropic API) with streaming + web search |
| Database | Supabase (PostgreSQL) — 1,761 enriched station records |
| Hosting | Netlify (static + serverless functions) |
| API Proxy | Netlify Functions (API keys stay server-side) |

---

*Built for the E.W. Scripps Company. Give light and the people will find their own way.*
