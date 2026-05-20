import api from './axiosInstance';
import type { ApiResponse, CreateSeatClassPayload, SeatClass } from './types';

export const seatClassApi = {
  getAll: () =>
    api.get<ApiResponse<SeatClass[]>>('/api/seat-classes'),

  getById: (id: number) =>
    api.get<ApiResponse<SeatClass>>(`/api/seat-classes/${id}`),

  create: (payload: CreateSeatClassPayload) =>
    api.post<ApiResponse<SeatClass>>('/api/seat-classes', payload),

  update: (id: number, payload: CreateSeatClassPayload) =>
    api.put<ApiResponse<SeatClass>>(`/api/seat-classes/${id}`, payload),

  remove: (id: number) =>
    api.delete<ApiResponse<void>>(`/api/seat-classes/${id}`),
};