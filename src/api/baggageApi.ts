import api from './axiosInstance';
import type {
  ApiResponse,
  Baggage,
  CreateBaggagePayload,
} from './types';

export const baggageApi = {
  getAll: () =>
    api.get<ApiResponse<Baggage[]>>(
      '/api/baggage-options'
    ),

  getById: (id: number) =>
    api.get<ApiResponse<Baggage>>(
      `/api/baggage-options/${id}`
    ),

  create: (payload: CreateBaggagePayload) =>
    api.post<ApiResponse<Baggage>>(
      '/api/baggage-options',
      payload
    ),

  update: (
    id: number,
    payload: CreateBaggagePayload
  ) =>
    api.put<ApiResponse<Baggage>>(
      `/api/baggage-options/${id}`,
      payload
    ),

  remove: (id: number) =>
    api.delete<ApiResponse<void>>(
      `/api/baggage-options/${id}`
    ),
};