import api from './axiosInstance';
import type { ApiResponse, FlightResult, Airport, FlightSearchParams } from './types';

type AirlineSummary = {
    airlineId: number;
};

type RawFlight = {
    flightId: number;
    flightNumber?: string;
    flightCode?: string;
    departureTime: string;
    arrivalTime: string;
    duration?: string;
    airline?: {
        airlineId?: number;
        name?: string;
        airlineName?: string;
        code?: string;
        airlineCode?: string;
    };
    departureAirport?: {
        airportCode?: string;
        code?: string;
        airportName?: string;
        name?: string;
    };
    arrivalAirport?: {
        airportCode?: string;
        code?: string;
        airportName?: string;
        name?: string;
    };
    seats?: {
        totalSeats?: number;
        availableSeats?: number;
        seatsByClass?: Record<string, { availableSeats?: number; price?: number }>;
    };
    basePrice?: number;
    availableSeats?: number;
    aircraft?: { aircraftId?: number; model?: string; totalSeats?: number };
    aircraftModel?: string;
};

const normalizeFlight = (flight: RawFlight, preferredSeatClass: FlightSearchParams['seatClass'] = 'ECONOMY'): FlightResult => {
    const byClass = flight.seats?.seatsByClass ?? {};
    const selectedClass = byClass[preferredSeatClass];
    const economyClass = byClass.ECONOMY;
    const anyClass = Object.values(byClass)[0];

    const selectedPrice = selectedClass?.price ?? economyClass?.price ?? anyClass?.price ?? flight.basePrice ?? 0;
    const selectedAvailableSeats =
        selectedClass?.availableSeats ?? economyClass?.availableSeats ?? anyClass?.availableSeats ?? flight.availableSeats ?? flight.seats?.availableSeats ?? 0;

    return {
        flightId: flight.flightId,
        flightCode: flight.flightCode ?? flight.flightNumber ?? `FL-${flight.flightId}`,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        departureAirport: {
            code: flight.departureAirport?.code ?? flight.departureAirport?.airportCode ?? '',
            name: flight.departureAirport?.name ?? flight.departureAirport?.airportName ?? '',
        },
        arrivalAirport: {
            code: flight.arrivalAirport?.code ?? flight.arrivalAirport?.airportCode ?? '',
            name: flight.arrivalAirport?.name ?? flight.arrivalAirport?.airportName ?? '',
        },
        airline: {
            airlineId: flight.airline?.airlineId ?? 0,
            airlineName: flight.airline?.airlineName ?? flight.airline?.name ?? 'Unknown Airline',
            airlineCode: flight.airline?.airlineCode ?? flight.airline?.code ?? '--',
        },
        aircraft: {
            aircraftId: flight.aircraft?.aircraftId ?? 0,
            model: flight.aircraft?.model ?? flight.aircraftModel ?? '',
            totalSeats: flight.aircraft?.totalSeats ?? flight.seats?.totalSeats ?? 0,
        },
        basePrice: Number(selectedPrice) || 0,
        availableSeats: Number(selectedAvailableSeats) || 0,
        duration: flight.duration ?? '',
    };
};

const toDateKey = (isoOrDate: string) => {
    if (!isoOrDate) return '';
    return isoOrDate.slice(0, 10);
};

export const flightApi = {
    // API chính: GET /api/flights?departure=...
    searchFlights: async (params: FlightSearchParams) => {
        const allFlights = await flightApi.getAllFlights(params.seatClass);
        const selectedDate = toDateKey(params.departureDate);

        return allFlights
            .filter((flight) =>
                flight.departureAirport.code === params.departure
                && flight.arrivalAirport.code === params.arrival
                && toDateKey(flight.departureTime) >= selectedDate
                && flight.availableSeats >= params.passengerCount
            )
            .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    },

    // Fallback theo tài liệu API:
    // 1) GET /api/airlines
    // 2) GET /api/flights/airline/{airlineId}
    getAllFlights: async (preferredSeatClass: FlightSearchParams['seatClass'] = 'ECONOMY') => {
        const airlinesResponse = await api.get<ApiResponse<AirlineSummary[]>>('/api/airlines');
        const airlines = airlinesResponse.data.data ?? [];

        const flightResponses = await Promise.all(
            airlines.map((airline) =>
                api.get<ApiResponse<RawFlight[]>>(`/api/flights/airline/${airline.airlineId}`)
            )
        );

        const allFlights = flightResponses
            .flatMap((response) => response.data.data ?? [])
            .map((flight) => normalizeFlight(flight, preferredSeatClass));
        const uniqueFlights = [...new Map(allFlights.map((flight) => [flight.flightId, flight])).values()];

        return uniqueFlights;
    },

    // Dùng cho dropdown sân bay — gọi 1 lần, cache dài
    getAirports: () =>
        api.get<ApiResponse<Airport[]>>('/api/airports/general'),

    getFlightById: async (id: number) => {
        const response = await api.get<ApiResponse<RawFlight>>(`/api/flights/${id}`);
        return normalizeFlight(response.data.data, 'ECONOMY');
    },
};