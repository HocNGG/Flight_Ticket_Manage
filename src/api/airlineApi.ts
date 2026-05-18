import api from './axiosInstance'
import type {
  Airline,
  ApiResponse
} from './types'

export type CreateAirline = Omit<
  Airline,
  'airlineId'
>

export const airlineApi = {
  // GET /api/airlines
  getAll: () =>
    api.get<ApiResponse<Airline[]>>(
      '/api/airlines'
    ),

  // GET /api/airlines/{id}
  getById: (id: number | string) =>
    api.get<ApiResponse<Airline>>(
      `/api/airlines/${id}`
    ),

  // POST /api/airlines
  create: (data: CreateAirline) =>
    api.post<ApiResponse<Airline>>(
      '/api/airlines',
      data
    ),

  // PUT /api/airlines/{id}
  update: (
    id: number | string,
    data: Partial<CreateAirline>
  ) =>
    api.put<ApiResponse<Airline>>(
      `/api/airlines/${id}`,
      data
    ),

  // DELETE /api/airlines/{id}
  remove: (id: number | string) =>
    api.delete<ApiResponse<void>>(
      `/api/airlines/${id}`
    ),
}