import { useState, useRef, useEffect } from 'react';
import useSwapAnalyzer from '../hooks/useSwapAnalyzer';
import { TEMPLATES } from '../ai/templates';

function renderCitations(text) {
  // Escape HTML, then style citation markers and basic markdown
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\(i(\d)\)/g, '<sup class="ai-cite" title="Source $1">i$1</sup>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<div class="ai-h3">$1</div>')
    .replace(/^## (.+)$/gm, '<div class="ai-h2">$1</div>')
    .replace(/^&gt; \[(.+?)\]\((.+?)\)$/gm, '<div class="ai-source"><a href="$2" target="_blank" rel="noopener">$1</a></div>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="ai-link">$1</a>')
    .replace(/^---$/gm, '<hr class="ai-hr" />')
    .replace(/\n/g, '<br/>');
  return html;
}

function buildSelectionPrompt(stations) {
  const list = stations.map((s, i) => {
    const ours = s.type === 'scripps' || s.type === 'inyo';
    return `${i + 1}. **${s.callsign}** — ${s.network || 'Unknown'} affiliate, ${s.dmaName || s.city + ', ' + s.state} (DMA #${s.dmaRank || '?'}), owned by ${s.owner}${ours ? ' [SCRIPPS]' : ''}`;
  }).join('\n');
  return `Analyze these ${stations.length} stations I've selected on the map:\n\n${list}\n\nFor Scripps, evaluate:\n- Which of these could Scripps acquire to form/expand a duopoly?\n- FCC compliance for each potential combination (top-4 + 8-voice tests)\n- Estimated deal value using DMA revenue benchmarks\n- Multi-party swap scenarios if direct acquisition isn't feasible\n- Regulatory risk rating (LOW/MEDIUM/HIGH) for each scenario\n- Recommended best move\n\nCite all data points with (i1)-(i5) markers.`;
}

function buildMergerPrompt(stations) {
  // Group all stations by owner group
  const byOwner = {};
  for (const s of stations) {
    (byOwner[s.owner] = byOwner[s.owner] || []).push(s);
  }
  const groups = Object.keys(byOwner);

  // Build station summary per group, grouped by DMA
  let groupSections = '';
  for (const group of groups) {
    const stns = byOwner[group];
    const byDma = {};
    for (const s of stns) {
      const key = s.dmaName || s.city + ', ' + s.state;
      (byDma[key] = byDma[key] || []).push(s);
    }
    const dmas = Object.entries(byDma).sort((a, b) => (a[1][0]?.dmaRank || 999) - (b[1][0]?.dmaRank || 999));
    groupSections += `\n### ${group} (${stns.length} stations, ${dmas.length} markets)\n`;
    for (const [dma, dStns] of dmas.slice(0, 20)) {
      const rank = dStns[0]?.dmaRank || '?';
      const nets = dStns.map(s => `${s.callsign} ${s.network || '?'}`).join(', ');
      groupSections += `- **${dma}** (#${rank}): ${nets}\n`;
    }
    if (dmas.length > 20) groupSections += `- ... and ${dmas.length - 20} more markets\n`;
  }

  return `## Full Merger Analysis: ${groups.join(' + ')}

Analyze a hypothetical full merger of these ${groups.length} broadcast groups:
${groupSections}

Provide a comprehensive M&A analysis:

**1. Combined Portfolio Overview**
- Total station count, market reach (% US TV households), and combined revenue estimate
- How this combined entity would rank among US broadcast groups (vs Nexstar, Sinclair, Gray, etc.)

**2. Regulatory / FCC Analysis**
- Identify ALL overlapping DMAs where the merged entity would own 2+ stations
- For each overlap: run FCC compliance (top-4 test + 8-voice test)
- Which stations would need to be divested to gain approval?
- Estimate total divestiture count and revenue impact

**3. Financial Value Creation**
- Combined estimated annual revenue (ad + retransmission)
- Synergies: duplicate elimination, shared sales, retrans leverage, combined political ad inventory
- Estimate accretive value (% revenue uplift from synergies)
- Pro-forma valuation using broadcast M&A multiples

**4. Stock Market / Shareholder Impact**
- Historical precedent from similar broadcast mergers (Nexstar-Tribune, Gray-Raycom, Scripps-ION)
- Expected stock price reaction range (based on deal premium, synergy estimates, and market conditions)
- Likely acquirer vs target dynamics — who buys whom and at what premium?
- Timeline estimate for regulatory approval

**5. Strategic Rating**
- Overall deal attractiveness: 1-10 score with rationale
- Top 3 markets where the merger creates the most value
- Top 3 markets with the highest regulatory risk
- Recommended deal structure (full merger vs partial swap vs asset purchase)

Cite all data points with (i1)-(i5) markers.`;
}

function buildDealsPrompt(stations) {
  const byOwner = {};
  for (const s of stations) {
    (byOwner[s.owner] = byOwner[s.owner] || []).push(s);
  }
  const groups = Object.keys(byOwner);

  let groupSections = '';
  for (const group of groups) {
    const stns = byOwner[group];
    const byDma = {};
    for (const s of stns) {
      const key = s.dmaName || s.city + ', ' + s.state;
      (byDma[key] = byDma[key] || []).push(s);
    }
    const dmas = Object.entries(byDma).sort((a, b) => (a[1][0]?.dmaRank || 999) - (b[1][0]?.dmaRank || 999));
    groupSections += `\n### ${group} (${stns.length} stations, ${dmas.length} markets)\n`;
    for (const [dma, dStns] of dmas.slice(0, 20)) {
      const rank = dStns[0]?.dmaRank || '?';
      const nets = dStns.map(s => `${s.callsign} ${s.network || '?'}`).join(', ');
      groupSections += `- **${dma}** (#${rank}): ${nets}\n`;
    }
    if (dmas.length > 20) groupSections += `- ... and ${dmas.length - 20} more markets\n`;
  }

  // Pre-compute DMA overlaps
  const dmasByGroup = {};
  for (const group of groups) {
    dmasByGroup[group] = new Set(byOwner[group].map(s => s.dmaName || s.city + ', ' + s.state));
  }
  let overlapSection = '\n### DMA Overlaps (where deals are most likely)\n';
  const allDmas = new Set(stations.map(s => s.dmaName || s.city + ', ' + s.state));
  let overlapCount = 0;
  for (const dma of allDmas) {
    const presentIn = groups.filter(g => dmasByGroup[g].has(dma));
    if (presentIn.length >= 2) {
      overlapCount++;
      const stnsInDma = stations.filter(s => (s.dmaName || s.city + ', ' + s.state) === dma);
      const detail = stnsInDma.map(s => `${s.callsign} (${s.owner}, ${s.network || '?'})`).join(', ');
      overlapSection += `- **${dma}**: ${presentIn.join(' + ')} — ${detail}\n`;
    }
  }
  if (overlapCount === 0) overlapSection += '- No direct DMA overlaps found\n';

  return `## Deal Analysis: ${groups.join(' / ')}

These ${groups.length} groups are NOT merging. Identify the best station-level DEALS between them — swaps, sales, and acquisitions that create value for ALL parties.
${groupSections}
${overlapSection}

**Find and rank the best deals:**

**1. Swaps** — Group A trades station X to Group B for station Y. Look for: one group has a standalone in a market where another already has presence (duopoly play for the receiver). Each swap should be value-balanced or include a cash kicker.

**2. Sales** — Group A sells a non-core station to Group B who can use it. Look for: small standalones with no duopoly path for the seller, but strategic value for a buyer who already has market presence.

**3. Acquisitions** — Group A should buy station X from Group B. Look for: markets where the buyer has a top-4 affiliate and the target is CW/indie/ION (clean FCC path to duopoly).

**For EACH deal provide:**
- Stations involved (callsigns, from whom to whom)
- DMA, market rank, TV households
- Deal type: Swap / Sale / Acquisition
- Estimated deal value (using revenue estimates + broadcast M&A multiples)
- Revenue impact per party (annual ad + retrans change)
- Does it create a new duopoly? For whom?
- FCC compliance: top-4 test + 8-voice test
- Regulatory risk: LOW / MEDIUM / HIGH
- Strategic rationale

**Then rank ALL deals by total value created** across all parties (revenue increases + margin gains + exit price uplift). Show a scorecard table. Identify the single best deal they could execute tomorrow, and flag any deal that should NOT happen.

If deals are complementary, propose a multi-deal package.

Cite data with (i1)-(i5) markers.`;
}

function buildMarketDealPrompt(stations) {
  const dma = stations[0]?._marketDealDma || 'Unknown';
  const groups = stations[0]?._marketDealGroups || [];
  const byOwner = {};
  for (const s of stations) {
    (byOwner[s.owner] = byOwner[s.owner] || []).push(s);
  }
  const rank = stations[0]?.dmaRank || '?';
  let detail = '';
  for (const [owner, stns] of Object.entries(byOwner)) {
    const nets = stns.map(s => `**${s.callsign}** (${s.network || '?'})`).join(', ');
    detail += `- **${owner}**: ${nets}\n`;
  }
  return `## Market Deal Opportunity: ${dma} (DMA #${rank})

${groups.join(' and ')} both have stations in this market:
${detail}
Analyze the best deal these groups could execute in ${dma}:

1. **What's the play?** — Swap, sale, or acquisition? Which station(s) move and to whom?
2. **Duopoly creation** — Does this deal create a new duopoly for either party? Which stations combine?
3. **FCC compliance** — Run top-4 test and 8-voice test for the post-deal market
4. **Deal value** — Estimate using DMA revenue benchmarks and broadcast M&A multiples (label as estimates)
5. **Revenue impact** — Annual ad + retrans change for each party
6. **Regulatory risk** — LOW / MEDIUM / HIGH
7. **Strategic rationale** — Why this deal makes sense (or doesn't)
8. **Alternative scenarios** — If the obvious deal doesn't work, what's plan B?

Search for any recent news about these groups or this market that could affect the deal.

Cite data with (i1)-(i5) markers.`;
}

function buildMarketPrompt(stations) {
  // Group stations by DMA/market
  const byMarket = {};
  for (const s of stations) {
    const key = s.dmaName || s.city + ', ' + s.state;
    (byMarket[key] = byMarket[key] || []).push(s);
  }
  const marketEntries = Object.entries(byMarket);
  let list = '';
  for (const [market, stns] of marketEntries) {
    const rank = stns[0].dmaRank || '?';
    list += `\n**${market}** (DMA #${rank}):\n`;
    for (const s of stns) {
      const ours = s.type === 'scripps' || s.type === 'inyo';
      list += `  - ${s.callsign} — ${s.network || 'Unknown'}, owned by ${s.owner}${ours ? ' [SCRIPPS]' : ''}\n`;
    }
  }
  return `Analyze these ${marketEntries.length} markets I've selected for M&A opportunity:\n${list}\nFor Scripps, evaluate:\n- Cross-market swap scenarios and synergies between these markets\n- FCC compliance for each potential combination (top-4 + 8-voice tests)\n- Estimated deal value using DMA revenue benchmarks\n- Which markets are strongest for duopoly expansion?\n- Regulatory risk rating (LOW/MEDIUM/HIGH) for each scenario\n- Recommended best move and priority order\n\nCite all data points with (i1)-(i5) markers.`;
}

export default function SwapAdvisor({ selectedStations = [], onClearSelection }) {
  const {
    messages, isStreaming, error, apiKeyConfigured,
    sendMessage, clearMessages,
    persona, setPersona,
    additionalInstructions, setAdditionalInstructions,
    getSystemPrompt,
  } = useSwapAnalyzer();
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showRawPrompt, setShowRawPrompt] = useState(false);
  const threadRef = useRef(null);
  const userAtBottom = useRef(true);

  function handleScroll() {
    const el = threadRef.current;
    if (!el) return;
    userAtBottom.current = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
  }

  useEffect(() => {
    const el = threadRef.current;
    if (el && userAtBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
    userAtBottom.current = true;
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handleTemplate(tmpl) {
    if (tmpl.placeholder) {
      setInput(tmpl.prompt);
    } else {
      sendMessage(tmpl.prompt);
      userAtBottom.current = true;
    }
  }

  return (
    <div className="ai-advisor">
      <div className="ai-templates">
        {TEMPLATES.map(t => (
          <button key={t.id} className="ai-template-btn" onClick={() => handleTemplate(t)}
                  disabled={isStreaming}>
            {t.label}
          </button>
        ))}
        {messages.length > 0 && (
          <button className="ai-template-btn ai-clear-btn" onClick={clearMessages}
                  disabled={isStreaming}>
            New
          </button>
        )}
        <button
          className={`ai-template-btn ai-gear-btn ${showSettings ? 'on' : ''}`}
          onClick={() => setShowSettings(v => !v)}
          title="Prompt settings"
        >
          {'\u2699'}
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="ai-settings">
          <div className="ai-settings-field">
            <label className="eyebrow">Analysis Persona</label>
            <input
              type="text"
              className="ai-settings-input"
              placeholder="e.g., neutral industry analyst, investment banker, FCC regulatory counsel"
              value={persona}
              onChange={e => setPersona(e.target.value)}
            />
            <div className="ai-settings-hint">
              Overrides the default "Scripps M&A Advisor" role. Leave blank for default.
            </div>
          </div>
          <div className="ai-settings-field">
            <label className="eyebrow">Additional Instructions</label>
            <textarea
              className="ai-settings-textarea"
              placeholder="e.g., Focus only on political ad revenue upside. Ignore markets under DMA #50. Use conservative 5x multiples."
              value={additionalInstructions}
              onChange={e => setAdditionalInstructions(e.target.value)}
              rows={3}
            />
            <div className="ai-settings-hint">
              Appended to the system prompt. Use this to steer the analysis without editing the core prompt.
            </div>
          </div>
          <div className="ai-settings-field">
            <button className="ai-settings-raw-toggle" onClick={() => setShowRawPrompt(v => !v)}>
              {showRawPrompt ? '\u25B4 Hide' : '\u25BE View'} System Prompt ({(getSystemPrompt().length / 1024).toFixed(0)}KB)
            </button>
            {showRawPrompt && (
              <pre className="ai-settings-raw">{getSystemPrompt()}</pre>
            )}
          </div>
        </div>
      )}

      {/* Station selection bar */}
      {selectedStations.length > 0 && (() => {
        // Detect mode from station flags
        const isMerger = selectedStations[0]?._mergerGroup;
        const isDeals = selectedStations[0]?._dealsMode;
        const isMarketDeal = selectedStations[0]?._marketDeal;

        // Market-specific deal (clicked an overlap badge on globe)
        if (isMarketDeal) {
          const dma = selectedStations[0]._marketDealDma;
          const groups = selectedStations[0]._marketDealGroups;
          const prompt = buildMarketDealPrompt(selectedStations);
          return (
            <div className="ai-selection-bar ai-deals-bar">
              <div className="ai-sel-header">
                <span className="eyebrow">Market Deal: {dma}</span>
                <button className="ai-sel-clear" onClick={onClearSelection}>Clear</button>
              </div>
              <div className="ai-sel-pills">
                {groups.map(g => (
                  <span key={g} className="ai-sel-pill ai-deals-pill"><b>{g}</b></span>
                ))}
                <span className="ai-sel-pill" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  <b>{selectedStations.length}</b>
                  <span className="ai-sel-meta">stations</span>
                </span>
              </div>
              <button className="ai-analyze-btn" disabled={isStreaming}
                      onClick={() => { sendMessage(prompt); userAtBottom.current = true; }}>
                Analyze {dma} Deal
              </button>
            </div>
          );
        }

        if (isMerger || isDeals) {
          const byOwner = {};
          for (const s of selectedStations) {
            (byOwner[s.owner] = byOwner[s.owner] || []).push(s);
          }
          const ownerNames = Object.keys(byOwner);
          const prompt = isDeals ? buildDealsPrompt(selectedStations) : buildMergerPrompt(selectedStations);
          const label = isDeals ? 'Deal Analysis' : 'Merger Analysis';
          const btnLabel = isDeals
            ? `Analyze Deals: ${ownerNames.join(' / ')}`
            : `Analyze ${ownerNames.join(' + ')} Merger`;
          return (
            <div className={`ai-selection-bar ai-merger-bar ${isDeals ? 'ai-deals-bar' : ''}`}>
              <div className="ai-sel-header">
                <span className="eyebrow">{label}</span>
                <button className="ai-sel-clear" onClick={onClearSelection}>Clear</button>
              </div>
              <div className="ai-sel-pills">
                {ownerNames.map(name => (
                  <span key={name} className={`ai-sel-pill ${isDeals ? 'ai-deals-pill' : 'ai-merger-pill'}`}>
                    <b>{name}</b>
                    <span className="ai-sel-meta">{byOwner[name].length} stations</span>
                  </span>
                ))}
              </div>
              <button className="ai-analyze-btn" disabled={isStreaming}
                      onClick={() => { sendMessage(prompt); userAtBottom.current = true; }}>
                {btnLabel}
              </button>
            </div>
          );
        }

        // Group by market for display
        const byMarket = {};
        for (const s of selectedStations) {
          const key = s.dmaName || s.city;
          (byMarket[key] = byMarket[key] || []).push(s);
        }
        const marketNames = Object.keys(byMarket);
        const isMultiMarket = marketNames.length > 1;
        const prompt = isMultiMarket ? buildMarketPrompt(selectedStations) : buildSelectionPrompt(selectedStations);
        return (
          <div className="ai-selection-bar">
            <div className="ai-sel-header">
              <span className="eyebrow">
                {isMultiMarket ? `${marketNames.length} Markets` : `${selectedStations.length} Stations`} Selected
              </span>
              <button className="ai-sel-clear" onClick={onClearSelection}>Clear</button>
            </div>
            <div className="ai-sel-pills">
              {isMultiMarket ? marketNames.map(name => (
                <span key={name} className="ai-sel-pill" style={{ borderColor: 'var(--scripps-beam)' }}>
                  <b>{name}</b>
                  <span className="ai-sel-meta">{byMarket[name].length} stn{byMarket[name].length !== 1 ? 's' : ''}</span>
                </span>
              )) : selectedStations.map((s, i) => (
                <span key={s.callsign} className="ai-sel-pill" style={{ borderColor: s.color }}>
                  <span className="ai-sel-num">{i + 1}</span>
                  <b>{s.callsign}</b>
                  <span className="ai-sel-meta">{s.network} / {s.owner}</span>
                </span>
              ))}
            </div>
            <button className="ai-analyze-btn" disabled={isStreaming}
                    onClick={() => { sendMessage(prompt); userAtBottom.current = true; }}>
              Analyze {isMultiMarket ? `${marketNames.length} Markets` : `${selectedStations.length} Station${selectedStations.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        );
      })()}

      <div className="ai-thread" ref={threadRef} onScroll={handleScroll}>
        {messages.length === 0 && !isStreaming && (
          <div className="ai-empty">
            <div className="ai-empty-title">M&A Advisor</div>
            <div className="ai-empty-sub">
              Ask about swap scenarios, market gaps, or regulatory risk.
              Claude has full access to Scripps station and market data.
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`ai-msg ai-msg-${msg.role}`}>
            <div className="ai-msg-role">{msg.role === 'user' ? 'You' : 'AI Advisor'}</div>
            <div className="ai-msg-text" dangerouslySetInnerHTML={
              msg.role === 'assistant' ? { __html: renderCitations(msg.content) } : undefined
            }>{msg.role === 'user' ? msg.content : undefined}</div>
          </div>
        ))}
        {isStreaming && messages.length > 0 && messages[messages.length - 1].content === '' && (
          <div className="ai-streaming-dot" />
        )}
        {error && <div className="ai-error">{error}</div>}
      </div>

      <form className="ai-input-bar" onSubmit={handleSubmit}>
        <textarea
          className="ai-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe a swap, ask about market gaps..."
          disabled={isStreaming}
          rows={2}
        />
        <button type="submit" className="ai-send-btn" disabled={isStreaming || !input.trim()}>
          {isStreaming ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
