import api from './axiosInstance'
import type { Aircraft, ApiResponse } from './types'

export const aircraftApi = {
      getAll:()=> api.get<ApiResponse<Aircraft[]>>('/api/aircrafts'),
      // Lấy thông tin chi tiết một máy bay theo ID
      // GET /api/aircrafts/{id}
      getById: (id: number | string) =>
      api.get<ApiResponse<Aircraft>>(`/api/aircrafts/${id}`),

      // POST /api/aircrafts
      create: (data:Omit<Aircraft, 'aircraftId'>) =>
      api.post<ApiResponse<Aircraft>>('/api/aircrafts', data),

      // PUT /api/aircrafts/{id}
      update: (
      id: number | string,
      data: Partial<Aircraft>
      ) =>
      api.put<ApiResponse<Aircraft>>(
            `/api/aircrafts/${id}`,
            data
      ),

      // DELETE /api/aircrafts/{id}
      remove: (id: number | string) =>
      api.delete<ApiResponse<string>>(
            `/api/aircrafts/${id}`
      ),

      // GET /api/aircrafts/manufacturer/{manufacturer}
      getByManufacturer: (manufacturer: string) =>
      api.get<ApiResponse<Aircraft[]>>(
            `/api/aircrafts/manufacturer/${manufacturer}`
      )
}