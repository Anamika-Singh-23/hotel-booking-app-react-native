// src/types/hotel.types.ts

export interface Hotel {
  id:          string;
  name:        string;
  location:    string;
  description: string;      // 🆕 added description
  price:       number;      // per night, in INR
  rating:      number;      // 1.0 – 5.0
  image:       string;      // URL string (fake for now)
}

// What the service returns
export interface HotelListResponse {
  success: boolean;
  data:    Hotel[];
}

// What the hook exposes to UI
export interface UseHotelsReturn {
  hotels:       Hotel[];
  loading:      boolean;   // true ONLY on first load — drives full screen spinner
  isRefreshing: boolean;   // true ONLY on pull-to-refresh — drives FlatList spinner
  error:        string | null;
  refetch:      (isPullToRefresh?: boolean) => void; // replaces old "refresh" — works for both retry + PTR
}