import { useState, useEffect, useMemo } from 'react';
import Globe from './Globe';
import { getAffilColor, affilLabel, TOUR_VIA } from '../data/stations';
import { getTopOpportunities, CATEGORY_META } from '../data/markets';

export default function TVMonitor({
  stations, tourStations, landGeo,
  focusIdx, rotation, zoom, playing,
  current, nextStation,
  onStationClick, setFocusIdx, setPlaying, onExit
}) {
  const color = current ? getAffilColor(current.type) : '#FFB81C';
  const topOpps = useMemo(() => getTopOpportunities(), []);
  const [oppIdx, setOppIdx] = useState(0);

  // Rotate M&A spotlight every 8 seconds
  useEffect(() => {
    if (topOpps.length === 0) return;
    const id = setInterval(() => setOppIdx(i => (i + 1) % topOpps.length), 8000);
    return () => clearInterval(id);
  }, [topOpps.length]);
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

      {/* M&A Spotlight ticker */}
      {topOpps.length > 0 && (() => {
        const opp = topOpps[oppIdx];
        const meta = CATEGORY_META[opp.category];
        return (
          <div className="tv-ma-spotlight" key={opp.id + '-' + oppIdx}>
            <div className="tv-ma-header">
              <span className="tv-ma-beacon" />
              <span className="tv-ma-label">M&A SPOTLIGHT</span>
              <span className="tv-ma-idx">{oppIdx + 1}/{topOpps.length}</span>
            </div>
            <div className="tv-ma-market">{opp.name}</div>
            <div className="tv-ma-stats">
              <span>DMA #{opp.dmaRank}</span>
              <span>{'\u00B7'}</span>
              <span>{opp.tvHouseholds ? (opp.tvHouseholds / 1000).toFixed(0) + 'K HH' : ''}</span>
              <span>{'\u00B7'}</span>
              <span>${opp.estRevenueM}M/yr</span>
            </div>
            <div className="tv-ma-badge" style={{ background: meta.color }}>{meta.label}</div>
            <div className="tv-ma-reason">{opp.reason}</div>
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
