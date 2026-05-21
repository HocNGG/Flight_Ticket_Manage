import api from './axiosInstance';

import type {
  ApiResponse,
  BookingAdmin,
  BookingDetails,
  BookingStatus,
} from './types';

export const bookingApi = {
      getAllForAdmin: () =>api.get<ApiResponse<BookingAdmin[]>>('/api/bookings/admin'),

      getDetail(id: number) { return api.get<ApiResponse<BookingDetails>>(`/api/bookings/${id}/detail`);},

      updateStatus: (bookingId: number,status: BookingStatus) =>
            api.put<ApiResponse<string>>(`/api/admin/bookings/${bookingId}/status/${status}`
      ),
      approveCancel(id: number) { return api.put<ApiResponse<string>>(`/api/bookings/${id}/cancel/approve`);
  },
};