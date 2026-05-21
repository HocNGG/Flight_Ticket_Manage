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

export type UserRole = 'passenger' | 'admin' | 'staff';

export interface UserProfile {
    email: string;
    fullName: string;
    phone: string;
    role: UserRole; // Trả về từ GET /api/users/me
}


export interface FlightResult {
    flightId: number;
    flightNumber: string;
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

export interface SeatClassRange {
    className: string;
    label: string;
    rowStart: number;
    rowEnd: number;
    price: number;
    totalSeats: number;
    availableSeats: number;
}

export interface FlightSeatsMapResponse {
    flightId: number;
    aircraft: string;
    seatClassRanges: SeatClassRange[];
    seats: SeatItem[];
}

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

export type Amenity = {
  amenityId: number;
  code: string;
  name: string;
  description: string;
};

export type CreateAmenityPayload = Omit<
  Amenity,
  | 'amenityId'
>;


export type CreateSeatClassPayload  = Omit<SeatClass,|'seatClassId'>;

export type AdjustmentType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type DynamicPrice = {
  priceId: number;
  flightId: number;
  flightNumber:string;
  startDate: string;
  endDate: string;

  adjustmentType: AdjustmentType;
  adjustmentValue: number;
}

export type DynamicPricePayload = Omit<DynamicPrice,|'priceId'>;

export type Policy = {
  policyId: number;
  code: string;
  name: string;
  description: string;
};

export type PolicyPayload = Omit<Policy, 'policyId'>;

export type PolicyRule = {
  policyRuleId: number;
  policyId: number;

  hoursBeforeDeparture: number;
  refundPercentage: number;
  changeFee: number;

  allowed: boolean;
};

export type PolicyRulePayload = Omit<
  PolicyRule,
  'policyRuleId'
>;

