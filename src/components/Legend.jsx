import { getAffilColor } from '../data/stations';

const TYPES = [
  ["hq",  "HQ / Operations"],
  ["abc", "ABC"],
  ["nbc", "NBC"],
  ["cbs", "CBS"],
  ["fox", "Fox"],
  ["ion", "Ion"],
  ["ind", "Independent"],
  ["inyo", "INYO (Pending)"],
];

export default function Legend({ filter, onFilter, counts }) {
  return (
    <div className="legend">
      <div className="eyebrow">Affiliations</div>
      <ul>
        <li className={!filter ? "on" : ""} onClick={() => onFilter(null)}>
          <span className="lg-sw" style={{ background: "linear-gradient(90deg,#FFB81C,#F37021)" }} />
          All stations <b>{counts.all}</b>
        </li>
        {TYPES.map(([k, label]) => (
          <li key={k} className={filter === k ? "on" : ""} onClick={() => onFilter(k)}>
            <span className="lg-sw" style={{ background: getAffilColor(k) }} />
            {label} <b>{counts[k] || 0}</b>
          </li>
        ))}
      </ul>
      <div className="legend-foot">
        <div className="eyebrow">Route</div>
        <div className="lg-route">
          <span className="rl rl-solid" /> Traveled
          <span className="rl rl-dash" /> Ahead
        </div>
      </div>
    </div>
  );
}
