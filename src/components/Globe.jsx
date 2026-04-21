import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
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

export default function Globe({ stations, landGeo, route, focusIdx, rotation, zoom, onStationClick, selected, showLogos, marketOverlay, onMarketClick, selectedMarket, fccStations, onFccStationClick, selectedFccStations, overlapOverlay, onOverlapClick, onZoom, onRotate, ownerFilter }) {
  const cx = 500, cy = 500, R = zoom || 420;
  const lon0 = rotation.lon;
  const lat0 = rotation.lat;
  const [hovered, setHovered] = useState(null);

  // Zoom level tiers for progressive detail
  const TIER_REGIONAL = 600;
  const TIER_STREET = 900;
  const zoomTier = R < TIER_REGIONAL ? 'wide' : R < TIER_STREET ? 'regional' : 'street';

  const svgRef = useRef(null);
  const onZoomRef = useRef(onZoom);
  const zoomValRef = useRef(R);
  useEffect(() => { onZoomRef.current = onZoom; }, [onZoom]);
  useEffect(() => { zoomValRef.current = R; }, [R]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    function handleWheel(e) {
      if (!onZoomRef.current) return;
      e.preventDefault();
      const step = Math.max(30, zoomValRef.current * 0.08);
      const delta = e.deltaY > 0 ? -step : step;
      onZoomRef.current(delta);
    }
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Drag to rotate
  const onRotateRef = useRef(onRotate);
  useEffect(() => { onRotateRef.current = onRotate; }, [onRotate]);
  const dragRef = useRef(null);

  const handlePointerDown = useCallback((e) => {
    if (!onRotateRef.current) return;
    // Only start drag on background (not on interactive elements)
    if (e.target.closest('[data-interactive]')) return;
    dragRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current || !onRotateRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      // Scale movement by zoom — less rotation when zoomed in
      const scale = 0.15 * (600 / Math.max(zoomValRef.current, 300));
      onRotateRef.current({ dLon: -dx * scale, dLat: dy * scale });
      dragRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

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
    <svg ref={svgRef} viewBox="0 0 1000 1000"
         style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }}
         shapeRendering="geometricPrecision"
         textRendering="optimizeLegibility"
         onPointerDown={handlePointerDown}
         onPointerMove={handlePointerMove}
         onPointerUp={handlePointerUp}
         onPointerCancel={handlePointerUp}>
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
        {/* glow filter removed — feGaussianBlur triggers SVG rasterization causing blurriness */}
        {showLogos && stations.map((s) => {
          if (!s.logo) return null;
          const p = project(s.lat, s.lon, lon0, lat0, R, cx, cy);
          if (!p.visible || R <= 400) return null;
          const isSel = selected === s.callsign;
          const lr = isSel ? Math.max(18, R * 0.026) : Math.max(11, R * 0.015);
          return (
            <clipPath key={s.callsign} id={`lc-${s.callsign}`}>
              <circle cx={p.x} cy={p.y} r={lr - 1} />
            </clipPath>
          );
        })}
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

      {/* FCC all-stations layer — progressive density + viewport culling */}
      {fccStations && fccStations.length > 0 && (
        <g>
          {fccStations.map((s) => {
            const isScripps = s.type === 'scripps' || s.type === 'inyo';
            const isSel = selectedFccStations && selectedFccStations.has(s.callsign);
            const isGroupFiltered = ownerFilter && s.owner_group === ownerFilter;
            // Progressive density: at wide zoom, only show Scripps/INYO/selected/filtered
            if (zoomTier === 'wide' && !isScripps && !isSel && !isGroupFiltered) return null;
            const p = project(s.lat, s.lon, lon0, lat0, R, cx, cy);
            if (!p.visible) return null;
            // Viewport culling: skip stations far from visible area when zoomed in
            if (zoomTier !== 'wide' && !isSel) {
              const dx = p.x - cx, dy = p.y - cy;
              const distSq = dx * dx + dy * dy;
              const viewR = R * 1.05;
              if (distSq > viewR * viewR) return null;
            }
            const r = isSel ? 4.5 : (isScripps ? 3.5 : 2);
            // Labels: only show near viewport center to reduce clutter
            const nearCenter = (() => {
              const dx = p.x - cx, dy = p.y - cy;
              return dx * dx + dy * dy < (R * 0.6) * (R * 0.6);
            })();
            return (
              <g key={s.callsign} style={{ cursor: "pointer" }}
                 onClick={() => onFccStationClick && onFccStationClick(s)}
                 onMouseEnter={() => setHovered("fcc-" + s.callsign)}
                 onMouseLeave={() => setHovered(null)}>
                {isSel && (
                  <circle cx={p.x} cy={p.y} r={r + 8} fill="none" stroke="#FFB81C" strokeWidth="1.5" opacity="0.7">
                    <animate attributeName="r" values={`${r+4};${r+16};${r+4}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={p.x} cy={p.y} r={r + 1} fill="rgba(6,24,51,0.6)" />
                <circle cx={p.x} cy={p.y} r={r} fill={isSel ? "#FFB81C" : s.color}
                        stroke={isSel ? "#FFB81C" : isScripps ? "#FFB81C" : "rgba(255,255,255,0.3)"}
                        strokeWidth={isSel ? 2 : isScripps ? 1 : 0.4} />
                {isSel && (
                  <text x={p.x} y={p.y + 3.5} textAnchor="middle" fill="#0B2545" fontSize="7"
                        fontFamily="'JetBrains Mono', monospace" fontWeight="800" pointerEvents="none">
                    {[...selectedFccStations].indexOf(s.callsign) + 1}
                  </text>
                )}
                {/* Progressive labels: Scripps near center at regional; all near center at street */}
                {!isSel && zoomTier === 'regional' && isScripps && nearCenter && (
                  <text x={p.x + r + 3} y={p.y + 3} fill="rgba(255,184,28,0.8)" fontSize="7"
                        fontFamily="'JetBrains Mono', monospace" fontWeight="600" pointerEvents="none">
                    {s.callsign}
                  </text>
                )}
                {!isSel && zoomTier === 'street' && nearCenter && (
                  <text x={p.x + r + 3} y={p.y + 3}
                        fill={isScripps ? 'rgba(255,184,28,0.8)' : 'rgba(255,255,255,0.6)'}
                        fontSize="8"
                        fontFamily="'JetBrains Mono', monospace" fontWeight={isScripps ? '600' : '400'} pointerEvents="none">
                    {s.callsign} {s.network || ''}
                  </text>
                )}
                {hovered === "fcc-" + s.callsign && (() => {
                  const label = `${s.callsign} (${s.owner})`;
                  const sub = `${s.network || ''} ${s.city}, ${s.state}`.trim();
                  const tw = Math.max(label.length * 7, sub.length * 6) + 16;
                  return (
                    <g pointerEvents="none">
                      <rect x={p.x + 8} y={p.y - 18} width={tw} height={34}
                            rx={4} fill="rgba(6,24,51,0.92)" stroke={isSel ? "#FFB81C" : s.color} strokeWidth="0.7" />
                      <text x={p.x + 16} y={p.y - 3}
                            fill={isSel ? "#FFB81C" : s.color} fontSize="11" fontFamily="'JetBrains Mono', monospace"
                            fontWeight="600">{label}</text>
                      <text x={p.x + 16} y={p.y + 11}
                            fill="rgba(255,255,255,0.65)" fontSize="10" fontFamily="'Inter Tight', sans-serif"
                            >{sub}</text>
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </g>
      )}

      {/* stations */}
      <g>
        {stations.map((s) => {
          const p = project(s.lat, s.lon, lon0, lat0, R, cx, cy);
          if (!p.visible) return null;
          const isSelected = selected === s.callsign;
          const isHQ = s.type === "hq";
          const color = getAffilColor(s.type);
          const hasLogo = showLogos && s.logo && R > 400;
          const logoR = hasLogo ? (isSelected ? Math.max(18, R * 0.026) : Math.max(11, R * 0.015)) : 0;
          const rdot = isHQ ? 5.5 : (isSelected ? 4.5 : 3);
          return (
            <g key={s.callsign} style={{ cursor: "pointer" }}
               onClick={() => onStationClick && onStationClick(s)}
               onMouseEnter={() => setHovered(s.callsign)}
               onMouseLeave={() => setHovered(null)}>
              {isSelected && (
                <circle cx={p.x} cy={p.y} r={hasLogo ? logoR + 8 : 14} fill="none" stroke="#FFB81C" strokeWidth="1.2" opacity="0.9">
                  <animate attributeName="r" values={hasLogo ? `${logoR+4};${logoR+24};${logoR+4}` : "8;22;8"} dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.95;0;0.95" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}
              {isHQ && !isSelected && (
                <circle cx={p.x} cy={p.y} r={10} fill="none" stroke="#FFB81C" strokeWidth="1" opacity="0.6">
                  <animate attributeName="r" values="6;18;6" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0;0.7" dur="3s" repeatCount="indefinite" />
                </circle>
              )}
              {hasLogo ? (
                <>
                  <circle cx={p.x} cy={p.y} r={logoR + 2} fill="rgba(6,24,51,0.85)" />
                  <circle cx={p.x} cy={p.y} r={logoR} fill="white"
                          stroke={isSelected ? "#FFB81C" : "rgba(255,255,255,0.5)"}
                          strokeWidth={isSelected ? 2.5 : 1} />
                  <image
                    href={`/assets/stations/${s.logo}`}
                    x={p.x - (logoR - 2)} y={p.y - (logoR - 2)}
                    width={(logoR - 2) * 2} height={(logoR - 2) * 2}
                    clipPath={`url(#lc-${s.callsign})`}
                    preserveAspectRatio="xMidYMid meet"
                  />
                </>
              ) : (
                <>
                  <circle cx={p.x} cy={p.y} r={rdot + 1.5} fill="rgba(11,37,69,0.8)" />
                  <circle cx={p.x} cy={p.y} r={rdot} fill={color}
                          stroke={isSelected || isHQ ? "#FFB81C" : "rgba(255,255,255,0.6)"}
                          strokeWidth={isSelected || isHQ ? 1.8 : 0.6} />
                </>
              )}
              {hasLogo && isSelected && (
                <g pointerEvents="none">
                  <rect x={p.x + logoR + 6} y={p.y - 13} width={s.callsign.length * 9 + 16} height={26}
                        rx={4} fill="rgba(6,24,51,0.9)" stroke="rgba(255,184,28,0.5)" strokeWidth="0.8" />
                  <text x={p.x + logoR + 14} y={p.y + 4}
                        fill="#FAF7F2" fontSize="14" fontFamily="'JetBrains Mono', monospace"
                        fontWeight="600" letterSpacing="0.04em">{s.callsign}</text>
                </g>
              )}
              {!hasLogo && (isSelected || isHQ) && (
                <g pointerEvents="none">
                  <rect x={p.x + 10} y={p.y - 18} width={s.callsign.length * 7 + 14} height={20}
                        rx={3} fill="rgba(6,24,51,0.88)" stroke="rgba(255,184,28,0.4)" strokeWidth="0.5" />
                  <text x={p.x + 17} y={p.y - 4}
                        fill="#FAF7F2" fontSize="11" fontFamily="'JetBrains Mono', monospace"
                        letterSpacing="0.04em">{s.callsign}</text>
                </g>
              )}
              {hovered === s.callsign && !isSelected && !(isHQ && !hasLogo) && (() => {
                const tx = p.x + (hasLogo ? logoR + 8 : 12);
                const tw = Math.max(s.callsign.length * 8, (s.city + ", " + s.state).length * 6.2) + 18;
                return (
                  <g pointerEvents="none">
                    <rect x={tx} y={p.y - 18} width={tw} height={34}
                          rx={4} fill="rgba(6,24,51,0.92)" stroke="rgba(255,184,28,0.25)" strokeWidth="0.7" />
                    <text x={tx + 9} y={p.y - 3}
                          fill="#FFB81C" fontSize="12" fontFamily="'JetBrains Mono', monospace"
                          fontWeight="600" letterSpacing="0.03em">{s.callsign}</text>
                    <text x={tx + 9} y={p.y + 11}
                          fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="'Inter Tight', sans-serif"
                          >{s.city}, {s.state}</text>
                  </g>
                );
              })()}
            </g>
          );
        })}
      </g>

      {/* market overlay circles (M&A view) */}
      {marketOverlay && (
        <g>
          {marketOverlay.map((m) => {
            const p = project(m.lat, m.lon, lon0, lat0, R, cx, cy);
            if (!p.visible) return null;
            const isSel = selectedMarket === m.id;
            const count = m.stationCount || 1;
            const r = Math.max(8, 5 + count * 3.5) * (R / 600);
            return (
              <g key={m.id} style={{ cursor: "pointer" }}
                 onClick={() => onMarketClick && onMarketClick(m)}
                 onMouseEnter={() => setHovered("mkt-" + m.id)}
                 onMouseLeave={() => setHovered(null)}>
                {isSel && (
                  <circle cx={p.x} cy={p.y} r={r + 10} fill="none" stroke="#FFB81C" strokeWidth="1.5" opacity="0.7">
                    <animate attributeName="r" values={`${r+6};${r+18};${r+6}`} dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={p.x} cy={p.y} r={r + 2} fill="rgba(6,24,51,0.7)" />
                <circle cx={p.x} cy={p.y} r={r} fill={m.color} fillOpacity={0.3}
                        stroke={isSel ? "#FFB81C" : m.color} strokeWidth={isSel ? 2.5 : 1.5} />
                <text x={p.x} y={p.y + 3.5} textAnchor="middle"
                      fill="white" fontSize={Math.max(8, r * 0.7)} fontFamily="'JetBrains Mono', monospace"
                      fontWeight="700" pointerEvents="none">{count}</text>
                {(isSel || hovered === "mkt-" + m.id) && (
                  <g pointerEvents="none">
                    <rect x={p.x + r + 6} y={p.y - 12}
                          width={m.name.length * 7.5 + 16} height={24}
                          rx={4} fill="rgba(6,24,51,0.92)" stroke={m.color} strokeWidth="0.8" />
                    <text x={p.x + r + 14} y={p.y + 3}
                          fill="white" fontSize="12" fontFamily="'JetBrains Mono', monospace"
                          fontWeight="600">{m.name}</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* DMA overlap rings + deal badges */}
      {overlapOverlay && overlapOverlay.length > 0 && (
        <g>
          {overlapOverlay.map((o) => {
            const p = project(o.lat, o.lon, lon0, lat0, R, cx, cy);
            if (!p.visible) return null;
            const r = Math.max(12, 8 + o.count * 4) * (R / 600);
            const isHov = hovered === 'olap-' + o.dma;
            const showBadge = zoomTier !== 'wide';
            const dealType = o.dealType || 'deal opportunity';
            const badgeW = Math.max(o.dma.length * 6.5 + 20, 100);
            return (
              <g key={o.dma}
                 style={showBadge ? { cursor: 'pointer' } : undefined}
                 onClick={() => showBadge && onOverlapClick && onOverlapClick(o)}
                 onMouseEnter={() => setHovered('olap-' + o.dma)}
                 onMouseLeave={() => setHovered(null)}>
                {/* Pulsing ring */}
                <circle cx={p.x} cy={p.y} r={r} fill="none" stroke="#E74C3C" strokeWidth="2" opacity="0.6">
                  <animate attributeName="r" values={`${r};${r + 16};${r}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={p.x} cy={p.y} r={r} fill="rgba(231,76,60,0.12)" stroke="#E74C3C" strokeWidth="1.5" strokeDasharray="4 3" />
                {/* Group count label (wide zoom) */}
                {!showBadge && (
                  <text x={p.x} y={p.y - r - 5} textAnchor="middle"
                        fill="#E74C3C" fontSize="9" fontFamily="'JetBrains Mono', monospace"
                        fontWeight="600" opacity="0.8">
                    {o.groups.length} groups
                  </text>
                )}
                {/* Deal badge (regional+ zoom) */}
                {showBadge && (
                  <g pointerEvents="all">
                    <rect x={p.x - badgeW / 2} y={p.y - r - 32}
                          width={badgeW} height={26} rx={5}
                          fill={isHov ? 'rgba(255,184,28,0.2)' : 'rgba(6,24,51,0.9)'}
                          stroke={isHov ? '#FFB81C' : 'rgba(255,184,28,0.4)'} strokeWidth="1" />
                    <text x={p.x} y={p.y - r - 22} textAnchor="middle"
                          fill="#FFB81C" fontSize="9" fontFamily="'JetBrains Mono', monospace"
                          fontWeight="700" pointerEvents="none">
                      {o.dma}
                    </text>
                    <text x={p.x} y={p.y - r - 12} textAnchor="middle"
                          fill="rgba(255,255,255,0.6)" fontSize="7.5" fontFamily="'Inter Tight', sans-serif"
                          pointerEvents="none">
                      {o.groups.join(' + ')} {'\u00B7'} {dealType}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* rim */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,184,28,0.18)" strokeWidth="1" />
    </svg>
  );
}
