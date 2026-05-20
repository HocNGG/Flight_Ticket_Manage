import api from './axiosInstance';
import type { ApiResponse, DynamicPrice, DynamicPricePayload } from './types';

export const dynamicPriceApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<DynamicPrice[]>>('/api/dynamic-prices');
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get<ApiResponse<DynamicPrice>>(`/api/dynamic-prices/${id}`);
    return res.data;
  },

  create: async (payload: DynamicPricePayload) => {
    const res = await api.post<ApiResponse<DynamicPrice>>(
      '/api/dynamic-prices',
      payload
    );

    return res.data;
  },

  update: async (
    id: number,
    payload: DynamicPricePayload
  ) => {
    const res = await api.put<ApiResponse<DynamicPrice>>(
      `/api/dynamic-prices/${id}`,
      payload
    );

    return res.data;
  },

  delete: async (id: number) => {
    const res = await api.delete<ApiResponse<string>>(
      `/api/dynamic-prices/${id}`
    );

    return res.data;
  },

  getActive: async (startDate: string, endDate: string) => {
    const res = await api.get<ApiResponse<DynamicPrice[]>>(
      '/api/dynamic-prices/active',
      {
        params: {
          startDate,
          endDate,
        },
      }
    );

    return res.data;
  },
};