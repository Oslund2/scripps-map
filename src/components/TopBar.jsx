import { useState, useMemo } from 'react';
import { getAffilColor } from '../data/stations';

export default function TopBar({ stationCount, tourCount, view, onView, allStations, onStationSelect }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const results = useMemo(() => {
    if (!query || !allStations) return [];
    const q = query.toLowerCase();
    return allStations
      .filter(s =>
        s.callsign.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q) ||
        s.affiliation.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, allStations]);

  const handleSelect = (s) => {
    setQuery('');
    setFocused(false);
    onStationSelect?.(s);
  };

  const handleNav = (v) => {
    onView(v);
    setMenuOpen(false);
  };

  const showResults = focused && query && results.length > 0;

  const viewLabel = {
    tour: 'Scripps Tour',
    list: 'Scripps',
    allstations: 'All Stations',
    duopoly: 'M&A',
    tv: 'TV Monitor',
  };

  return (
    <header className="top-bar">
      <div className="tb-brand">
        <svg viewBox="0 0 100 100" width="34" height="34" className="tb-lh">
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
          <div className="tb-title">SCRIPPS</div>
          <div className="tb-sub">Give light and the people will find their own way</div>
        </div>
      </div>
      <div className="tb-search-wrap">
        <input
          className="tb-search"
          type="text"
          placeholder="Search callsign, city, state..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={e => {
            if (e.key === 'Enter' && results.length > 0) handleSelect(results[0]);
            if (e.key === 'Escape') { setQuery(''); e.target.blur(); }
          }}
        />
        {showResults && (
          <ul className="tb-search-list">
            {results.map(s => (
              <li key={s.callsign} onMouseDown={() => handleSelect(s)}>
                <span className="tb-sr-dot" style={{ background: getAffilColor(s.type) }} />
                <span className="tb-sr-call">{s.callsign}</span>
                <span className="tb-sr-city">{s.city}, {s.state}</span>
                <span className="tb-sr-aff">{s.affiliation}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="tb-stats">
        <div><b>1,682</b><span>all stations</span></div>
        {view === 'allstations' ? (
          <>
            <div><b>1,682</b><span>FCC stations</span></div>
            <div><b>27</b><span>owner groups</span></div>
            <div><b>210</b><span>DMAs</span></div>
          </>
        ) : view === 'duopoly' ? (
          <>
            <div><b>80</b><span>Scripps</span></div>
            <div><b>27</b><span>owner groups</span></div>
            <div><b>45</b><span>markets</span></div>
          </>
        ) : view === 'tv' ? (
          <>
            <div><b>80</b><span>Scripps</span></div>
            <div><b>39</b><span>INYO</span></div>
            <div><b>45</b><span>markets</span></div>
          </>
        ) : (
          <>
            <div><b>80</b><span>Scripps</span></div>
            <div><b>{tourCount}</b><span>tour stops</span></div>
            <div><b>45</b><span>markets</span></div>
          </>
        )}
      </div>
      <nav className="tb-tabs">
        <button className={view === "tour"  ? "on" : ""} onClick={() => onView("tour")}>Scripps Tour</button>
        <button className={view === "list"  ? "on" : ""} onClick={() => onView("list")}>Scripps</button>
        <button className={view === "allstations" ? "on" : ""} onClick={() => onView("allstations")}>All Stations</button>
        <button className={view === "duopoly" ? "on" : ""} onClick={() => onView("duopoly")}>M&A</button>
        <button className={"tv-tab" + (view === "tv" ? " on" : "")} onClick={() => onView("tv")}>TV Monitor</button>
      </nav>

      {/* Mobile hamburger + current view label */}
      <button className="tb-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
        <span /><span /><span />
      </button>
      <div className="tb-mobile-label">{viewLabel[view] || 'Scripps'}</div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="tb-mobile-menu">
          <nav className="tb-mobile-nav">
            {Object.entries(viewLabel).map(([v, label]) => (
              <button key={v} className={view === v ? 'on' : ''} onClick={() => handleNav(v)}>
                {label}
              </button>
            ))}
          </nav>
          <div className="tb-mobile-search">
            <input
              type="text"
              placeholder="Search callsign, city..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && results.length > 0) { handleSelect(results[0]); setMenuOpen(false); }
              }}
            />
            {query && results.length > 0 && (
              <ul>
                {results.slice(0, 5).map(s => (
                  <li key={s.callsign} onClick={() => { handleSelect(s); setMenuOpen(false); }}>
                    <span className="tb-sr-dot" style={{ background: getAffilColor(s.type) }} />
                    <b>{s.callsign}</b> {s.city}, {s.state}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
