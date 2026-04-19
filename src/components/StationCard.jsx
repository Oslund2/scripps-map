import { getAffilColor, affilLabel, fmtLat, fmtLon, TOUR_VIA } from '../data/stations';

export default function StationCard({ station, stepLabel, onNext, onPrev, onPlayPause, playing }) {
  if (!station) return null;
  const logoSrc = station.logo ? `/assets/stations/${station.logo}` : null;
  const color = getAffilColor(station.type);
  const via = TOUR_VIA[station.callsign];
  return (
    <div className="station-card">
      <div className="sc-step">
        <span className="eyebrow">Stop {stepLabel}</span>
        <div className="sc-step-ctrl">
          <button className="hud-btn" onClick={onPrev} aria-label="Previous">{'\u25C2'}</button>
          <button className="hud-btn hud-play" onClick={onPlayPause} aria-label={playing ? "Pause" : "Play"}>
            {playing ? "\u275A\u275A" : "\u25B8"}
          </button>
          <button className="hud-btn" onClick={onNext} aria-label="Next">{'\u25B8'}</button>
        </div>
      </div>

      <div className="sc-main">
        <div className="sc-logo-wrap" style={{ borderColor: color }}>
          {logoSrc ? (
            <img src={logoSrc} alt={station.callsign} />
          ) : (
            <div className="sc-logo-fallback">
              <div className="sc-logo-call">{station.callsign}</div>
              <div className="sc-logo-aff" style={{ color }}>{affilLabel(station.type)}</div>
            </div>
          )}
        </div>

        <div className="sc-meta">
          <div className="kicker" style={{ color }}>{affilLabel(station.type)} {'\u00B7'} {station.callsign}</div>
          <h2 className="sc-title">{station.affiliation}</h2>
          <div className="sc-loc">{station.city}, {station.state}</div>
          {via && via.roads && (
            <div className="sc-route">
              <span className="sc-route-icon">{'\u2192'}</span>
              <span>{via.roads}</span>
              {via.miles > 0 && <span className="sc-route-mi">{via.miles} mi</span>}
            </div>
          )}
          {station.notes && <div className="sc-notes">{station.notes}</div>}
          <div className="sc-coords">
            <span>{fmtLat(station.lat)}</span>
            <span className="dot">{'\u00B7'}</span>
            <span>{fmtLon(station.lon)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
