import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';
import type { FlightDTO, FlightSearchRequest, FlightSearchResponse } from "../types/flight/flight";
import type { SeatMapResponse } from '../types/flight/seat';

const flightApi = {
      searchFlight(params:FlightSearchRequest):Promise<ApiResponse<FlightSearchResponse>> {
            return axiosClient.get('/flights',{params});
      },
      getFlightDetail(flightId:number):Promise<ApiResponse<FlightDTO>> {
            return axiosClient.get(`/flights/${flightId}`);
      },
      getSeatsByFlight(flightId:number):Promise<ApiResponse<SeatMapResponse>>{
            return axiosClient.get(`/flights/${flightId}/seats`);
      }
}
export default flightApi;