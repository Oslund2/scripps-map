import { CATEGORY_META, getCategoryCounts } from '../data/markets';
import { GROUP_COLORS } from '../data/ownerGroups';

const CATS = ["existing", "expanded", "new_duopoly", "opportunity", "new_market"];

export default function DuopolyLegend({
  filter, onFilter, counts,
  showAllStations, onToggleAllStations,
  ownerGroups, ownerFilter, onOwnerFilter,
  fccLoading, fccCount
}) {
  const cc = counts || getCategoryCounts();
  return (
    <div className="legend duo-legend">
      <div className="eyebrow">INYO Acquisition</div>
      <div className="duo-deal-badge">
        <div className="duo-deal-row"><b>$54M</b><span>deal value</span></div>
        <div className="duo-deal-row"><b>23</b><span>stations</span></div>
        <div className="duo-deal-row"><b>Feb 2026</b><span>announced</span></div>
      </div>

      {/* All Stations Toggle */}
      <div className="duo-toggle-section">
        <button className={`duo-toggle-btn ${showAllStations ? 'on' : ''}`} onClick={onToggleAllStations}>
          {fccLoading ? 'Loading...' : showAllStations ? `All US Stations (${fccCount})` : 'Show All US Stations'}
        </button>
        {showAllStations && (
          <span className="lg-info duo-fp-info" title="Full-power (DT) stations only. Low-power (LP/Class A), translators, and digital subchannels are not included. Counts may differ from group totals that include these.">i</span>
        )}
      </div>

      {showAllStations && ownerGroups && ownerGroups.length > 0 ? (
        <>
          <div className="eyebrow" style={{ marginTop: 12 }}>Owner Groups</div>
          <ul>
            <li className={!ownerFilter ? "on" : ""} onClick={() => onOwnerFilter(null)}>
              <span className="lg-sw" style={{ background: "linear-gradient(135deg,#E74C3C,#3498DB,#2ECC71)" }} />
              All groups <b>{fccCount}</b>
            </li>
            {ownerGroups.slice(0, 15).map(([group, count]) => (
              <li key={group} className={ownerFilter === group ? "on" : ""} onClick={() => onOwnerFilter(group)}>
                <span className="lg-sw" style={{ background: GROUP_COLORS[group] || GROUP_COLORS.Other }} />
                {group} <b>{count}</b>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="eyebrow" style={{ marginTop: 12 }}>Market Categories</div>
          <ul>
            <li className={!filter ? "on" : ""} onClick={() => onFilter(null)}>
              <span className="lg-sw" style={{ background: "linear-gradient(135deg,#FFB81C,#27AE60,#3498DB)" }} />
              All markets <b>{cc.total}</b>
            </li>
            {CATS.map(k => {
              const meta = CATEGORY_META[k];
              return (
                <li key={k} className={filter === k ? "on" : ""} onClick={() => onFilter(k)}>
                  <span className="lg-sw" style={{ background: meta.color }} />
                  {meta.label}
                  <span className="lg-info" title={meta.tip}>i</span>
                  <b>{cc[k] || 0}</b>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="legend-foot">
        <div className="eyebrow">FCC Rule</div>
        <div className="duo-fcc-note">
          47 CFR {'\u00A7'}73.3555(b)
          <br /><small>Top-4 test + 8-voice test</small>
        </div>
      </div>
    </div>
  );
}
