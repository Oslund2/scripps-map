import { useState } from 'react';
import { MARKETS, CATEGORY_META, getMarketStationObjects } from '../data/markets';
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

function MarketRow({ market, onClick }) {
  const meta = CATEGORY_META[market.category];
  const total = market.stations.scripps.length + market.stations.inyo.length;
  return (
    <li className="duo-market-row" onClick={onClick}>
      <span className="duo-row-dot" style={{ background: meta.color }} />
      <span className="duo-row-name">{market.name}</span>
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
  panelTab, onPanelTab, selectedStations, onClearSelection, onAnalyzeMarket
}) {
  const market = selectedMarket ? MARKETS.find(m => m.id === selectedMarket) : null;

  const tabBar = (
    <div className="duo-tab-bar">
      <button className={panelTab === 'markets' ? 'on' : ''} onClick={() => onPanelTab('markets')}>Markets</button>
      <button className={panelTab === 'advisor' ? 'on' : ''} onClick={() => onPanelTab('advisor')}>
        AI Advisor{selectedStations && selectedStations.length > 0 ? ` (${selectedStations.length})` : ''}
      </button>
    </div>
  );

  if (panelTab === 'advisor') {
    return (
      <aside className="right-panel duo-panel">
        {tabBar}
        <SwapAdvisor selectedStations={selectedStations} onClearSelection={onClearSelection} />
      </aside>
    );
  }

  if (market) {
    return (
      <aside className="right-panel duo-panel">
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
    <aside className="right-panel duo-panel">
      {tabBar}
      <div className="duo-overview-head">
        <div className="eyebrow">M&A Analysis</div>
        <h2 className="sc-title" style={{ fontSize: 20 }}>Duopoly Opportunities</h2>
        <p className="duo-overview-sub">
          {filtered.length} markets {'\u00B7'} FCC {'\u00A7'}73.3555(b)
        </p>
      </div>
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
                  <MarketRow key={m.id} market={m} onClick={() => onSelectMarket(m.id)} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
