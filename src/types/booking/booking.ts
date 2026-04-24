import type { BookingPassengerRequest } from "./bookingPassenger";

export interface CreateBookingRequest{
      contactEmail:string,
      contactPhone:string,
      contactName:string,
      flightId:number,
      passengers:BookingPassengerRequest[]
}