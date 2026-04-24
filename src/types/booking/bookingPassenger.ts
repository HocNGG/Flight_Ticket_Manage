import type { PassengerInfo } from "../passenger/passenger"

export interface BookingPassengerRequest{
      flightSeatId:number,
      passengerData:PassengerInfo,
      serviceOptions:BookingServiceRequest[],
      baggageOptions:BookingBaggageRequest[]
}

export interface BookingServiceRequest{
      serviceOptionId:number,
      quantity:number   
}

export interface BookingBaggageRequest{
      baggageOptionId:number,
      quantity:number   
}