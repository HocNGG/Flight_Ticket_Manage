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

// Item trong GET /api/aircrafts
export type Aircraft = {
    aircraftId: number;
    model: string;
    manufacturer: string;
    totalSeats: number;
};

export type Airport = { 
    airportId: number; 
    airportCode: string; 
    airportName: string; 
    city: string; 
    country: string 
};

export type Airline = {
  airlineId: number
  code: string;   // API field
  name: string;   // API field
  country: string;
  establishedYear: number;
};

export interface FlightRoute {
  routeId: number;

  departureAirportId: number;
  arrivalAirportId: number;

  departureAirportCode: string;
  departureAirportName: string;

  arrivalAirportCode: string;
  arrivalAirportName: string;

  distance: number;

  duration: string;
}

export type CreateRoutePayload = Omit<
  FlightRoute,
  | 'routeId'
  | 'departureAirportCode'
  | 'departureAirportName'
  | 'arrivalAirportCode'
  | 'arrivalAirportName'
>;

export type UpdateRoutePayload = CreateRoutePayload;

export type Service = {
  serviceId: number;
  serviceName: string;
  type: string;
  description: string;
  price: number;
};

export type CreateServicePayload = Omit<
  Service,
  | 'serviceId'
>;


export type Baggage = {
  baggageOptionId: number;
  baggageType: string;
  description: string;
  price: number;
  weightLimit: number;
};

export type CreateBaggagePayload = Omit<
  Baggage,
  | 'baggageOptionId'
>;