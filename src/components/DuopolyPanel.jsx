import { useState } from 'react';
import { MARKETS, CATEGORY_META, getMarketStationObjects } from '../data/markets';
import { GROUP_COLORS } from '../data/ownerGroups';
import { getAffilColor, affilLabel } from '../data/stations';
import SwapAdvisor from './SwapAdvisor';

function FccBadge({ pass, label }) {
  if (pass === null) return <span className="duo-fcc-pill duo-fcc-na">{label}: TBD</span>;
  return (
    <span className={`duo-fcc-pill ${pass ? "duo-fcc-pass" : "duo-fcc-fail"}`}>
      {label}: {pass ? "PASS" : "FAIL"}
    </span>
  );
}

function MarketDetail({ market, allStations, onBack, onAnalyzeMarket }) {
  const meta = CATEGORY_META[market.category];
  const stationObjs = getMarketStationObjects(market, allStations);
  const scrippsSet = new Set(market.stations.scripps);
  const inyoSet = new Set(market.stations.inyo);

  return (
    <div className="duo-detail">
      <button className="duo-back" onClick={onBack}>{'\u25C2'} All markets</button>
      <div className="duo-detail-head">
        <span className="duo-badge" style={{ background: meta.color }}>{meta.label}</span>
        <span className="duo-dma-rank">DMA #{market.dmaRank}</span>
      </div>
      <h2 className="sc-title">{market.name}</h2>
      <div className="duo-financials">
        {market.tvHouseholds && (
          <div className="duo-fin-row">
            <span>TV Households</span><b>{(market.tvHouseholds / 1000).toFixed(0)}K</b>
          </div>
        )}
        {market.estRevenueM && (
          <div className="duo-fin-row">
            <span>Est. Market Revenue</span><b>${market.estRevenueM}M/yr</b>
          </div>
        )}
        <div className="duo-fin-row">
          <span>Independent Voices</span><b>{market.voices}</b>
        </div>
        {market.politicalSwing && (
          <div className="duo-fin-row duo-swing">
            <span>Political Swing Market</span><b>+25-40% even years</b>
          </div>
        )}
      </div>

      <div className="eyebrow" style={{ marginTop: 16 }}>Stations ({stationObjs.length})</div>
      <ul className="duo-station-list">
        {stationObjs.map(s => {
          const isInyo = inyoSet.has(s.callsign);
          const isScripps = scrippsSet.has(s.callsign);
          return (
            <li key={s.callsign}>
              <span className="sl-dot" style={{ background: getAffilColor(s.type) }} />
              <span className="duo-st-call">{s.callsign}</span>
              <span className="duo-st-aff">{s.affiliation || affilLabel(s.type)}</span>
              {isInyo && <span className="duo-tag duo-tag-inyo">INYO</span>}
              {isScripps && <span className="duo-tag duo-tag-scripps">Scripps</span>}
            </li>
          );
        })}
      </ul>

      <div className="eyebrow" style={{ marginTop: 16 }}>FCC Compliance</div>
      <div className="duo-fcc-row">
        <FccBadge pass={market.fcc.top4Pass} label="Top-4" />
        <FccBadge pass={market.fcc.voices8Pass} label="8-Voice" />
      </div>
      {market.fcc.notes && <div className="duo-fcc-notes">{market.fcc.notes}</div>}

      {market.wasExisting && (
        <div className="duo-existing-note">
          Pre-existing duopoly — INYO adds station(s)
        </div>
      )}

      <button className="duo-analyze-btn" onClick={() => onAnalyzeMarket(market)}>
        Analyze {market.name} with AI Advisor
      </button>
    </div>
  );
}

function MarketRow({ market, onClick, selected, onToggle }) {
  const meta = CATEGORY_META[market.category];
  const total = market.stations.scripps.length + market.stations.inyo.length;
  return (
    <li className={`duo-market-row ${selected ? 'duo-market-row-selected' : ''}`}>
      <span
        className={`duo-row-check ${selected ? 'on' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggle(market); }}
        title="Select for analysis"
      >
        {selected ? '\u2713' : ''}
      </span>
      <span className="duo-row-dot" style={{ background: meta.color }} />
      <span className="duo-row-name" onClick={onClick} style={{ cursor: 'pointer' }}>{market.name}</span>
      <span className="duo-row-rank">#{market.dmaRank}</span>
      <span className="duo-row-count">{total} stn{total !== 1 ? "s" : ""}</span>
      <span className={`duo-row-fcc ${market.fcc.compliant === true ? "pass" : market.fcc.compliant === false ? "fail" : "tbd"}`}>
        {market.fcc.compliant === true ? "\u2713" : market.fcc.compliant === false ? "\u2717" : "\u2014"}
      </span>
    </li>
  );
}

export default function DuopolyPanel({
  selectedMarket, onSelectMarket, allStations, categoryFilter,
  panelTab, onPanelTab, selectedStations, onClearSelection, onAnalyzeMarket,
  selectedMarkets = [], onToggleMarket, onAnalyzeSelectedMarkets,
  // Mobile group selection props
  showAllStations, onToggleAllStations, ownerGroups = [], ownerFilter, onOwnerFilter,
  fccLoading, fccCount, selectedGroups = [], onToggleGroup, onAnalyzeGroups, onAnalyzeDeals,
  panelSize = 'collapsed', onCyclePanel, onSetPanelSize,
}) {
  const market = selectedMarket ? MARKETS.find(m => m.id === selectedMarket) : null;
  const selectedMarketIds = new Set(selectedMarkets.map(m => m.id));
  const [showMoreGroups, setShowMoreGroups] = useState(false);

  // Tapping a tab also opens the panel if collapsed
  const switchTab = (tab) => {
    onPanelTab(tab);
    if (panelSize === 'collapsed') onCyclePanel(); // collapsed → mid
  };

  const tabBar = (
    <div className="duo-tab-bar">
      <button className={panelTab === 'markets' ? 'on' : ''} onClick={() => switchTab('markets')}>Markets</button>
      <button className={panelTab === 'groups' ? 'on' : ''} onClick={() => switchTab('groups')}>
        Groups{selectedGroups.length > 0 ? ` (${selectedGroups.length})` : ''}
      </button>
      <button className={panelTab === 'advisor' ? 'on' : ''} onClick={() => switchTab('advisor')}>
        AI{selectedStations && selectedStations.length > 0 ? ` (${selectedStations.length})` : ''}
      </button>
    </div>
  );

  const sizeClass = panelSize === 'expanded' ? 'duo-panel-expanded' : panelSize === 'mid' ? 'duo-panel-mid' : '';
  const sizeIcon = panelSize === 'collapsed' ? '\u2191' : panelSize === 'mid' ? '\u2191' : '\u2193';
  const sizeTitle = panelSize === 'collapsed' ? 'Open panel' : panelSize === 'mid' ? 'Expand' : 'Collapse';

  // Groups tab — mobile-accessible owner group selection
  if (panelTab === 'groups') {
    return (
      <aside className={`right-panel duo-panel ${sizeClass}`}>
        {tabBar}
        <div className="duo-groups-mobile">
          <button
            className={`duo-toggle-btn ${showAllStations ? 'on' : ''}`}
            onClick={onToggleAllStations}
            style={{ marginBottom: 10 }}
          >
            {fccLoading ? 'Loading...' : showAllStations ? 'Scripps Only' : `Scripps Only (${fccCount} hidden)`}
          </button>

          {showAllStations && ownerGroups.length > 0 && (
            <>
              {selectedGroups.length >= 2 && (
                <div className="duo-merger-bar">
                  <div className="duo-merger-pills">
                    {selectedGroups.map(g => (
                      <span key={g} className="duo-merger-pill" style={{ borderColor: GROUP_COLORS[g] || GROUP_COLORS.Other }}>
                        {g}
                        <span className="duo-merger-x" onClick={() => onToggleGroup(g)}>{'\u00D7'}</span>
                      </span>
                    ))}
                  </div>
                  <div className="duo-merger-btns">
                    <button className="duo-analyze-btn duo-merger-btn" onClick={() => { onAnalyzeGroups(); onPanelTab('advisor'); }}>
                      Merger
                    </button>
                    {selectedGroups.length <= 3 && (
                      <button className="duo-analyze-btn duo-merger-btn duo-deals-btn" onClick={() => { onAnalyzeDeals(); onPanelTab('advisor'); }}>
                        Deals
                      </button>
                    )}
                  </div>
                </div>
              )}
              {selectedGroups.length === 1 && (
                <div className="duo-merger-hint">Select 1 more group to analyze a merger</div>
              )}

              <ul className="duo-groups-list">
                {ownerGroups.slice(0, 15).map(([group, count]) => {
                  const isSelected = selectedGroups.includes(group);
                  const atMax = selectedGroups.length >= 5 && !isSelected;
                  return (
                    <li key={group}
                      className={`duo-groups-row ${isSelected ? 'duo-group-selected' : ''}`}
                      onClick={() => onOwnerFilter(group === ownerFilter ? null : group)}
                    >
                      <span
                        className={`duo-group-cb ${isSelected ? 'checked' : ''} ${atMax ? 'disabled' : ''}`}
                        onClick={(e) => { e.stopPropagation(); if (!atMax) onToggleGroup(group); }}
                      >
                        {isSelected ? '\u2713' : ''}
                      </span>
                      <span className="lg-sw" style={{ background: GROUP_COLORS[group] || GROUP_COLORS.Other }} />
                      <span className="lg-name">{group}</span>
                      <b>{count}</b>
                    </li>
                  );
                })}
                {ownerGroups.length > 15 && (
                  <li className="duo-groups-row duo-more-toggle" onClick={() => setShowMoreGroups(v => !v)}>
                    {showMoreGroups ? '\u25B4 Less' : `\u25BE More groups (${ownerGroups.length - 15})`}
                  </li>
                )}
                {showMoreGroups && ownerGroups.slice(15).map(([group, count]) => {
                  const isSelected = selectedGroups.includes(group);
                  const atMax = selectedGroups.length >= 5 && !isSelected;
                  return (
                    <li key={group}
                      className={`duo-groups-row ${isSelected ? 'duo-group-selected' : ''}`}
                      onClick={() => onOwnerFilter(group === ownerFilter ? null : group)}
                    >
                      <span
                        className={`duo-group-cb ${isSelected ? 'checked' : ''} ${atMax ? 'disabled' : ''}`}
                        onClick={(e) => { e.stopPropagation(); if (!atMax) onToggleGroup(group); }}
                      >
                        {isSelected ? '\u2713' : ''}
                      </span>
                      <span className="lg-sw" style={{ background: GROUP_COLORS[group] || GROUP_COLORS.Other }} />
                      <span className="lg-name">{group}</span>
                      <b>{count}</b>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </aside>
    );
  }

  if (panelTab === 'advisor') {
    const isFocused = panelSize === 'expanded';
    const toggleFocus = () => onSetPanelSize(isFocused ? 'collapsed' : 'expanded');
    return (
      <>
        {isFocused && <div className="duo-focus-backdrop" onClick={toggleFocus} />}
        <aside className={`right-panel duo-panel ${sizeClass} ${isFocused ? 'duo-panel-focus' : ''}`}>
          <div className="duo-panel-head duo-panel-head-always">
            {tabBar}
            <button className="duo-expand-btn duo-expand-btn-always" onClick={toggleFocus} title={isFocused ? 'Collapse' : 'Expand'}>
              {isFocused ? '\u2715' : '\u2922'}
            </button>
          </div>
          <SwapAdvisor selectedStations={selectedStations} onClearSelection={onClearSelection} />
        </aside>
      </>
    );
  }

  if (market) {
    return (
      <aside className={`right-panel duo-panel ${sizeClass}`}>
        {tabBar}
        <MarketDetail market={market} allStations={allStations} onBack={() => onSelectMarket(null)} onAnalyzeMarket={onAnalyzeMarket} />
      </aside>
    );
  }

  // Overview mode — group by category
  const cats = ["expanded", "new_duopoly", "existing", "opportunity", "new_market"];
  const filtered = categoryFilter
    ? MARKETS.filter(m => m.category === categoryFilter)
    : MARKETS;

  const grouped = {};
  for (const m of filtered) {
    (grouped[m.category] = grouped[m.category] || []).push(m);
  }

  return (
    <aside className={`right-panel duo-panel ${sizeClass}`}>
      {tabBar}
      <div className="duo-overview-head">
        <div className="eyebrow">M&A Analysis</div>
        <h2 className="sc-title" style={{ fontSize: 20 }}>Duopoly Opportunities</h2>
        <p className="duo-overview-sub">
          {filtered.length} markets {'\u00B7'} FCC {'\u00A7'}73.3555(b)
          <br />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            Check markets below, then click Analyze
          </span>
        </p>
      </div>

      {/* Analyze bar — shown when markets are checked */}
      {selectedMarkets.length > 0 && (
        <div className="duo-analyze-bar">
          <div className="duo-analyze-pills">
            {selectedMarkets.map(m => (
              <span key={m.id} className="duo-analyze-pill">
                {m.name}
                <span className="duo-analyze-pill-x" onClick={() => onToggleMarket(m)}>{'\u00D7'}</span>
              </span>
            ))}
          </div>
          <button className="duo-analyze-btn" onClick={onAnalyzeSelectedMarkets}>
            Analyze {selectedMarkets.length} Market{selectedMarkets.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      <div className="duo-market-groups">
        {cats.map(cat => {
          const items = grouped[cat];
          if (!items || items.length === 0) return null;
          const meta = CATEGORY_META[cat];
          return (
            <section key={cat}>
              <div className="duo-group-head">
                <span className="duo-row-dot" style={{ background: meta.color }} />
                <span>{meta.label}</span>
                <span className="lg-info" title={meta.tip}>i</span>
                <b>{items.length}</b>
              </div>
              <ul>
                {items.sort((a, b) => a.dmaRank - b.dmaRank).map(m => (
                  <MarketRow
                    key={m.id}
                    market={m}
                    onClick={() => onSelectMarket(m.id)}
                    selected={selectedMarketIds.has(m.id)}
                    onToggle={onToggleMarket}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
