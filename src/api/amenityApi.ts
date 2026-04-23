import type { ApiResponse } from "../types/api";
import type { AmenityDTO } from "../types/option/amenity";
import axiosClient from "./axiosClient";

const amenityApi = {
      getAllService():Promise<ApiResponse<AmenityDTO[]>>{
            return axiosClient.get(`/amenities`);
      }
}
export default amenityApi;