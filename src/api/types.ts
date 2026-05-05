// Wrapper chung cho mọi API response
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Auth
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export interface RegisterResponse {
    userId: number;
    email: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    status: string;
}

export interface UserProfile {
    email: string;
    fullName: string;
    phone: string;
}

// Flight Search
export interface Airport {
    airportCode: string;
    airportName: string;
    city?: string;
    country?: string;
}

export interface FlightResult {
    flightId: number;
    flightCode: string;
    departureTime: string;
    arrivalTime: string;
    departureAirport: { code: string; name: string };
    arrivalAirport: { code: string; name: string };
    airline: { airlineId: number; airlineName: string; airlineCode: string };
    aircraft: { aircraftId: number; model: string; totalSeats: number };
    basePrice: number;
    availableSeats: number;
    duration: string;
}

export interface FlightSearchParams {
    departure: string;
    arrival: string;
    departureDate: string;
    passengerCount: number;
    seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST';
}