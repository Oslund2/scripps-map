import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function useFccStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!supabase || loaded || loading) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('fcc_stations')
      .select('callsign, channel, city, state, lat, lon, network, owner_group, dma_name, dma_rank, is_scripps, is_inyo')
      .order('dma_rank', { ascending: true });
    if (!error && data) {
      setStations(data);
      setLoaded(true);
    }
    setLoading(false);
  }, [loaded, loading]);

  return { stations, loading, loaded, load };
}
