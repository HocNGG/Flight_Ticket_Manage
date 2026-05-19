import api from './axiosInstance';
import type {
  ApiResponse,
  FlightRoute,
  CreateRoutePayload,
  UpdateRoutePayload,
} from './types';

const BASE_URL = '/api/routes';

export const routeApi = {
  getAll() {
    return api.get<ApiResponse<FlightRoute[]>>(BASE_URL);
  },

  getById(id: number) {
    return api.get<ApiResponse<FlightRoute>>(`${BASE_URL}/${id}`);
  },

  create(payload: CreateRoutePayload) {
    return api.post<ApiResponse<FlightRoute>>(BASE_URL, payload);
  },

  update(id: number, payload: UpdateRoutePayload) {
    return api.put<ApiResponse<FlightRoute>>(
      `${BASE_URL}/${id}`,
      payload
    );
  },

  remove(id: number) {
    return api.delete<ApiResponse<boolean>>(
      `${BASE_URL}/${id}`
    );
  },
};