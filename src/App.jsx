import { useState, useEffect, useMemo, useRef } from 'react';
import { SCRIPPS_STATIONS, TOUR } from './data/stations';
import Globe from './components/Globe';
import StationCard from './components/StationCard';
import TopBar from './components/TopBar';
import Legend from './components/Legend';
import StationList from './components/StationList';

// ============ CAMERA SYSTEM ============
// Think in three shot types, like a film director:
//
//   TRACKING SHOT  (< 4°)  — Camera stays low, pans between nearby cities.
//                             No zoom change. Quick, confident movement.
//
//   CRANE SHOT     (4-15°) — Camera lifts modestly to show the region,
//                             sweeps to the next cluster, settles back in.
//
//   ESTABLISHING   (> 15°) — Camera pulls way back to reveal geography,
//                             holds wide so the viewer sees the route,
//                             then descends to land. Rotation is compressed
//                             into the middle so there's a "reveal" at the
//                             start and a "landing" at the end.

const R_CLOSE = 1080;      // "landed" intimate station view (50% tighter than before)
const R_MIN = 250;
const R_MAX = 1200;
const ZOOM_STEP = 60;
const DWELL_PAUSE = 1800;  // ms rest at each station before auto-advance

// Shot-type thresholds (great-circle degrees)
const TRACKING = 4;
const CRANE = 15;

// Smooth ease-in-out: zero velocity at both endpoints
const smoothstep = (t) => t * t * (3 - 2 * t);

// Great-circle angular distance in degrees
function angularDist(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * Math.asin(Math.sqrt(Math.min(1, a))) / toRad;
}

// Compute shot parameters from distance.
// With R_CLOSE=1080, depth values are calibrated so:
//   Tracking:     stays at ~1080       (street-level pan)
//   Crane:        dips to ~800–1050    (neighbourhood context)
//   Establishing: dips to ~400–800     (reveal the country)
function shotParams(dist) {
  // Co-located (same city): micro-bump, swap the card
  if (dist < 0.1)
    return { duration: 600, depth: 20, rotStart: 0, rotEnd: 1 };

  // TRACKING — stay close, just pan
  if (dist < TRACKING) {
    return {
      duration: 800 + dist * 250,       // 0.8 – 1.8 s
      depth: dist * 8,                   // 0 – 32 px (barely perceptible)
      rotStart: 0,
      rotEnd: 1,
    };
  }

  // CRANE — modest lift, regional sweep
  if (dist < CRANE) {
    const f = (dist - TRACKING) / (CRANE - TRACKING);
    return {
      duration: 1800 + f * 1700,         // 1.8 – 3.5 s
      depth: 30 + f * 250,               // 30 – 280 px (dips to ~800)
      rotStart: 0.05,
      rotEnd: 0.95,
    };
  }

  // ESTABLISHING — dramatic reveal, hold wide, descend
  const f = Math.min((dist - CRANE) / 25, 1);
  return {
    duration: 3500 + f * 1500,           // 3.5 – 5.0 s
    depth: 280 + f * 400,                // 280 – 680 px (dips to ~400)
    rotStart: 0.12,
    rotEnd: 0.88,
  };
}

// ============ APP ============
export default function App() {
  const stations = SCRIPPS_STATIONS;
  const tourCalls = TOUR;
  const tourStations = useMemo(
    () => tourCalls.map(c => stations.find(s => s.callsign === c)).filter(Boolean),
    [stations, tourCalls]
  );

  const [view, setView] = useState("tour");
  const [filter, setFilter] = useState(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rotation, setRotation] = useState({ lat: 38, lon: -96 }); // US center
  const [zoom, setZoom] = useState(420); // start wide — establishing shot of the country

  const visibleStations = useMemo(
    () => filter ? stations.filter(s => s.type === filter) : stations,
    [stations, filter]
  );

  const counts = useMemo(() => {
    const c = { all: stations.length };
    for (const s of stations) c[s.type] = (c[s.type] || 0) + 1;
    return c;
  }, [stations]);

  const current = tourStations[focusIdx];

  // Refs for reading current values inside rAF callbacks
  const rotRef = useRef(rotation);
  const zoomRef = useRef(zoom);
  const isFirstFocus = useRef(true);
  const animDurRef = useRef(0);
  useEffect(() => { rotRef.current = rotation; }, [rotation]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // ============ MAIN ANIMATION EFFECT ============
  useEffect(() => {
    if (!current) return;

    const fromRot = rotRef.current;
    const toRot = { lat: current.lat, lon: current.lon };
    const fromZoom = zoomRef.current;

    // Shortest-arc longitude
    let dLon = toRot.lon - fromRot.lon;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;

    const dist = angularDist(fromRot.lat, fromRot.lon, toRot.lat, toRot.lon);

    // ---------- FIRST MOUNT: cinematic opening ----------
    // Start wide over the US, then descend into Cincinnati
    if (isFirstFocus.current) {
      isFirstFocus.current = false;
      const dur = 2200;
      animDurRef.current = dur;
      const startTime = performance.now();
      let raf;
      function tick(now) {
        const t = Math.min(1, (now - startTime) / dur);
        const e = smoothstep(t);
        setRotation({
          lat: fromRot.lat + (toRot.lat - fromRot.lat) * e,
          lon: fromRot.lon + dLon * e,
        });
        // Smooth zoom from wide (420) to close (720)
        setZoom(fromZoom + (R_CLOSE - fromZoom) * e);
        if (t < 1) raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }

    // ---------- SHOT SELECTION ----------
    const shot = shotParams(dist);
    animDurRef.current = shot.duration;

    const startTime = performance.now();
    let raf;

    function tick(now) {
      const t = Math.min(1, (now - startTime) / shot.duration);

      // --- ROTATION ---
      // Compress rotation into [rotStart, rotEnd] of the overall timeline.
      // For establishing shots this creates a "reveal before travel" and
      // "settle after arrival" feel — the camera lifts first, then sweeps.
      const tRot = Math.max(0, Math.min(1,
        (t - shot.rotStart) / (shot.rotEnd - shot.rotStart)
      ));
      const eRot = smoothstep(tRot);

      setRotation({
        lat: fromRot.lat + (toRot.lat - fromRot.lat) * eRot,
        lon: fromRot.lon + dLon * eRot,
      });

      // --- ZOOM ---
      // sin²(πt) valley over the FULL timeline.
      // Zero velocity at t=0, t=0.5, t=1 — buttery smooth.
      // For tracking shots depth ≈ 0, so zoom barely moves.
      // For establishing shots depth ≈ 300+, dramatic pull-back.
      //
      // Because rotation is compressed into the middle but zoom spans
      // the full duration, the camera lifts BEFORE it starts panning
      // (the reveal) and settles AFTER it stops (the landing).
      const zDip = shot.depth * Math.sin(Math.PI * t) ** 2;

      // Blend from wherever we are toward R_CLOSE as the baseline.
      // This handles the case where manual zoom left us at a weird level.
      const baseZoom = fromZoom + (R_CLOSE - fromZoom) * smoothstep(t);
      setZoom(baseZoom - zDip);

      if (t < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [focusIdx, current]);

  // Auto-play: animation duration + dwell pause
  useEffect(() => {
    if (!playing) return;
    const wait = animDurRef.current + DWELL_PAUSE;
    const id = setTimeout(() => {
      setFocusIdx(i => (i + 1) % tourStations.length);
    }, wait);
    return () => clearTimeout(id);
  }, [playing, focusIdx, tourStations.length]);

  // Keyboard controls
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight") setFocusIdx(i => Math.min(tourStations.length - 1, i + 1));
      if (e.key === "ArrowLeft")  setFocusIdx(i => Math.max(0, i - 1));
      if (e.key === " ") { e.preventDefault(); setPlaying(p => !p); }
      if (e.key === "=" || e.key === "+") setZoom(z => Math.min(R_MAX, z + ZOOM_STEP));
      if (e.key === "-") setZoom(z => Math.max(R_MIN, z - ZOOM_STEP));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [tourStations.length]);

  // Load land GeoJSON (Natural Earth 110m)
  const [landGeo, setLandGeo] = useState(null);
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")
      .then(r => r.json())
      .then(topo => {
        const arcs = topo.arcs;
        const scale = topo.transform.scale;
        const translate = topo.transform.translate;
        function decode(arc) {
          let x = 0, y = 0;
          return arc.map(([dx, dy]) => {
            x += dx; y += dy;
            return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
          });
        }
        const geoms = topo.objects.land.geometries;
        const features = geoms.map(g => {
          function buildPoly(polygon) {
            return polygon.map(ring => {
              const pts = [];
              for (const idx of ring) {
                const i = idx < 0 ? ~idx : idx;
                const a = decode(arcs[i]);
                const ordered = idx < 0 ? a.slice().reverse() : a;
                for (const p of ordered) pts.push(p);
              }
              return pts;
            });
          }
          if (g.type === "Polygon") {
            return { type: "Feature", geometry: { type: "Polygon", coordinates: buildPoly(g.arcs) } };
          } else if (g.type === "MultiPolygon") {
            return { type: "Feature", geometry: { type: "MultiPolygon", coordinates: g.arcs.map(buildPoly) } };
          }
          return null;
        }).filter(Boolean);
        setLandGeo({ type: "FeatureCollection", features });
      })
      .catch(err => console.warn("land geo load failed", err));
  }, []);

  const onStationClick = (s) => {
    const idx = tourStations.findIndex(t => t.callsign === s.callsign);
    if (idx >= 0) setFocusIdx(idx);
  };

  const nextStation = tourStations[(focusIdx + 1) % tourStations.length];

  return (
    <div className="app">
      <TopBar
        stationCount={stations.length}
        tourCount={tourStations.length}
        view={view}
        onView={setView}
      />
      {view === "list" ? (
        <div className="stage">
          <Legend filter={filter} onFilter={setFilter} counts={counts} />
          <StationList
            stations={visibleStations}
            onPick={(s) => { onStationClick(s); setView("tour"); }}
          />
        </div>
      ) : (
        <div className={"stage " + (view === "globe" ? "no-right" : "")}>
          <Legend filter={filter} onFilter={setFilter} counts={counts} />
          <div className="globe-wrap">
            <div className="globe-canvas">
              <Globe
                stations={visibleStations}
                landGeo={landGeo}
                route={tourStations}
                focusIdx={focusIdx}
                rotation={rotation}
                zoom={zoom}
                onStationClick={onStationClick}
                selected={current?.callsign}
              />
            </div>
            <div className="globe-overlay" />
            <div className="globe-compass">
              <div className="eyebrow">Camera</div>
              <div>LAT {rotation.lat.toFixed(2)}{'\u00B0'}</div>
              <div>LON {rotation.lon.toFixed(2)}{'\u00B0'}</div>
              <div>ALT {((R_MAX + 20 - zoom) / 4).toFixed(0)}k ft</div>
            </div>
            <div className="globe-zoom">
              <button className="rotate-btn" onClick={() => setZoom(z => Math.min(R_MAX, z + ZOOM_STEP))}>
                {'+'}
              </button>
              <button className="rotate-btn" onClick={() => setZoom(z => Math.max(R_MIN, z - ZOOM_STEP))}>
                {'\u2212'}
              </button>
            </div>
            <div className="globe-rotate">
              <button className="rotate-btn" onClick={() => setRotation(r => ({...r, lon: r.lon - 20}))}>
                {'\u25C0'}
              </button>
              <button className="rotate-btn" onClick={() => setRotation(r => ({...r, lat: Math.min(80, r.lat + 10)}))}>
                {'\u25B2'}
              </button>
              <button className="rotate-btn" onClick={() => setRotation(r => ({...r, lat: Math.max(-80, r.lat - 10)}))}>
                {'\u25BC'}
              </button>
              <button className="rotate-btn" onClick={() => setRotation(r => ({...r, lon: r.lon + 20}))}>
                {'\u25B6'}
              </button>
            </div>
          </div>
          {view === "tour" && (
            <aside className="right-panel">
              <div className="live-beacon">{'\u25CF'} On the road</div>
              <StationCard
                station={current}
                stepLabel={`${focusIdx + 1} / ${tourStations.length}`}
                onPrev={() => setFocusIdx(i => Math.max(0, i - 1))}
                onNext={() => setFocusIdx(i => Math.min(tourStations.length - 1, i + 1))}
                onPlayPause={() => setPlaying(p => !p)}
                playing={playing}
              />
              <div className="tour-progress">
                <div className="tp-label">
                  <span>Tour progress</span>
                  <b>{Math.round(((focusIdx + 1) / tourStations.length) * 100)}%</b>
                </div>
                <div className="tp-bar">
                  <i style={{ width: `${((focusIdx + 1) / tourStations.length) * 100}%` }} />
                </div>
                {nextStation && (
                  <div className="tp-next">
                    Next up {'\u2192'} <b>{nextStation.callsign}</b> {'\u00B7'} {nextStation.city}, {nextStation.state}
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
