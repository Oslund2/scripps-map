import { useState, useEffect, useMemo } from 'react';
import Globe from './Globe';
import { getAffilColor, affilLabel, TOUR_VIA } from '../data/stations';
import { MARKETS, getTopOpportunities, CATEGORY_META } from '../data/markets';

export default function TVMonitor({
  stations, tourStations, landGeo,
  focusIdx, rotation, zoom, playing,
  current, nextStation,
  onStationClick, setFocusIdx, setPlaying, onExit
}) {
  const color = current ? getAffilColor(current.type) : '#FFB81C';
  const topOpps = useMemo(() => getTopOpportunities(), []);
  const [oppIdx, setOppIdx] = useState(0);

  // Map callsign → market for context-aware spotlight
  const callsignToMarket = useMemo(() => {
    const map = {};
    for (const m of MARKETS) {
      for (const c of [...m.stations.scripps, ...m.stations.inyo]) {
        map[c] = m;
      }
    }
    return map;
  }, []);

  // Current station's market (if any)
  const currentMarket = current ? callsignToMarket[current.callsign] : null;

  // Rotate fallback M&A spotlight every 8 seconds (only when no market match)
  useEffect(() => {
    if (currentMarket || topOpps.length === 0) return;
    const id = setInterval(() => setOppIdx(i => (i + 1) % topOpps.length), 8000);
    return () => clearInterval(id);
  }, [topOpps.length, currentMarket]);
  const via = current ? TOUR_VIA[current.callsign] : null;
  const logoSrc = current?.logo ? `/assets/stations/${current.logo}` : null;
  const progress = tourStations.length ? ((focusIdx + 1) / tourStations.length) * 100 : 0;

  return (
    <div className="tv-monitor">
      {/* Full-screen globe */}
      <div className="tv-globe">
        <Globe
          stations={stations}
          landGeo={landGeo}
          route={tourStations}
          focusIdx={focusIdx}
          rotation={rotation}
          zoom={zoom}
          onStationClick={onStationClick}
          selected={current?.callsign}
          showLogos={true}
        />
      </div>

      {/* Vignette overlay */}
      <div className="tv-vignette" />

      {/* Top chrome */}
      <div className="tv-top">
        <div className="tv-brand">
          <svg viewBox="0 0 100 100" width="44" height="44" className="tv-brand-icon">
            <rect width="100" height="100" rx="6" fill="#0A5EB0" />
            <g stroke="#fff" strokeWidth="3.2" strokeLinecap="round">
              <line x1="50" y1="34" x2="7" y2="7" />
              <line x1="50" y1="34" x2="4" y2="19" />
              <line x1="50" y1="34" x2="4" y2="34" />
              <line x1="50" y1="34" x2="7" y2="50" />
              <line x1="50" y1="34" x2="93" y2="7" />
              <line x1="50" y1="34" x2="96" y2="19" />
              <line x1="50" y1="34" x2="96" y2="34" />
              <line x1="50" y1="34" x2="93" y2="50" />
            </g>
            <polygon points="50,22 41,36 59,36" fill="#fff" />
            <polygon points="44,36 56,36 54,78 46,78" fill="#fff" />
            <rect x="36" y="78" width="28" height="6" rx="1" fill="#fff" />
          </svg>
          <div>
            <div className="tv-brand-title">SCRIPPS</div>
            <div className="tv-brand-sub">Coast-to-coast station tour</div>
          </div>
        </div>
        <div className="tv-top-right">
          <div className="tv-live-badge">
            <span className="tv-live-dot" />
            {playing ? 'AUTO' : 'PAUSED'}
          </div>
          <button className="tv-exit-btn" onClick={onExit} title="Exit TV Monitor (Esc)">
            EXIT
          </button>
        </div>
      </div>

      {/* M&A Spotlight — context-aware: shows current station's market when available */}
      {(() => {
        const mkt = currentMarket || (topOpps.length > 0 ? topOpps[oppIdx] : null);
        if (!mkt) return null;
        const meta = CATEGORY_META[mkt.category];
        const isContextual = !!currentMarket;
        const totalStns = mkt.stations.scripps.length + mkt.stations.inyo.length;
        // Build reason for contextual markets
        let reason = mkt.reason;
        if (isContextual && !reason) {
          if (mkt.category === 'existing') reason = `Existing duopoly — ${mkt.voices} voices, $${mkt.estRevenueM}M market`;
          else if (mkt.category === 'expanded') reason = `INYO expands duopoly to ${totalStns} stations`;
          else if (mkt.category === 'new_duopoly') reason = `INYO creates new duopoly — ${mkt.voices} voices, ~$${mkt.estRevenueM}M revenue`;
          else if (mkt.category === 'opportunity') reason = `Single-station market — ${mkt.voices} voices, ripe for duopoly`;
          else if (mkt.category === 'new_market') reason = `INYO beachhead — future duopoly base`;
          if (mkt.politicalSwing) reason += ' (swing market)';
        }
        return (
          <div className="tv-ma-spotlight" key={mkt.id + '-' + (isContextual ? 'ctx' : oppIdx)}>
            <div className="tv-ma-header">
              <span className="tv-ma-beacon" />
              <span className="tv-ma-label">{isContextual ? 'THIS MARKET' : 'M&A SPOTLIGHT'}</span>
              {!isContextual && <span className="tv-ma-idx">{oppIdx + 1}/{topOpps.length}</span>}
            </div>
            <div className="tv-ma-market">{mkt.name}</div>
            <div className="tv-ma-stats">
              <span>DMA #{mkt.dmaRank}</span>
              <span>{'\u00B7'}</span>
              <span>{mkt.tvHouseholds ? (mkt.tvHouseholds / 1000).toFixed(0) + 'K HH' : ''}</span>
              <span>{'\u00B7'}</span>
              <span>${mkt.estRevenueM}M/yr</span>
            </div>
            <div className="tv-ma-badge" style={{ background: meta.color }}>{meta.label}</div>
            <div className="tv-ma-reason">{reason}</div>
            {isContextual && (
              <div className="tv-ma-stations">
                {mkt.stations.scripps.map(c => <span key={c} className="tv-ma-stn tv-ma-stn-scripps">{c}</span>)}
                {mkt.stations.inyo.map(c => <span key={c} className="tv-ma-stn tv-ma-stn-inyo">{c}</span>)}
              </div>
            )}
          </div>
        );
      })()}

      {/* Lower third */}
      {current && (
        <div className="tv-lower-third" key={current.callsign}>
          <div className="tv-l3-accent" />
          <div className="tv-l3-body">
            <div className="tv-l3-logo">
              {logoSrc ? (
                <img src={logoSrc} alt={current.callsign} />
              ) : (
                <div className="tv-l3-logo-text">
                  <span className="tv-l3-logo-call">{current.callsign}</span>
                  <span className="tv-l3-logo-type" style={{ color }}>{affilLabel(current.type)}</span>
                </div>
              )}
            </div>
            <div className="tv-l3-info">
              <div className="tv-l3-kicker" style={{ color }}>{affilLabel(current.type)}</div>
              <div className="tv-l3-title">{current.affiliation}</div>
              <div className="tv-l3-city">{current.city}, {current.state}</div>
              {via?.roads && (
                <div className="tv-l3-route">{'\u2192'} {via.roads} {'\u00B7'} {via.miles} mi</div>
              )}
            </div>
            <div className="tv-l3-step">
              <div className="tv-l3-num">{focusIdx + 1}</div>
              <div className="tv-l3-of">/ {tourStations.length}</div>
            </div>
          </div>
          <div className="tv-l3-footer">
            <div className="tv-l3-bar">
              <i style={{ width: `${progress}%` }} />
            </div>
            {nextStation && (
              <div className="tv-l3-next">
                Next {'\u2192'} <b>{nextStation.callsign}</b> {'\u00B7'} {nextStation.city}, {nextStation.state}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Playback controls */}
      <div className="tv-controls">
        <button onClick={() => setFocusIdx(i => Math.max(0, i - 1))} title="Previous">
          {'\u25C2'}
        </button>
        <button className="tv-play" onClick={() => setPlaying(p => !p)} title={playing ? "Pause" : "Play"}>
          {playing ? '\u275A\u275A' : '\u25B8'}
        </button>
        <button onClick={() => setFocusIdx(i => Math.min(tourStations.length - 1, i + 1))} title="Next">
          {'\u25B8'}
        </button>
      </div>
    </div>
  );
}
