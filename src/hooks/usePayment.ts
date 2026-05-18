import { useMutation } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import type { ApiResponse } from '../api/types';

export function useCreateZaloPayUrl() {
  return useMutation({
    mutationFn: ({ bookingId, amount }: { bookingId: number; amount: number }) =>
      api.post<ApiResponse<string>>(
        `/api/payments/zalopay/create-url?bookingId=${bookingId}&amount=${amount}`
      ),
  });
}
