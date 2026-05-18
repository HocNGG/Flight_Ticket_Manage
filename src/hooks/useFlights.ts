import { useQuery } from '@tanstack/react-query';
import { flightApi } from '../api/flightApi';
import type { FlightSearchParams } from '../api/types';

const hasRequiredSearchParams = (params: FlightSearchParams | null): params is FlightSearchParams => {
    if (!params) return false;
    if (!params.departure?.trim() || !params.arrival?.trim() || !params.departureDate?.trim()) return false;
    if (!Number.isFinite(params.passengerCount) || params.passengerCount < 1) return false;
    return true;
};

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
    const shouldFetch = hasRequiredSearchParams(params);

    return useQuery({
        queryKey: ['flights', params],   // cache riêng theo từng bộ params
        queryFn: () => flightApi.searchFlights(params!),
        enabled: shouldFetch,
        staleTime: 2 * 60 * 1000,        // 2 phút — giá vé có thể thay đổi
        refetchOnWindowFocus: false,
        retry: 1,
    });
}

export function useAllFlights() {
    return useQuery({
        queryKey: ['all-flights'],
        queryFn: () => flightApi.getAllFlights('ECONOMY'),
        enabled: false,
        staleTime: 2 * 60 * 1000,
    });
}

export function useFlightDetail(id: string | undefined) {
    const flightId = Number(id);

    return useQuery({
        queryKey: ['flight', id],
        queryFn: () => flightApi.getFlightById(flightId),
        enabled: Boolean(id) && Number.isFinite(flightId),
        staleTime: 5 * 60 * 1000,
    });
}

// Seat classes — cache dài vì priceMultiplier ít thay đổi
export function useSeatClasses() {
    return useQuery({
        queryKey: ['seat-classes'],
        queryFn: () => flightApi.getSeatClasses().then((r) => r.data.data),
        staleTime: 30 * 60 * 1000, // 30 phút
    });
}

// Sơ đồ ghế theo flight — cache ngắn vì tình trạng ghế thay đổi thường xuyên
export function useFlightSeats(flightId: string | number | undefined) {
    const id = Number(flightId);
    return useQuery({
        queryKey: ['seats', id],
        queryFn: () => flightApi.getFlightSeats(id),
        enabled: Boolean(flightId) && Number.isFinite(id),
        staleTime: 2 * 60 * 1000, // 2 phút
    });
}