import { useState, useEffect, useMemo } from 'react';
import { SCRIPPS_STATIONS } from './data/stations';
import TopBar from './components/TopBar';
import DuopolyView from './components/DuopolyView';
import ScrippsPortfolio from './components/ScrippsPortfolio';

const R_MAX = 3000;

export default function App() {
  const stations = SCRIPPS_STATIONS;
  const [view, setView] = useState("duopoly");
  const [rotation, setRotation] = useState({ lat: 38, lon: -96 });
  const [zoom, setZoom] = useState(750);
  const [landGeo, setLandGeo] = useState(null);

  // Load land geometry
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

  return (
    <div className="app">
      <TopBar
        stationCount={stations.length}
        tourCount={0}
        view={view}
        onView={setView}
        allStations={stations}
        onStationSelect={(s) => {
          setRotation({ lat: s.lat, lon: s.lon });
          setZoom(R_MAX);
          setView("duopoly");
        }}
      />
      {view === "portfolio" ? (
        <ScrippsPortfolio />
      ) : (
        <DuopolyView
          allStations={stations}
          landGeo={landGeo}
          rotation={rotation}
          zoom={zoom}
          setRotation={setRotation}
          setZoom={setZoom}
        />
      )}
    </div>
  );
}
