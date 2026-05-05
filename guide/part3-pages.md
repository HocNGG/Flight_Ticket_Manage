# 🛫 FE Integration Guide — Part 3: Booking Flow (5 Trang Còn Lại)

> **Mục tiêu**: Xóa mock data, kết nối API thực, đảm bảo luồng dữ liệu đúng giữa các trang.
> **Stack**: React Query `useMutation` / `useQuery` | Zustand | `navigate state` để truyền dữ liệu giữa pages.

---

## Tổng quan luồng dữ liệu

```
FlightResults → [navigate state] → FlightDetail → [navigate state] → SeatSelection
    ↓
  Gọi POST /api/bookings → nhận bookingId + bookingCode
    ↓
  Payment → [redirect] → PaymentResult (đọc URL params từ ZaloPay)
    ↓
  MyBookings (đọc GET /api/bookings — danh sách booking của user)
```

---

## 📄 TRANG 6 — `FlightDetail.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `flight` | **React Query** `useQuery` | Gọi `GET /api/flights/:id`, cache theo id |
| `selectedClass` | `useState` | UI toggle hạng ghế — local |
| `id` (flightId) | `useParams` | Đọc từ URL `/detail/:id` |

> ✅ **Không cần Zustand** — data chỉ dùng trong trang này, truyền tiếp sang SeatSelection qua `navigate state`.
> ❌ Xóa `mockFlight` và `seatClassOptions` hardcode.

### Thêm hook vào `useFlights.ts`

```ts
// src/hooks/useFlights.ts — THÊM:
export function useFlightDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['flight', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<FlightDetail>>(`/api/flights/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // cache 5 phút
  });
}
```

### Code tích hợp

```tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlightDetail } from '../../../hooks/useFlights';
import { useSearchStore } from '../../../store/useSearchStore';

// Hạng ghế hardcode phía client — không cần API riêng
const seatClassOptions = [
  { seatClassId: 1, className: 'ECONOMY' as const, description: 'Hạng phổ thông', basePrice: 0 },
  { seatClassId: 2, className: 'BUSINESS' as const, description: 'Hạng thương gia', multiplier: 2 },
  { seatClassId: 3, className: 'FIRST' as const, description: 'Hạng nhất', multiplier: 3.6 },
];

export const FlightDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { searchParams } = useSearchStore(); // lấy passengerCount

  const [selectedClass, setSelectedClass] = useState(seatClassOptions[0]);

  // React Query — gọi API, cache 5 phút
  const { data: flight, isLoading, isError } = useFlightDetail(id);

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isError || !flight) return (
    <div className="text-center py-32">
      <p className="text-gray-700 font-bold">Không thể tải thông tin chuyến bay</p>
    </div>
  );

  // Tính giá theo hạng — basePrice × multiplier
  const classPrice = selectedClass.seatClassId === 1
    ? flight.basePrice
    : selectedClass.seatClassId === 2
      ? flight.basePrice * 2
      : flight.basePrice * 3.6;

  const handleBook = () => {
    navigate('/booking/seat', {
      state: {
        flightId: flight.flightId,
        seatClass: selectedClass.className,   // ECONOMY | BUSINESS | FIRST
        flightCode: flight.flightCode,
        departureAirport: flight.departureAirport,
        arrivalAirport: flight.arrivalAirport,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        basePrice: classPrice,
      },
    });
  };

  // JSX: giữ nguyên, thay mockFlight → flight, thay totalPrice → classPrice
};
```

---

## 📄 TRANG 7 — `SeatSelection.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `passenger` | `useState` | Form hành khách — local |
| `contact` | `useState` | Form liên hệ — local |
| `selectedSeat` | `useState` (từ `useSeatSelection`) | Ghế đang chọn — local |
| `seats` (sơ đồ ghế) | **React Query** `useQuery` | Gọi `GET /api/flights/:id/seats` |
| `createBooking` | **React Query** `useMutation` | Gọi `POST /api/bookings` |
| `bookingState` | `navigate state` | Đọc từ FlightDetail |

> ⚠️ **Quan trọng**: Hiện tại `handleProceedToPayment` dùng `bookingCode` mock. Cần thay bằng gọi API thật `POST /api/bookings` và dùng `bookingId` từ response để tạo link ZaloPay.

### Thêm hook vào `useFlights.ts` và `useBookings.ts`

```ts
// src/hooks/useFlights.ts — THÊM:
export function useFlightSeats(flightId: string | number | undefined) {
  return useQuery({
    queryKey: ['seats', flightId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ flightId: number; seats: SeatItem[] }>>(
        `/api/flights/${flightId}/seats`
      );
      return res.data.data.seats;
    },
    enabled: !!flightId,
    staleTime: 2 * 60 * 1000, // cache 2 phút — ghế thay đổi thường xuyên
  });
}

// src/hooks/useBookings.ts — TẠO MỚI:
import { useMutation } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import type { ApiResponse } from '../api/types';

export function useCreateBooking() {
  return useMutation({
    mutationFn: (body: {
      flightId: number;
      passengers: PassengerForm[];
      seatIds: number[];
      contactName: string;
      contactEmail: string;
      contactPhone: string;
    }) => api.post<ApiResponse<BookingCreated>>('/api/bookings', body),
  });
}
```

### Code tích hợp `handleProceedToPayment`

```tsx
import { useCreateBooking } from '../../../hooks/useBookings';

export const SeatSelection = () => {
  // ... state hiện tại giữ nguyên ...

  const createBooking = useCreateBooking();

  const handleProceedToPayment = async () => {
    if (!selectedSeat) {
      alert('Vui lòng chọn ghế trước khi tiếp tục.');
      return;
    }

    // Tìm seatId từ danh sách seats API (nếu có)
    // Tạm thời: dùng selectedSeat (string seatNumber) nếu chưa có seatId
    createBooking.mutate(
      {
        flightId: Number(bookingState?.flightId),
        passengers: [passenger],              // mảng 1 hành khách
        seatIds: [/* seatId từ API */],        // cần map selectedSeat → seatId
        contactName: contact.contactName,
        contactEmail: contact.contactEmail,
        contactPhone: contact.contactPhone,
      },
      {
        onSuccess: (res) => {
          const { bookingId, bookingCode, totalPrice } = res.data.data;
          navigate('/booking/payment', {
            state: {
              bookingId,                       // ← dùng cho ZaloPay API
              bookingCode,                     // ← hiển thị cho user
              totalPrice,                      // ← từ API (đã tính đúng)
              flightId: bookingState?.flightId,
              flightCode: bookingState?.flightCode,
              seatClass: selectedSeatClass,
              selectedSeat,
              passenger,
              contact,
            },
          });
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Không thể tạo đặt chỗ. Vui lòng thử lại.';
          alert(msg);
        },
      }
    );
  };

  // JSX: thêm disabled={createBooking.isPending} cho nút "Tiến hành thanh toán"
  // Thêm loading text: createBooking.isPending ? 'Đang tạo đặt chỗ...' : 'Tiến hành thanh toán'
};
```

### Lưu ý về seatId

`POST /api/bookings` nhận `seatIds: number[]` — đây là `seatId` từ API `GET /api/flights/:id/seats`, **không phải** string như "12A".

```ts
// Sau khi có useFlightSeats(flightId):
const { data: seats = [] } = useFlightSeats(bookingState?.flightId);

// Khi user chọn ghế, lưu cả seatId:
const selectedSeatObj = seats.find(s => s.seatNumber === selectedSeat);
const seatId = selectedSeatObj?.seatId;
// → truyền [seatId] vào POST /api/bookings
```

---

## 📄 TRANG 8 — `Payment.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `state` | `navigate state` | Đọc bookingId, bookingCode, totalPrice từ SeatSelection |
| `createZaloPayUrl` | **React Query** `useMutation` | Gọi `POST /api/payments/zalopay/create-url` |

> ⚠️ **Hiện tại**: dùng `fetch()` thủ công. Cần thay bằng `useMutation` + `axiosInstance` để tự động gắn `Authorization` header.

### Thêm hook `useCreateZaloPayUrl`

```ts
// src/hooks/usePayment.ts — TẠO MỚI:
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
```

### Code tích hợp

```tsx
import { useCreateZaloPayUrl } from '../../../hooks/usePayment';

export const Payment = () => {
  const location = useLocation();
  const state = location.state as PaymentState | null;

  // ← bookingId thật từ SeatSelection (kết quả POST /api/bookings)
  const bookingId = state?.bookingId;
  const totalPrice = state?.totalPrice || 0;

  const createZaloPayUrl = useCreateZaloPayUrl();

  const handlePayWithZaloPay = () => {
    if (!bookingId) {
      alert('Không tìm thấy mã đặt chỗ. Vui lòng thử lại từ đầu.');
      return;
    }

    createZaloPayUrl.mutate(
      { bookingId: Number(bookingId), amount: totalPrice },
      {
        onSuccess: (res) => {
          const zaloPayUrl = res.data.data;
          // Redirect sang trang thanh toán ZaloPay
          window.location.href = zaloPayUrl;
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Không thể tạo link thanh toán.';
          alert(msg);
        },
      }
    );
  };

  // JSX: thay handlePayWithZaloPay async+fetch → mutation ở trên
  // Thêm disabled={createZaloPayUrl.isPending}
  // Text: createZaloPayUrl.isPending ? 'Đang tạo đơn hàng...' : 'Thanh toán qua ZaloPay'
};
```

### Cập nhật `PaymentState` type

```tsx
// Thêm bookingId (số thật từ DB) vào type
type PaymentState = {
  bookingId?: number;        // ← THÊM — dùng cho ZaloPay API
  bookingCode?: string;      // hiển thị cho user
  flightCode?: string;
  seatClass?: string;
  selectedSeat?: string;
  passenger?: { firstName: string; lastName: string };
  contact?: { contactEmail: string; contactPhone: string; contactName: string };
  totalPrice?: number;
};
```

---

## 📄 TRANG 9 — `PaymentResult.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `status` | `useSearchParams` | ZaloPay redirect: `?status=success&bookingId=1` |
| `booking` | **React Query** `useQuery` | Gọi `GET /api/bookings/:id/detail` để lấy đủ thông tin |
| `loading` | từ React Query | Tự quản lý |

> ✅ **Trang này gần hoàn chỉnh** — đã có `fetchBookingDetail` gọi API thật. Chỉ cần chuyển từ `fetch()` thủ công sang **React Query** `useQuery`.

### Code tích hợp

```tsx
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axiosInstance';

// Thay fetchBookingDetail + useState/useEffect → useQuery:
const { data: booking, isLoading } = useQuery({
  queryKey: ['bookingDetail', bookingIdParam],
  queryFn: async () => {
    const res = await api.get<ApiResponse<BookingDetail>>(
      `/api/bookings/${bookingIdParam}/detail`
    );
    return res.data.data;
  },
  enabled: !!bookingIdParam,
  staleTime: 0, // luôn fresh — kết quả thanh toán cần real-time
  retry: 2,     // thử lại 2 lần nếu lỗi network
});
```

### Xử lý URL params từ ZaloPay

ZaloPay redirect về với các params sau (tùy sandbox/production):

```
/booking/payment-result?status=1&bookingId=1&apptransid=260329_123...
/booking/payment-result?status=success&bookingId=1&bookingCode=BK123456
/booking/payment-result?status=failed&reason=cancelled
```

```tsx
// Cập nhật logic xác định isSuccess:
const status = searchParams.get('status');
const bookingIdParam = searchParams.get('bookingId');

const isSuccess = status === '1' || status === 'success' || booking?.status === 'PAID';
const isFailed  = status === '0' || status === 'failed'  || status === 'cancelled';
```

---

## 📄 TRANG 10 — `MyBookings.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `bookings` | **React Query** `useQuery` | Gọi `GET /api/bookings` — server tự filter theo user đang login |
| `selectedBooking` | `useState` | Booking đang chọn để hủy — local modal |
| `showCancelModal` | `useState` | Toggle modal — local UI |
| `cancelReason` | `useState` | Nội dung textarea — local |
| `cancelBooking` | **React Query** `useMutation` | Gọi `POST /api/bookings/:id/cancel` |
| `searchCode` | `useState` | Filter client-side — local |
| `filteredBookings` | **useMemo** | Filter + không gọi thêm API |

> ❌ Xóa `mockBookings`. Server tự biết user đang login nhờ JWT token.

### Thêm hooks vào `useBookings.ts`

```ts
// src/hooks/useBookings.ts — THÊM:

export function useMyBookings() {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Booking[]>>('/api/bookings');
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000, // cache 2 phút
  });
}

export function useCancelBooking() {
  return useMutation({
    mutationFn: ({ bookingId, reason, requestedRefundAmount }: {
      bookingId: number;
      reason: string;
      requestedRefundAmount: number;
    }) => api.post(`/api/bookings/${bookingId}/cancel`, { reason, requestedRefundAmount }),
  });
}
```

### Code tích hợp

```tsx
import { useState, useMemo } from 'react';
import { useMyBookings, useCancelBooking } from '../../../hooks/useBookings';
import { useQueryClient } from '@tanstack/react-query';

export const MyBookings = () => {
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [searchCode, setSearchCode] = useState('');

  // React Query — tự gắn token, server filter theo user
  const { data: bookings = [], isLoading, isError } = useMyBookings();
  const cancelBooking = useCancelBooking();

  // useMemo: filter client-side — không gọi thêm API
  const filteredBookings = useMemo(() =>
    bookings.filter((b) =>
      b.bookingCode.toLowerCase().includes(searchCode.toLowerCase()) ||
      b.flightCode?.toLowerCase().includes(searchCode.toLowerCase())
    ),
    [bookings, searchCode]
  );

  const handleCancelRequest = () => {
    if (!selectedBooking || !cancelReason.trim()) return;

    cancelBooking.mutate(
      {
        bookingId: selectedBooking.bookingId,
        reason: cancelReason,
        requestedRefundAmount: selectedBooking.totalPrice,
      },
      {
        onSuccess: () => {
          // Invalidate cache → tự fetch lại danh sách booking
          queryClient.invalidateQueries({ queryKey: ['myBookings'] });
          setShowCancelModal(false);
          setCancelReason('');
          setSelectedBooking(null);
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Không thể gửi yêu cầu hủy.';
          alert(msg);
        },
      }
    );
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isError) return (
    <div className="text-center py-32">
      <p className="text-gray-700 font-bold">Không thể tải danh sách đặt chỗ</p>
    </div>
  );

  // JSX: thay mockBookings → filteredBookings
  // Modal: thay cancelLoading → cancelBooking.isPending
  //        thay await mock → cancelBooking.mutate(...)
};
```

### Nút "Thanh toán ngay" cho PENDING_PAYMENT

```tsx
// Trong JSX list item:
{booking.status === 'PENDING_PAYMENT' && (
  <button
    onClick={() => navigate('/booking/payment', {
      state: {
        bookingId: booking.bookingId,
        bookingCode: booking.bookingCode,
        totalPrice: booking.totalPrice,
        flightCode: booking.flightCode,
      }
    })}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
  >
    Thanh toán ngay
  </button>
)}
```

---

## 📁 File mới cần tạo

```
src/
├── hooks/
│   ├── useBookings.ts     ← useMyBookings, useCreateBooking, useCancelBooking
│   └── usePayment.ts      ← useCreateZaloPayUrl
```

### `src/hooks/useBookings.ts` — full file

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import type { ApiResponse } from '../api/types';
import type { Booking, BookingCreated } from '../api/types';

export function useMyBookings() {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Booking[]>>('/api/bookings');
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: (body: {
      flightId: number;
      passengers: PassengerForm[];
      seatIds: number[];
      contactName: string;
      contactEmail: string;
      contactPhone: string;
    }) => api.post<ApiResponse<BookingCreated>>('/api/bookings', body),
  });
}

export function useCancelBooking() {
  return useMutation({
    mutationFn: ({ bookingId, reason, requestedRefundAmount }: {
      bookingId: number;
      reason: string;
      requestedRefundAmount: number;
    }) => api.post(`/api/bookings/${bookingId}/cancel`, { reason, requestedRefundAmount }),
  });
}
```

### `src/hooks/usePayment.ts` — full file

```ts
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
```

---

## Types cần thêm vào `src/api/types.ts`

```ts
// Thêm vào types.ts:

export type BookingCreated = {
  bookingId: number;
  bookingCode: string;
  flightId: number;
  totalPrice: number;
  status: 'PENDING_PAYMENT';
  passengers: { passengerCode: string; firstName: string; lastName: string; seatNumber: string }[];
  bookingDate: string;
};

export type Booking = {
  bookingId: number;
  bookingCode: string;
  flightId: number;
  totalPrice: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED' | 'PENDING_APPROVAL';
  bookingDate: string;
};

export type SeatItem = {
  seatId: number;
  seatNumber: string;
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  status: 'AVAILABLE' | 'BOOKED';
  price: number;
};
```

---

## Thứ tự tích hợp khuyến nghị

1. **`types.ts`** — thêm `BookingCreated`, `Booking`, `SeatItem`
2. **`useBookings.ts`** — tạo mới
3. **`usePayment.ts`** — tạo mới
4. **`useFlights.ts`** — thêm `useFlightDetail`, `useFlightSeats`
5. **`FlightDetail.tsx`** — xóa mock, thêm `useFlightDetail`
6. **`SeatSelection.tsx`** — thay `handleProceedToPayment` mock → `useCreateBooking`
7. **`Payment.tsx`** — thay `fetch()` → `useCreateZaloPayUrl`
8. **`PaymentResult.tsx`** — thay `useState+useEffect+fetch` → `useQuery`
9. **`MyBookings.tsx`** — xóa mock, thêm `useMyBookings` + `useCancelBooking`
