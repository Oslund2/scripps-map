import { useState, useRef, useEffect } from 'react';
import useSwapAnalyzer from '../hooks/useSwapAnalyzer';
import { TEMPLATES } from '../ai/templates';

function renderCitations(text) {
  // Escape HTML, then style citation markers and basic markdown
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\(i(\d)\)/g, '<sup class="ai-cite" title="Source $1">i$1</sup>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<div class="ai-h3">$1</div>')
    .replace(/^## (.+)$/gm, '<div class="ai-h2">$1</div>')
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
    conversations, conversationId,
    sendMessage, clearMessages, loadConversation,
  } = useSwapAnalyzer();
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
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
        {conversations.length > 0 && (
          <button className="ai-template-btn" onClick={() => setShowHistory(h => !h)}
                  style={showHistory ? { borderColor: 'var(--scripps-beam)', color: 'var(--scripps-beam)' } : undefined}>
            History ({conversations.length})
          </button>
        )}
      </div>

      {/* Station selection bar */}
      {selectedStations.length > 0 && (() => {
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

      {showHistory && (
        <div className="ai-history">
          <div className="eyebrow" style={{ marginBottom: 6 }}>Saved Conversations</div>
          {conversations.map(c => (
            <button key={c.id} className="ai-history-row"
                    onClick={() => { loadConversation(c.id); setShowHistory(false); }}
                    style={c.id === conversationId ? { borderColor: 'var(--scripps-beam)' } : undefined}>
              <span className="ai-history-title">{c.title}</span>
              <span className="ai-history-date">{new Date(c.created_at).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
      )}

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
