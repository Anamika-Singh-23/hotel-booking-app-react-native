// src/hooks/useHotels.ts

import { useState, useEffect, useCallback } from 'react';
import { hotelService, HotelServiceError }  from '../services/hotelService';
import { Hotel, UseHotelsReturn }           from '../types/hotel.types';

export const useHotels = (): UseHotelsReturn => {

  const [hotels,  setHotels]  = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

    // ── Core fetch logic ───────────────────────────────────────────────────────
    // isPullToRefresh flag decides which spinner to show
    // true  → isRefreshing (FlatList top spinner)
    // false → loading      (full screen spinner)


  const fetchHotels = useCallback(async (
    isPullToRefresh: boolean = false,
  ): Promise<void> => {

    // Set the RIGHT loading indicator — never both at once
    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    // Always clear previous error before a new attempt
    setError(null); 

    try {
      const response = await hotelService.getHotels();
      setHotels(response.data);

    } catch (err) {
      // Known service error
      if (err instanceof HotelServiceError) {
        setError(err.message);
      } else {
        // Unknown error (network down, etc.)
        setError('Something went wrong. Please try again.');
      }
      // Keep whatever hotels were there before — don't wipe on refresh fail
      // On first load hotels is [] so nothing shows, which is correct

    } finally {
      // Always turn off whichever spinner we turned on
      if (isPullToRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchHotels(false); // isPullToRefresh = false → full screen loader
  }, [fetchHotels]);

  // ── Public refetch function ────────────────────────────────────────────────
  // Used by:
  //   1. FlatList onRefresh     → isPullToRefresh = true
  //   2. Error retry button     → isPullToRefresh = false (show full loader again)

  const refetch = useCallback((isPullToRefresh: boolean = false): void => {
    fetchHotels(isPullToRefresh);
  }, [fetchHotels]);

  return {
    hotels,
    loading,
    isRefreshing,
    error,
    refetch,
  };
};