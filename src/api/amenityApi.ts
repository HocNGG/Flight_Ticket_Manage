import api from './axiosInstance';

import type {
  ApiResponse,
  Amenity,
  CreateAmenityPayload,
} from './types';

export const amenityApi = {
  getAll: () =>
    api.get<ApiResponse<Amenity[]>>(
      '/api/amenities'
    ),

  getById: (id: number) =>
    api.get<ApiResponse<Amenity>>(
      `/api/amenities/${id}`
    ),

  create: (payload: CreateAmenityPayload) =>
    api.post<ApiResponse<Amenity>>(
      '/api/amenities',
      payload
    ),

  update: (
    id: number,
    payload: CreateAmenityPayload
  ) =>
    api.put<ApiResponse<Amenity>>(
      `/api/amenities/${id}`,
      payload
    ),

  remove: (id: number) =>
    api.delete<ApiResponse<void>>(
      `/api/amenities/${id}`
    ),
};