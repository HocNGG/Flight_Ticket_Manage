export interface SeatSummaryDTO{
      totalSeats:number,
      availableSeats:number,
      bookedSeats:number,
      seatsByClass:Record<string,SeatDetail>
}

export interface SeatDetail{
      price:string,
      availableSeats:number
}
