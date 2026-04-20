import { useState, useMemo } from 'react';
import { SCRIPPS_STATIONS, getAffilColor, affilLabel } from '../data/stations';

const TYPES = [
  ["all", "All Stations"],
  ["abc", "ABC"], ["nbc", "NBC"], ["cbs", "CBS"], ["fox", "Fox"],
  ["ion", "Ion"], ["ind", "Independent"], ["inyo", "INYO (Pending)"],
];

export default function ScrippsPortfolio() {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("state");
  const [search, setSearch] = useState("");

  const stations = useMemo(() => {
    let list = SCRIPPS_STATIONS.filter(s => s.type !== 'hq' && s.type !== 'event');
    if (filter !== "all") list = list.filter(s => s.type === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.callsign.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q) ||
        (s.affiliation || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sort === "callsign") return a.callsign.localeCompare(b.callsign);
      if (sort === "city") return a.city.localeCompare(b.city);
      if (sort === "state") return a.state.localeCompare(b.state) || a.city.localeCompare(b.city);
      if (sort === "type") return a.type.localeCompare(b.type) || a.callsign.localeCompare(b.callsign);
      return 0;
    });
    return list;
  }, [filter, sort, search]);

  const counts = useMemo(() => {
    const all = SCRIPPS_STATIONS.filter(s => s.type !== 'hq' && s.type !== 'event');
    const c = { all: all.length };
    for (const s of all) c[s.type] = (c[s.type] || 0) + 1;
    return c;
  }, []);

  return (
    <div className="portfolio">
      <div className="pf-header">
        <div>
          <h1 className="pf-title">Scripps Portfolio</h1>
          <p className="pf-sub">Scripps + ION + INYO — {counts.all} stations</p>
        </div>
        <input
          className="pf-search"
          type="text"
          placeholder="Filter by callsign, city, state..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="pf-filters">
        {TYPES.map(([key, label]) => (
          <button key={key}
            className={`pf-filter-btn ${filter === key ? 'on' : ''}`}
            onClick={() => setFilter(key)}
          >
            {key !== "all" && <span className="pf-dot" style={{ background: getAffilColor(key) }} />}
            {label}
            <b>{counts[key] || counts.all}</b>
          </button>
        ))}
      </div>

      <div className="pf-table-wrap">
        <table className="pf-table">
          <thead>
            <tr>
              <th onClick={() => setSort("callsign")} className={sort === "callsign" ? "on" : ""}>Callsign</th>
              <th onClick={() => setSort("type")} className={sort === "type" ? "on" : ""}>Network</th>
              <th>Affiliation</th>
              <th onClick={() => setSort("city")} className={sort === "city" ? "on" : ""}>City</th>
              <th onClick={() => setSort("state")} className={sort === "state" ? "on" : ""}>State</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {stations.map(s => (
              <tr key={s.callsign} className={s.type === 'inyo' ? 'pf-inyo' : ''}>
                <td className="pf-call">
                  <span className="pf-dot" style={{ background: getAffilColor(s.type) }} />
                  {s.callsign}
                </td>
                <td className="pf-type">{affilLabel(s.type)}</td>
                <td>{s.affiliation || '\u2014'}</td>
                <td>{s.city}</td>
                <td>{s.state}</td>
                <td className="pf-notes">{s.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {stations.length === 0 && (
          <div className="pf-empty">No stations match your filter.</div>
        )}
      </div>
    </div>
  );
}
