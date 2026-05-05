import { create } from 'zustand';
import type { FlightSearchParams } from '../api/types';

interface SearchState {
    searchParams: FlightSearchParams | null;
    setSearchParams: (params: FlightSearchParams) => void;
    clearSearch: () => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
    searchParams: null,
    setSearchParams: (params) => set({ searchParams: params }),
    clearSearch: () => set({ searchParams: null }),
}));