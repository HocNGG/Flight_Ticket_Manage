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

// SeatClass — từ GET /api/seat-classes
export interface SeatClass {
    seatClassId: number;
    className: 'ECONOMY' | 'BUSINESS' | 'FIRST' | 'PREMIUM_ECONOMY';
    description: string;
    priceMultiplier: number;   // Nhân với flight.basePrice để ra giá vé
}

// SeatItem — từ GET /api/flights/:id/seats (sau khi flatten rows[])
export type SeatItem = {
    flightSeatId: number;
    seatNumber: string;
    seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST' | 'PREMIUM_ECONOMY';
    status: 'AVAILABLE' | 'BOOKED';
    price: number;
};

// Kết quả POST /api/bookings
export type BookingCreated = {
    bookingId: number;
    bookingCode: string;
    flightId: number;
    totalPrice: number;
    status: 'PENDING_PAYMENT';
    passengers: { passengerCode: string; firstName: string; lastName: string; seatNumber: string }[];
    bookingDate: string;
};

// Item trong GET /api/bookings
export type Booking = {
    bookingId: number;
    contactEmail: string;
    contactPhone: string;
    contactName: string;
    bookingCode: string;
    bookingDate: string;
    status: 'PENDING' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
    totalPrice: number;
    flight: {
        flightId: number;
        flightNumber: string;
        departureTime: string;
        arrivalTime: string;
        airline?: { name: string };
        route?: {
            departureAirport: { airportCode: string; city: string };
            arrivalAirport: { airportCode: string; city: string };
        };
    };
    passengers: any[];
    refund?: {
        status: string;
    };
};

