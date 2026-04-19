import { useMemo } from 'react';
import { getAffilColor } from '../data/stations';

export default function StationList({ stations, onPick }) {
  const byState = useMemo(() => {
    const m = {};
    for (const s of stations) { (m[s.state] = m[s.state] || []).push(s); }
    return Object.entries(m).sort((a,b) => a[0].localeCompare(b[0]));
  }, [stations]);

  return (
    <div className="station-list">
      <div className="sl-header">
        <h1 className="h1">Scripps stations</h1>
        <p className="body">A living atlas of every local broadcast operation — click any row to fly the globe to that city.</p>
      </div>
      <div className="sl-grid">
        {byState.map(([state, items]) => (
          <section key={state}>
            <div className="sl-state eyebrow">{state} <span>{items.length}</span></div>
            <ul>
              {items.map(s => (
                <li key={s.callsign} onClick={() => onPick(s)}>
                  <span className="sl-dot" style={{ background: getAffilColor(s.type) }} />
                  <span className="sl-call mono">{s.callsign}</span>
                  <span className="sl-city">{s.city}</span>
                  <span className="sl-aff">{s.affiliation}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
