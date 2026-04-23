export interface SeatSummaryDTO{
      totalSeats:number,
      availableSeats:number,
      bookedSeats:number,
      seatsByClass:Record<string,SeatDetail>
}

export interface SeatDetail{
      price:number,
      availableSeats:number
}

export interface SeatDetailDTO{
      flightSeatId:number,
      seatNumber:string,
      seatClass:string,
      status:string,
      price:number
}
export interface SeatRowDTO{
      rowNumber:number,
      seats:SeatDetailDTO[]
}
export interface SeatMapResponse{
      flightId:number,
      aircraft:string,
      rows:SeatRowDTO[]
}