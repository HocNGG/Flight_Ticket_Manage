// hooks/useBookings.ts
// Quản lý tất cả API calls liên quan đến đặt chỗ (booking)

import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import type { ApiResponse, Booking, BookingCreated } from '../api/types';

// --- Types khớp với BE DTO ---
export type PassengerDataInput = {
  fullName: string;         // BE: fullName (không tách firstName/lastName)
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;      // YYYY-MM-DD
  passportNumber: string;   // bắt buộc
  nationality: string;
  cccd?: string;            // optional
};

export type BookingPassengerInput = {
  flightSeatId: number;           // ID ghế — nằm trong từng passenger
  passengerData: PassengerDataInput;
};

export type CreateBookingInput = {
  flightId: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  passengers: BookingPassengerInput[];   // mỗi passenger chứa flightSeatId riêng
};

// --- Hooks ---

// Tạo booking mới → POST /api/bookings
// Trả về bookingId + bookingCode để dùng cho ZaloPay
export function useCreateBooking() {
  return useMutation({
    mutationFn: (body: CreateBookingInput) =>
      api.post<ApiResponse<BookingCreated>>('/api/bookings', body),
  });
}

// Danh sách booking của user hiện tại → GET /api/bookings
// Server tự lọc theo JWT token (không cần truyền userId)
export function useMyBookings() {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Booking[]>>('/api/bookings');
      return res.data?.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// Hủy booking → POST /api/bookings/:id/cancel
export function useCancelBooking() {
  return useMutation({
    mutationFn: ({
      bookingId,
      reason,
      refundAccountNumber,
      refundBankName,
    }: {
      bookingId: number;
      reason: string;
      refundAccountNumber?: string;
      refundBankName?: string;
    }) =>
      api.post(`/api/bookings/${bookingId}/cancel`, {
        reason,
        refundAccountNumber,
        refundBankName,
      }),
  });
}

// 1. Lấy CHI TIẾT 1 booking theo ID (Dùng khi đã đăng nhập hoặc từ kết quả thanh toán)
// GET /api/bookings/:id/detail
export function useBookingDetail(bookingId: number | string | null) {
  return useQuery({
    queryKey: ['bookingDetail', bookingId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any>>(`/api/bookings/${bookingId}/detail`);
      return res.data?.data;
    },
    enabled: !!bookingId, // Chỉ chạy khi có ID
  });
}

// 2. Tra cứu booking theo Mã Code PNR (Dành cho khách vãng lai chưa đăng nhập)
// GET /api/bookings/code/:code
export function useBookingByCode(code: string | null) {
  return useQuery({
    queryKey: ['bookingByCode', code],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any>>(`/api/bookings/code/${code}`);
      return res.data?.data;
    },
    enabled: !!code, // Chỉ chạy khi người dùng nhập code
  });
}
