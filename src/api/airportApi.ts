import axiosClient from './axiosClient';
import type { AirportDTO,AirportGeneral } from '../types/flight/airport';
import type { ApiResponse } from '../types/api';
 
const airportApi = {
      getAirportsGeneral():Promise<ApiResponse<AirportGeneral[]>>
      {
            return axiosClient.get('airports/general');
      },

      getAllAirports():Promise<ApiResponse<AirportDTO>>
      {
            return axiosClient.get('airports');
      },
      getAirportsByCode(airportCode:string):Promise<ApiResponse<AirportDTO>>
      {
            return axiosClient.get(`airports/code/${airportCode}`);
      }
}
export default airportApi;