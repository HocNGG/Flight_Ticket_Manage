import type { AirlineDTO } from "./airline";
import type { AirportDTO } from "./airport";
import type { SeatSummaryDTO } from "./seat";

export interface FlightSearchRequest{
      departure : string,
      arrival : string,
      departureDate: string,
      passengerCount: number,
      isRoundTrip?: boolean,
      returnDate?: string
}

export interface FlightSearchResponse{
      from:string,
      to:string,
      isRoundTrip: boolean,
      totalResults:number,
      results:AirlineFlightGroup[]
}
export interface AirlineFlightGroup{
      airlineId:number,
      airlineName:string,
      outboundFlights:FlightDTO[],
      inboundFlights:FlightDTO[]
}
export interface FlightDTO{
      flightId:number,
      flightNumber:string,
      airline: AirlineDTO
      departureAirport: AirportDTO,
      arrivalAirport: AirportDTO,
      departureTime:Date,
      arrivalTime:Date,
      duration:string,
      aircraftModel:string,
      status:string,
      seats:SeatSummaryDTO
}