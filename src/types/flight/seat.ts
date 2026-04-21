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
