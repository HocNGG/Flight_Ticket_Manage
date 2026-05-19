import api from './axiosInstance';
import type { ApiResponse, Service, CreateServicePayload } from './types';

export const serviceApi = {
  getAll: () =>
    api.get<ApiResponse<Service[]>>('/api/service-options'),

  getById: (id: number) =>
    api.get<ApiResponse<Service>>(`/api/service-options/${id}`),

  create: (payload: CreateServicePayload) =>
    api.post<ApiResponse<Service>>('/api/service-options', payload),

  update: (id: number, payload: CreateServicePayload) =>
    api.put<ApiResponse<Service>>(`/api/service-options/${id}`, payload),

  remove: (id: number) =>
    api.delete<ApiResponse<void>>(`/api/service-options/${id}`),
};