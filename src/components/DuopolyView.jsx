import { useState, useMemo, useEffect } from 'react';
import { MARKETS, CATEGORY_META, getCategoryCounts } from '../data/markets';
import { GROUP_COLORS } from '../data/ownerGroups';
import Globe from './Globe';
import DuopolyLegend from './DuopolyLegend';
import DuopolyPanel from './DuopolyPanel';
import useFccStations from '../hooks/useFccStations';

export default function DuopolyView({
  allStations, landGeo, rotation, zoom, setRotation, setZoom
}) {
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [showAllStations, setShowAllStations] = useState(true);
  const [ownerFilter, setOwnerFilter] = useState(null);
  const [panelTab, setPanelTab] = useState('advisor');
  const [selectedStations, setSelectedStations] = useState([]);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  // Mobile panel size: 'collapsed' (tab bar only), 'mid' (50vh), 'expanded' (92vh)
  const [panelSize, setPanelSize] = useState('collapsed');

  const fcc = useFccStations();
  const counts = useMemo(() => getCategoryCounts(), []);

  useEffect(() => {
    if (!fcc.loaded && !fcc.loading) fcc.load();
  }, [fcc]);

  // Build market overlay
  const marketOverlay = useMemo(() => {
    if (showAllStations) return null;
    const filtered = categoryFilter
      ? MARKETS.filter(m => m.category === categoryFilter)
      : MARKETS;
    return filtered.map(m => ({
      id: m.id, name: m.name, lat: m.lat, lon: m.lon,
      color: CATEGORY_META[m.category].color,
      stationCount: m.stations.scripps.length + m.stations.inyo.length,
    }));
  }, [categoryFilter, showAllStations]);

  // Build FCC station dots
  const fccStationDots = useMemo(() => {
    if (!showAllStations || !fcc.loaded) return [];
    let filtered = fcc.stations;
    // If groups are checked for merger, show all of those groups
    if (selectedGroups.length > 0) {
      const groupSet = new Set(selectedGroups);
      filtered = filtered.filter(s => groupSet.has(s.owner_group));
    } else if (ownerFilter) {
      filtered = filtered.filter(s => s.owner_group === ownerFilter);
    }
    return filtered.map(s => ({
      callsign: s.callsign, lat: s.lat, lon: s.lon,
      city: s.city, state: s.state,
      type: s.is_scripps ? 'scripps' : s.is_inyo ? 'inyo' : 'fcc',
      color: GROUP_COLORS[s.owner_group] || GROUP_COLORS.Other,
      owner: s.owner_group, network: s.network, dmaRank: s.dma_rank,
      dmaName: s.dma_name,
    }));
  }, [showAllStations, fcc.stations, fcc.loaded, ownerFilter, selectedGroups]);

  // Compute DMA overlaps when 2+ groups selected
  const overlapOverlay = useMemo(() => {
    if (selectedGroups.length < 2 || !fcc.loaded) return [];
    const groupSet = new Set(selectedGroups);
    // Group stations by DMA, track which owner groups are present
    const dmaInfo = {};
    for (const s of fcc.stations) {
      if (!groupSet.has(s.owner_group) || !s.dma_name) continue;
      if (!dmaInfo[s.dma_name]) dmaInfo[s.dma_name] = { groups: new Set(), lat: s.lat, lon: s.lon, count: 0 };
      dmaInfo[s.dma_name].groups.add(s.owner_group);
      dmaInfo[s.dma_name].count++;
    }
    return Object.entries(dmaInfo)
      .filter(([, info]) => info.groups.size >= 2)
      .map(([dma, info]) => {
        // Classify deal type based on station mix
        const groups = [...info.groups];
        const hasScripps = groups.includes('Scripps') || groups.includes('INYO') || groups.includes('ION');
        const dealType = hasScripps ? 'duopoly play' : info.count > 4 ? 'swap opportunity' : 'deal opportunity';
        return { dma, lat: info.lat, lon: info.lon, count: info.count, groups, dealType };
      });
  }, [selectedGroups, fcc.stations, fcc.loaded]);

  // Handle click on overlap badge — build market-specific deal prompt
  const handleOverlapClick = (overlap) => {
    // Gather stations in that DMA from selected groups
    const groupSet = new Set(selectedGroups);
    const marketStns = fcc.stations
      .filter(s => groupSet.has(s.owner_group) && s.dma_name === overlap.dma)
      .map(s => ({
        callsign: s.callsign, lat: s.lat, lon: s.lon,
        city: s.city, state: s.state,
        type: s.is_scripps ? 'scripps' : s.is_inyo ? 'inyo' : 'fcc',
        color: GROUP_COLORS[s.owner_group] || GROUP_COLORS.Other,
        owner: s.owner_group, network: s.network,
        dmaRank: s.dma_rank, dmaName: s.dma_name,
        _marketDeal: true,
        _marketDealDma: overlap.dma,
        _marketDealGroups: overlap.groups,
      }));
    setSelectedStations(marketStns);
    setPanelTab('advisor');
    // Zoom to the market
    setRotation({ lat: overlap.lat, lon: overlap.lon });
    setZoom(900);
  };

  const ownerGroups = useMemo(() => {
    if (!fcc.loaded) return [];
    const groups = {};
    for (const s of fcc.stations) groups[s.owner_group] = (groups[s.owner_group] || 0) + 1;
    return Object.entries(groups).sort((a, b) => b[1] - a[1]);
  }, [fcc.stations, fcc.loaded]);

  // Set of selected callsigns for globe highlight
  const selectedFccSet = useMemo(
    () => new Set(selectedStations.map(s => s.callsign)),
    [selectedStations]
  );

  const handleMarketSelect = (id) => {
    setSelectedMarket(id);
    if (id) {
      const m = MARKETS.find(mk => mk.id === id);
      if (m) { setRotation({ lat: m.lat, lon: m.lon }); setZoom(800); }
    }
  };

  const handleMarketClick = (m) => handleMarketSelect(m.id);

  // Click-to-analyze: toggle station selection (max 4)
  const handleFccStationClick = (station) => {
    setSelectedStations(prev => {
      const exists = prev.find(s => s.callsign === station.callsign);
      if (exists) return prev.filter(s => s.callsign !== station.callsign);
      if (prev.length >= 4) return prev;
      return [...prev, station];
    });
    // Auto-switch to AI Advisor on first selection
    if (!selectedFccSet.has(station.callsign) && selectedStations.length === 0) {
      setPanelTab('advisor');
    }
  };

  const clearSelection = () => { setSelectedStations([]); setSelectedMarkets([]); setSelectedGroups([]); };

  // Toggle owner group selection (shift-click, max 3)
  const handleToggleGroup = (group) => {
    setSelectedGroups(prev => {
      if (prev.includes(group)) return prev.filter(g => g !== group);
      if (prev.length >= 5) return prev;
      return [...prev, group];
    });
  };

  // Build deals analysis from selected groups (swaps/sales/acquisitions)
  const handleAnalyzeDeals = () => {
    const groupStations = fcc.loaded
      ? fcc.stations
          .filter(s => selectedGroups.includes(s.owner_group))
          .map(s => ({
            callsign: s.callsign, lat: s.lat, lon: s.lon,
            city: s.city, state: s.state,
            type: s.is_scripps ? 'scripps' : s.is_inyo ? 'inyo' : 'fcc',
            color: GROUP_COLORS[s.owner_group] || GROUP_COLORS.Other,
            owner: s.owner_group, network: s.network,
            dmaRank: s.dma_rank, dmaName: s.dma_name,
            _dealsMode: true,
          }))
      : [];
    setSelectedStations(groupStations);
    setPanelTab('advisor');
  };

  // Build merger analysis from selected groups
  const handleAnalyzeGroups = () => {
    // Gather all FCC stations for selected groups
    const groupStations = fcc.loaded
      ? fcc.stations
          .filter(s => selectedGroups.includes(s.owner_group))
          .map(s => ({
            callsign: s.callsign, lat: s.lat, lon: s.lon,
            city: s.city, state: s.state,
            type: s.is_scripps ? 'scripps' : s.is_inyo ? 'inyo' : 'fcc',
            color: GROUP_COLORS[s.owner_group] || GROUP_COLORS.Other,
            owner: s.owner_group, network: s.network,
            dmaRank: s.dma_rank, dmaName: s.dma_name,
            _mergerGroup: true,
          }))
      : [];
    setSelectedStations(groupStations);
    setPanelTab('advisor');
  };

  // Toggle market selection (checkbox in market list)
  const handleToggleMarket = (market) => {
    setSelectedMarkets(prev => {
      const exists = prev.find(m => m.id === market.id);
      if (exists) return prev.filter(m => m.id !== market.id);
      return [...prev, market];
    });
  };

  // Build station objects from a market
  function buildMarketStations(market) {
    const callsigns = [...market.stations.scripps, ...market.stations.inyo];
    return callsigns.map(call => {
      if (fcc.loaded) {
        const fccS = fcc.stations.find(s => s.callsign === call);
        if (fccS) return {
          callsign: fccS.callsign, lat: fccS.lat, lon: fccS.lon,
          city: fccS.city, state: fccS.state,
          type: fccS.is_scripps ? 'scripps' : fccS.is_inyo ? 'inyo' : 'fcc',
          color: GROUP_COLORS[fccS.owner_group] || GROUP_COLORS.Other,
          owner: fccS.owner_group, network: fccS.network,
          dmaRank: fccS.dma_rank, dmaName: fccS.dma_name,
        };
      }
      const localS = allStations.find(s => s.callsign === call);
      if (localS) return {
        callsign: localS.callsign, lat: localS.lat, lon: localS.lon,
        city: localS.city, state: localS.state,
        type: localS.type, color: GROUP_COLORS.Scripps,
        owner: localS.type === 'inyo' ? 'INYO' : 'Scripps',
        network: localS.affiliation || localS.type,
        dmaRank: market.dmaRank, dmaName: market.name,
      };
      return null;
    }).filter(Boolean);
  }

  // "Analyze" from a single market detail card
  const handleAnalyzeMarket = (market) => {
    setSelectedMarkets([market]);
    setSelectedStations(buildMarketStations(market).slice(0, 4));
    setPanelTab('advisor');
  };

  // "Analyze selected markets" from multi-select
  const handleAnalyzeSelectedMarkets = () => {
    const allStns = selectedMarkets.flatMap(m => buildMarketStations(m));
    setSelectedStations(allStns);
    setPanelTab('advisor');
  };

  return (
    <div className="stage duopoly-stage">
      <DuopolyLegend
        filter={categoryFilter}
        onFilter={setCategoryFilter}
        counts={counts}
        showAllStations={showAllStations}
        onToggleAllStations={() => { setShowAllStations(v => !v); setOwnerFilter(null); setSelectedGroups([]); }}
        ownerGroups={ownerGroups}
        ownerFilter={ownerFilter}
        onOwnerFilter={setOwnerFilter}
        fccLoading={fcc.loading}
        fccCount={fcc.stations.length}
        selectedGroups={selectedGroups}
        onToggleGroup={handleToggleGroup}
        onAnalyzeGroups={handleAnalyzeGroups}
        onAnalyzeDeals={handleAnalyzeDeals}
      />
      <div className="globe-wrap">
        <div className="globe-canvas">
          <Globe
            stations={showAllStations ? [] : allStations}
            landGeo={landGeo}
            route={[]}
            focusIdx={-1}
            rotation={rotation}
            zoom={zoom}
            showLogos={false}
            marketOverlay={marketOverlay}
            onMarketClick={handleMarketClick}
            selectedMarket={selectedMarket}
            fccStations={fccStationDots}
            onFccStationClick={handleFccStationClick}
            selectedFccStations={selectedFccSet}
            overlapOverlay={overlapOverlay}
            onOverlapClick={handleOverlapClick}
            ownerFilter={ownerFilter}
            onZoom={(delta) => setZoom(z => Math.max(250, Math.min(8000, z + delta)))}
            onRotate={({ dLon, dLat }) => setRotation(r => ({
              lat: Math.max(-80, Math.min(80, r.lat + dLat)),
              lon: r.lon + dLon,
            }))}
          />
        </div>
        <div className="globe-overlay" />
        {/* Selection mode indicator */}
        {panelTab === 'advisor' && showAllStations && (
          <div className="globe-select-badge">
            Select stations ({selectedStations.length}/4)
          </div>
        )}
      </div>
      <DuopolyPanel
        selectedMarket={selectedMarket}
        onSelectMarket={handleMarketSelect}
        allStations={allStations}
        categoryFilter={categoryFilter}
        panelTab={panelTab}
        onPanelTab={setPanelTab}
        selectedStations={selectedStations}
        onClearSelection={clearSelection}
        onAnalyzeMarket={handleAnalyzeMarket}
        selectedMarkets={selectedMarkets}
        onToggleMarket={handleToggleMarket}
        onAnalyzeSelectedMarkets={handleAnalyzeSelectedMarkets}
        showAllStations={showAllStations}
        onToggleAllStations={() => { setShowAllStations(v => !v); setOwnerFilter(null); setSelectedGroups([]); }}
        ownerGroups={ownerGroups}
        ownerFilter={ownerFilter}
        onOwnerFilter={setOwnerFilter}
        fccLoading={fcc.loading}
        fccCount={fcc.stations.length}
        selectedGroups={selectedGroups}
        onToggleGroup={handleToggleGroup}
        onAnalyzeGroups={handleAnalyzeGroups}
        onAnalyzeDeals={handleAnalyzeDeals}
        panelSize={panelSize}
        onCyclePanel={() => setPanelSize(s => s === 'collapsed' ? 'mid' : s === 'mid' ? 'expanded' : 'collapsed')}
        onSetPanelSize={setPanelSize}
      />
    </div>
  );
}
