import { useMemo } from 'react';
import { getAffilColor } from '../data/stations';

function project(lat, lon, lon0, lat0, R, cx, cy) {
  const toRad = Math.PI / 180;
  const lam = lon * toRad, phi = lat * toRad;
  const lam0 = lon0 * toRad, phi0 = lat0 * toRad;
  const cosC = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lam - lam0);
  const visible = cosC >= 0;
  const x = cx + R * Math.cos(phi) * Math.sin(lam - lam0);
  const y = cy - R * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lam - lam0));
  return { x, y, visible, depth: cosC };
}

export default function Globe({ stations, landGeo, route, focusIdx, rotation, zoom, onStationClick, selected }) {
  const cx = 500, cy = 500, R = zoom || 420;
  const lon0 = rotation.lon;
  const lat0 = rotation.lat;

  // Project land polygons
  const landPaths = useMemo(() => {
    if (!landGeo) return [];
    const paths = [];
    for (const feat of landGeo.features) {
      const geo = feat.geometry;
      const polys = geo.type === "Polygon" ? [geo.coordinates] : geo.coordinates;
      for (const poly of polys) {
        for (const ring of poly) {
          let d = "";
          let lastVisible = false;
          for (let i = 0; i < ring.length; i++) {
            const [lon, lat] = ring[i];
            const p = project(lat, lon, lon0, lat0, R, cx, cy);
            if (p.visible) {
              d += (lastVisible ? "L" : "M") + p.x.toFixed(1) + "," + p.y.toFixed(1) + " ";
              lastVisible = true;
            } else {
              lastVisible = false;
            }
          }
          if (d) paths.push(d + "Z");
        }
      }
    }
    return paths;
  }, [landGeo, lon0, lat0, R]);

  // Graticule (every 15deg lat, 30deg lon)
  const grat = useMemo(() => {
    const lines = [];
    for (let lat = -75; lat <= 75; lat += 15) {
      let d = "";
      let lastVisible = false;
      for (let lon = -180; lon <= 180; lon += 3) {
        const p = project(lat, lon, lon0, lat0, R, cx, cy);
        if (p.visible) {
          d += (lastVisible ? "L" : "M") + p.x.toFixed(1) + "," + p.y.toFixed(1) + " ";
          lastVisible = true;
        } else lastVisible = false;
      }
      if (d) lines.push(d);
    }
    for (let lon = -180; lon <= 180; lon += 30) {
      let d = "";
      let lastVisible = false;
      for (let lat = -85; lat <= 85; lat += 3) {
        const p = project(lat, lon, lon0, lat0, R, cx, cy);
        if (p.visible) {
          d += (lastVisible ? "L" : "M") + p.x.toFixed(1) + "," + p.y.toFixed(1) + " ";
          lastVisible = true;
        } else lastVisible = false;
      }
      if (d) lines.push(d);
    }
    return lines;
  }, [lon0, lat0, R]);

  // Route arcs (great circles between consecutive tour stops)
  const arcPaths = useMemo(() => {
    if (!route || route.length < 2) return [];
    const arcs = [];
    for (let i = 0; i < route.length - 1; i++) {
      const a = route[i], b = route[i + 1];
      if (!a || !b) continue;
      let d = "";
      let lastVisible = false;
      const steps = 40;
      for (let t = 0; t <= steps; t++) {
        const f = t / steps;
        const lat = a.lat + (b.lat - a.lat) * f;
        const lon = a.lon + (b.lon - a.lon) * f;
        const p = project(lat, lon, lon0, lat0, R, cx, cy);
        if (p.visible) {
          d += (lastVisible ? "L" : "M") + p.x.toFixed(1) + "," + p.y.toFixed(1) + " ";
          lastVisible = true;
        } else lastVisible = false;
      }
      arcs.push({ d, traveled: i < focusIdx });
    }
    return arcs;
  }, [route, lon0, lat0, R, focusIdx]);

  return (
    <svg viewBox="0 0 1000 1000" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <radialGradient id="ocean" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#16406B" />
          <stop offset="70%" stopColor="#0B2545" />
          <stop offset="100%" stopColor="#051428" />
        </radialGradient>
        <radialGradient id="atmo" cx="50%" cy="50%" r="52%">
          <stop offset="88%" stopColor="rgba(255,184,28,0)" />
          <stop offset="96%" stopColor="rgba(255,184,28,0.35)" />
          <stop offset="100%" stopColor="rgba(255,184,28,0)" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* atmosphere halo */}
      <circle cx={cx} cy={cy} r={R + 22} fill="url(#atmo)" />

      {/* ocean sphere */}
      <circle cx={cx} cy={cy} r={R} fill="url(#ocean)" />

      {/* graticule */}
      <g stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" fill="none">
        {grat.map((d, i) => <path key={i} d={d} />)}
      </g>

      {/* land */}
      <g fill="#1a3558" stroke="rgba(255,255,255,0.35)" strokeWidth="1">
        {landPaths.map((d, i) => <path key={i} d={d} />)}
      </g>

      {/* terminator shading */}
      <circle cx={cx - 110} cy={cy - 120} r={R} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />

      {/* route arcs */}
      <g fill="none" strokeLinecap="round">
        {arcPaths.map((a, i) => (
          <path key={i} d={a.d}
            stroke={a.traveled ? "#FFB81C" : "rgba(255,184,28,0.35)"}
            strokeWidth={a.traveled ? 1.6 : 1}
            strokeDasharray={a.traveled ? "none" : "2 3"} />
        ))}
      </g>

      {/* stations */}
      <g>
        {stations.map((s) => {
          const p = project(s.lat, s.lon, lon0, lat0, R, cx, cy);
          if (!p.visible) return null;
          const isSelected = selected === s.callsign;
          const isHQ = s.type === "hq";
          const color = getAffilColor(s.type);
          const rdot = isHQ ? 5.5 : (isSelected ? 4.5 : 3);
          return (
            <g key={s.callsign} style={{ cursor: "pointer" }}
               onClick={() => onStationClick && onStationClick(s)}>
              {isSelected && (
                <circle cx={p.x} cy={p.y} r={14} fill="none" stroke="#FFB81C" strokeWidth="1.2" opacity="0.9">
                  <animate attributeName="r" values="8;22;8" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.95;0;0.95" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}
              {isHQ && (
                <circle cx={p.x} cy={p.y} r={10} fill="none" stroke="#FFB81C" strokeWidth="1" opacity="0.6">
                  <animate attributeName="r" values="6;18;6" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0;0.7" dur="3s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={p.x} cy={p.y} r={rdot + 1.5} fill="rgba(11,37,69,0.8)" />
              <circle cx={p.x} cy={p.y} r={rdot} fill={color}
                      stroke={isSelected || isHQ ? "#FFB81C" : "rgba(255,255,255,0.6)"}
                      strokeWidth={isSelected || isHQ ? 1.2 : 0.6}
                      filter={isSelected ? "url(#glow)" : undefined} />
              {(isSelected || isHQ) && (
                <g pointerEvents="none">
                  <rect x={p.x + 10} y={p.y - 18} width={s.callsign.length * 7 + 14} height={20}
                        rx={3} fill="rgba(6,24,51,0.88)" stroke="rgba(255,184,28,0.4)" strokeWidth="0.5" />
                  <text x={p.x + 17} y={p.y - 4}
                        fill="#FAF7F2" fontSize="11" fontFamily="'JetBrains Mono', monospace"
                        letterSpacing="0.04em">{s.callsign}</text>
                </g>
              )}
            </g>
          );
        })}
      </g>

      {/* rim */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,184,28,0.18)" strokeWidth="1" />
    </svg>
  );
}
