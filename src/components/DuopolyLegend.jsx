import { useState } from 'react';
import { CATEGORY_META, getCategoryCounts } from '../data/markets';
import { GROUP_COLORS } from '../data/ownerGroups';

const CATS = ["existing", "expanded", "new_duopoly", "opportunity", "new_market"];

export default function DuopolyLegend({
  filter, onFilter, counts,
  showAllStations, onToggleAllStations,
  ownerGroups, ownerFilter, onOwnerFilter,
  fccLoading, fccCount,
  selectedGroups = [], onToggleGroup, onAnalyzeGroups, onAnalyzeDeals,
}) {
  const cc = counts || getCategoryCounts();
  const [showMore, setShowMore] = useState(false);
  return (
    <div className="legend duo-legend">
      {/* Stations Toggle */}
      <div className="duo-toggle-section">
        <button className={`duo-toggle-btn ${!showAllStations ? 'on' : ''}`} onClick={onToggleAllStations}>
          {fccLoading ? 'Loading...' : showAllStations ? 'Scripps Only' : `Scripps Only (${fccCount} hidden)`}
        </button>
        <span className="lg-info duo-fp-info" title="Full-power (DT) stations only. Low-power (LP/Class A), translators, and digital subchannels are not included.">i</span>
      </div>

      {showAllStations && ownerGroups && ownerGroups.length > 0 ? (
        <>
          <div className="eyebrow" style={{ marginTop: 12 }}>
            Owner Groups
            <span className="lg-info" style={{ marginLeft: 4 }}
              title="Click name to filter map. Check boxes to select up to 3 groups for merger analysis.">i</span>
          </div>

          {/* Merger analyze bar */}
          {selectedGroups.length >= 2 && (
            <div className="duo-merger-bar">
              <div className="duo-merger-pills">
                {selectedGroups.map(g => (
                  <span key={g} className="duo-merger-pill" style={{ borderColor: GROUP_COLORS[g] || GROUP_COLORS.Other }}>
                    {g}
                    <span className="duo-merger-x" onClick={(e) => { e.stopPropagation(); onToggleGroup(g); }}>{'\u00D7'}</span>
                  </span>
                ))}
              </div>
              <div className="duo-merger-btns">
                <button className="duo-analyze-btn duo-merger-btn" onClick={onAnalyzeGroups}>
                  Merger
                </button>
                {selectedGroups.length <= 3 && (
                  <button className="duo-analyze-btn duo-merger-btn duo-deals-btn" onClick={onAnalyzeDeals}>
                    Deals
                  </button>
                )}
              </div>
            </div>
          )}
          {selectedGroups.length === 1 && (
            <div className="duo-merger-hint">Select 1 more group to analyze a merger</div>
          )}

          <ul>
            <li className={!ownerFilter && selectedGroups.length === 0 ? "on" : ""} onClick={() => { onOwnerFilter(null); }}>
              <span className="lg-sw" style={{ background: "linear-gradient(135deg,#E74C3C,#3498DB,#2ECC71)" }} />
              All groups <b>{fccCount}</b>
            </li>
            {ownerGroups.slice(0, 15).map(([group, count]) => {
              const isSelected = selectedGroups.includes(group);
              const isFiltered = ownerFilter === group;
              const atMax = selectedGroups.length >= 5 && !isSelected;
              return (
                <li key={group}
                  className={`${isFiltered ? 'on' : ''} ${isSelected ? 'duo-group-selected' : ''}`}
                  onClick={() => onOwnerFilter(group === ownerFilter ? null : group)}
                >
                  <span
                    className={`duo-group-cb ${isSelected ? 'checked' : ''} ${atMax ? 'disabled' : ''}`}
                    onClick={(e) => { e.stopPropagation(); if (!atMax) onToggleGroup(group); }}
                    title={atMax ? 'Max 5 groups' : isSelected ? 'Remove from merger' : 'Add to merger analysis'}
                  >
                    {isSelected ? '\u2713' : ''}
                  </span>
                  <span className="lg-sw" style={{ background: GROUP_COLORS[group] || GROUP_COLORS.Other }} />
                  <span className="lg-name">{group}</span> <b>{count}</b>
                </li>
              );
            })}
            {ownerGroups.length > 15 && (
              <li className="duo-more-toggle" onClick={() => setShowMore(v => !v)}>
                {showMore ? '\u25B4 Less' : `\u25BE More groups (${ownerGroups.length - 15})`}
              </li>
            )}
            {showMore && ownerGroups.slice(15).map(([group, count]) => {
              const isSelected = selectedGroups.includes(group);
              const isFiltered = ownerFilter === group;
              const atMax = selectedGroups.length >= 5 && !isSelected;
              return (
                <li key={group}
                  className={`${isFiltered ? 'on' : ''} ${isSelected ? 'duo-group-selected' : ''}`}
                  onClick={() => onOwnerFilter(group === ownerFilter ? null : group)}
                >
                  <span
                    className={`duo-group-cb ${isSelected ? 'checked' : ''} ${atMax ? 'disabled' : ''}`}
                    onClick={(e) => { e.stopPropagation(); if (!atMax) onToggleGroup(group); }}
                    title={atMax ? 'Max 5 groups' : isSelected ? 'Remove from merger' : 'Add to merger analysis'}
                  >
                    {isSelected ? '\u2713' : ''}
                  </span>
                  <span className="lg-sw" style={{ background: GROUP_COLORS[group] || GROUP_COLORS.Other }} />
                  <span className="lg-name">{group}</span> <b>{count}</b>
                </li>
              );
            })}
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
