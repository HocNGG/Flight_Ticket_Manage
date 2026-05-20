import api from './axiosInstance';

import type {
  ApiResponse,
  Seat,
  CreateSeatPayload,
  UpdateSeatPayload
} from './types';

export const seatApi = {

  getAll: () =>
    api.get<ApiResponse<Seat[]>>(
      '/api/seats'
    ),

  getById: (seatId: number) =>
    api.get<ApiResponse<Seat>>(
      `/api/seats/${seatId}`
    ),

  getByAircraft: (aircraftId: number) =>
    api.get<ApiResponse<Seat[]>>(
      `/api/seats/aircraft/${aircraftId}`
    ),

  getBySeatClass: (seatClassId: number) =>
    api.get<ApiResponse<Seat[]>>(
      `/api/seats/class/${seatClassId}`
    ),

  create: (payload: CreateSeatPayload) =>
    api.post<ApiResponse<Seat>>(
      '/api/seats',
      payload
    ),

  createBulk: (payload: CreateSeatPayload[]) =>
    api.post<ApiResponse<Seat[]>>(
      '/api/seats/bulk',
      payload
    ),

  update: (
    seatId: number,
    payload: UpdateSeatPayload
  ) =>
    api.put<ApiResponse<Seat>>(
      `/api/seats/${seatId}`,
      payload
    ),

  remove: (seatId: number) =>
    api.delete<ApiResponse<void>>(
      `/api/seats/${seatId}`
    ),
};