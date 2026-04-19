export default function TopBar({ stationCount, tourCount, view, onView }) {
  return (
    <header className="top-bar">
      <div className="tb-brand">
        <svg viewBox="0 0 40 40" width="28" height="28" className="tb-lh">
          <rect x="17" y="10" width="6" height="20" fill="#0B2545" />
          <polygon points="20,4 14,12 26,12" fill="#0B2545" />
          <circle cx="20" cy="15" r="3" fill="#FFB81C" />
          <line x1="20" y1="15" x2="36" y2="7" stroke="#FFB81C" strokeWidth="1.5" opacity="0.6"/>
          <line x1="20" y1="15" x2="4" y2="7" stroke="#FFB81C" strokeWidth="1.5" opacity="0.6"/>
          <rect x="12" y="30" width="16" height="3" fill="#0B2545" />
        </svg>
        <div>
          <div className="tb-title">Scripps Map</div>
          <div className="tb-sub">Give light. From Cincinnati, coast to coast.</div>
        </div>
      </div>
      <div className="tb-stats">
        <div><b>{stationCount}</b><span>stations</span></div>
        <div><b>{tourCount}</b><span>tour stops</span></div>
        <div><b>40+</b><span>markets</span></div>
      </div>
      <nav className="tb-tabs">
        <button className={view === "globe" ? "on" : ""} onClick={() => onView("globe")}>Globe</button>
        <button className={view === "tour"  ? "on" : ""} onClick={() => onView("tour")}>Driving Tour</button>
        <button className={view === "list"  ? "on" : ""} onClick={() => onView("list")}>Station List</button>
      </nav>
    </header>
  );
}
