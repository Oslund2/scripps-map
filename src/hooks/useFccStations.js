import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function useFccStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!supabase || loaded || loading) return;
    setLoading(true);
    // Supabase defaults to 1000 rows — fetch all stations in batches
    let allData = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from('fcc_stations')
        .select('callsign, channel, city, state, lat, lon, network, owner_group, dma_name, dma_rank, is_scripps, is_inyo')
        .order('dma_rank', { ascending: true })
        .range(from, from + pageSize - 1);
      if (error || !data) break;
      allData = allData.concat(data);
      if (data.length < pageSize) break;
      from += pageSize;
    }
    const data = allData;
    const error = null;
    if (!error && data) {
      setStations(data);
      setLoaded(true);
    }
    setLoading(false);
  }, [loaded, loading]);

  return { stations, loading, loaded, load };
}
