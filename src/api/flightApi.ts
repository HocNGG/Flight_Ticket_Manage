import api from './axiosInstance';
import type { ApiResponse, FlightResult, Airport, FlightSearchParams } from './types';

export const flightApi = {
    // API chính: GET /api/flights?departure=...
    searchFlights: (params: FlightSearchParams) =>
        api.get<ApiResponse<{ flights: FlightResult[] }>>('/api/flights', { params }),

    // Dùng cho dropdown sân bay — gọi 1 lần, cache dài
    getAirports: () =>
        api.get<ApiResponse<Airport[]>>('/api/airports/general'),

    getFlightById: (id: number) =>
        api.get<ApiResponse<FlightResult>>(`/api/flights/${id}`),
};