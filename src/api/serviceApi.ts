import type { ApiResponse } from "../types/api";
import type { ServiceOptionDTO } from "../types/option/serviceoption";
import axiosClient from "./axiosClient";

const serviceApi = {
      getAllService():Promise<ApiResponse<ServiceOptionDTO[]>>{
            return axiosClient.get(`/services`);
      }

}
export default serviceApi;