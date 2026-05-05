import { useQuery } from '@tanstack/react-query';
import { flightApi } from '../api/flightApi';
import type { FlightSearchParams } from '../api/types';

// Airports: gọi 1 lần, cache 30 phút — dùng cho dropdown
export function useAirports() {
    return useQuery({
        queryKey: ['airports'],
        queryFn: () => flightApi.getAirports().then((r) => r.data.data),
        staleTime: 30 * 60 * 1000, // 30 phút
    });
}

// Flight Search: chỉ chạy khi có đủ params
export function useSearchFlights(params: FlightSearchParams | null) {
    return useQuery({
        queryKey: ['flights', params],   // cache riêng theo từng bộ params
        queryFn: () =>
            flightApi.searchFlights(params!).then((r) => r.data.data.flights),
        enabled: !!params,               // QUAN TRỌNG: không gọi khi chưa có params
        staleTime: 2 * 60 * 1000,        // 2 phút — giá vé có thể thay đổi
    });
}