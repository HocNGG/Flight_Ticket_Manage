import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';
import type { FlightSearchRequest, FlightSearchResponse } from "../types/flight/flight";

const flightApi = {
      searchFlight(params:FlightSearchRequest):Promise<ApiResponse<FlightSearchResponse>> {
            return axiosClient.get('/flights',{params});
      }
}
export default flightApi;