import axiosClient from './axiosClient';
import type { AirportAdmin,AirportGeneral } from '../types/flight/airport';
import type { ApiResponse } from '../types/api';
 
const airportApi = {
      getAirportsGeneral():Promise<ApiResponse<AirportGeneral[]>>
      {
            return axiosClient.get('airports/general');
      },

      getAllAirports():Promise<ApiResponse<AirportAdmin>>
      {
            return axiosClient.get('airports');
      }
}
export default airportApi;