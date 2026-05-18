import api from './axiosInstance'
import type { Airport, ApiResponse } from './types'

export type CreateAirport = Omit<
  Airport,
  'airportId'
>

export const airportApi = {
  // GET /api/airports
  getAll: () =>
    api.get<ApiResponse<Airport[]>>(
      '/api/airports'
    ),

  // GET /api/airports/{id}
  getById: (id: number | string) =>
    api.get<ApiResponse<Airport>>(
      `/api/airports/${id}`
    ),

  // GET /api/airports/code/{code}
  getByCode: (code: string) =>
    api.get<ApiResponse<Airport>>(
      `/api/airports/code/${code}`
    ),

  // POST /api/airports
  create: (data: CreateAirport) =>
    api.post<ApiResponse<Airport>>(
      '/api/airports',
      data
    ),

  // PUT /api/airports/{id}
  update: (
    id: number | string,
    data: Partial<CreateAirport>
  ) =>
    api.put<ApiResponse<Airport>>(
      `/api/airports/${id}`,
      data
    ),

  // DELETE /api/airports/{id}
  remove: (id: number | string) =>
    api.delete<ApiResponse<void>>(
      `/api/airports/${id}`
    ),
}