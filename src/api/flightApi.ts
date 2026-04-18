import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';
import type { FlightDTO, FlightSearchRequest, FlightSearchResponse } from "../types/flight/flight";

const flightApi = {
      searchFlight(params:FlightSearchRequest):Promise<ApiResponse<FlightSearchResponse>> {
            return axiosClient.get('/flights',{params});
      },
      getFlightDetail(flightId:number):Promise<ApiResponse<FlightDTO>> {
            return axiosClient.get(`flights/${flightId}`);
      }
}
export default flightApi;