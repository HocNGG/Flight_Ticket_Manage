# 🛫 FE Integration Guide — Part 3: Booking Flow (5 Trang Còn Lại)

> **Mục tiêu**: Xóa mock data, kết nối API thực, đảm bảo luồng dữ liệu đúng giữa các trang.
> **Stack**: React Query `useMutation` / `useQuery` | Zustand | `navigate state` để truyền dữ liệu giữa pages.

---

## Tổng quan luồng dữ liệu

```
FlightResults → [navigate state] → FlightDetail → [navigate state] → SeatSelection
                                                                          ↓
                                                          POST /api/bookings → bookingId
                                                                          ↓
                                                 Payment → [redirect ZaloPay] → PaymentResult
                                                                          ↓
                                                          MyBookings (GET /api/bookings)
```

### Mô hình giá (quan trọng)

```
Giá hiển thị = flight.basePrice × seatClass.priceMultiplier
```

- `flight.basePrice` → từ `GET /api/flights/:id` (field trực tiếp trên flight object)
- `seatClass.priceMultiplier` → từ `GET /api/seat-classes`
- **Không** lấy giá từ `seats.seatsByClass[CLASS].price` (field đó chỉ là cache, có thể stale)

---

## 📄 TRANG 6 — `FlightDetail.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `flight` | **React Query** `useFlightDetail` | Gọi `GET /api/flights/:id`, cache 5 phút |
| `seatClasses` | **React Query** `useSeatClasses` | Gọi `GET /api/seat-classes`, cache 30 phút |
| `selectedClass` | `useState<SeatClass \| null>` | UI toggle hạng ghế — local |
| `id` (flightId) | `useParams` | Đọc từ URL `/detail/:id` |

> ✅ **Không cần Zustand** — data chỉ dùng trong trang này, truyền tiếp sang SeatSelection qua `navigate state`.
> ❌ Xóa `mockFlight`, `seatClassOptions` hardcode và multiplier cứng.

### Hooks sử dụng (`src/hooks/useFlights.ts`)

```ts
// Đã có sẵn — KHÔNG cần thêm:
export function useFlightDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['flight', id],
    queryFn: () => flightApi.getFlightById(Number(id)),
    enabled: Boolean(id) && Number.isFinite(Number(id)),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSeatClasses() {
  return useQuery({
    queryKey: ['seat-classes'],
    queryFn: () => flightApi.getSeatClasses().then((r) => r.data.data),
    staleTime: 30 * 60 * 1000, // priceMultiplier ít thay đổi
  });
}
```

### Code tích hợp

```tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlightDetail, useSeatClasses } from '../../../hooks/useFlights';
import type { SeatClass } from '../../../api/types';

export const FlightDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [selectedClass, setSelectedClass] = useState<SeatClass | null>(null);
  const { data: flight, isLoading, isError } = useFlightDetail(id);
  const { data: seatClasses, isLoading: isLoadingSeatClasses } = useSeatClasses();

  if (isLoading || isLoadingSeatClasses) return <Spinner />;
  if (isError || !flight) return <ErrorMessage />;

  // Mặc định ECONOMY, fallback class đầu tiên
  const activeClasses = seatClasses ?? [];
  const currentClass =
    selectedClass ??
    activeClasses.find((c) => c.className === 'ECONOMY') ??
    activeClasses[0];

  // Giá = basePrice của flight × priceMultiplier của hạng
  const totalPrice = flight.basePrice * (currentClass?.priceMultiplier ?? 1);

  const handleBook = () => {
    navigate('/booking/seat', {
      state: {
        flightId: id || flight.flightId,
        seatClass: currentClass?.className ?? 'ECONOMY',
        flightCode: flight.flightCode,
        departureAirport: flight.departureAirport,
        arrivalAirport: flight.arrivalAirport,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        basePrice: flight.basePrice,   // ← truyền basePrice GỐC, SeatSelection tự nhân multiplier
      },
    });
  };

  // JSX: map activeClasses thay vì seatClassOptions cứng
  // Giá mỗi hạng: formatPrice(flight.basePrice * cls.priceMultiplier)
};
```

### Lưu ý navigate state

| Field | Giá trị | Ghi chú |
|-------|---------|---------|
| `flightId` | `id` (string từ URL) | SeatSelection cần để gọi API ghế |
| `seatClass` | `currentClass.className` | `'ECONOMY' \| 'BUSINESS' \| 'FIRST'` |
| `basePrice` | `flight.basePrice` | Giá gốc — **không nhân multiplier** |
| Còn lại | thông tin hiển thị | flightCode, airports, times |

---

## 📄 TRANG 7 — `SeatSelection.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `bookingState` | `navigate state` | Đọc từ FlightDetail |
| `seats` | **React Query** `useFlightSeats` | Gọi `GET /api/flights/:id/seats` |
| `seatClasses` | **React Query** `useSeatClasses` | Lấy priceMultiplier để tính giá ghế |
| `selectedSeat` | `useState` | Ghế đang chọn — local |
| `passenger` | `useState` | Form hành khách — local |
| `contact` | `useState` | Form liên hệ — local |
| `createBooking` | **React Query** `useMutation` | Gọi `POST /api/bookings` |

> ⚠️ `handleProceedToPayment` hiện dùng mock `bookingCode`. Cần thay bằng `POST /api/bookings` thật.

### Thêm hooks (`src/hooks/useFlights.ts` và `src/hooks/useBookings.ts`)

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
    staleTime: 2 * 60 * 1000, // ghế thay đổi thường xuyên
  });
}

// src/hooks/useBookings.ts — TẠO MỚI:
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

### Tính giá trong SeatSelection

```ts
// Lấy priceMultiplier theo seatClass được truyền từ FlightDetail:
const { data: seatClasses = [] } = useSeatClasses();
const seatClassInfo = seatClasses.find((c) => c.className === bookingState?.seatClass);
const multiplier = seatClassInfo?.priceMultiplier ?? 1;
const ticketPrice = (bookingState?.basePrice ?? 0) * multiplier;
```

### Code tích hợp `handleProceedToPayment`

```tsx
import { useCreateBooking } from '../../../hooks/useBookings';

const createBooking = useCreateBooking();

const handleProceedToPayment = () => {
  if (!selectedSeat) {
    alert('Vui lòng chọn ghế trước khi tiếp tục.');
    return;
  }

  // Map seatNumber → seatId từ API seats
  const selectedSeatObj = seats?.find((s) => s.seatNumber === selectedSeat);
  if (!selectedSeatObj) {
    alert('Không tìm thấy thông tin ghế. Vui lòng thử lại.');
    return;
  }

  createBooking.mutate(
    {
      flightId: Number(bookingState?.flightId),
      passengers: [passenger],
      seatIds: [selectedSeatObj.seatId],
      contactName: contact.contactName,
      contactEmail: contact.contactEmail,
      contactPhone: contact.contactPhone,
    },
    {
      onSuccess: (res) => {
        const { bookingId, bookingCode, totalPrice } = res.data.data;
        navigate('/booking/payment', {
          state: {
            bookingId,          // ← số thật từ DB, dùng cho ZaloPay
            bookingCode,        // ← hiển thị cho user
            totalPrice,         // ← từ API (đã tính đúng server-side)
            flightId: bookingState?.flightId,
            flightCode: bookingState?.flightCode,
            seatClass: bookingState?.seatClass,
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

// JSX: disabled={createBooking.isPending}
// Text: createBooking.isPending ? 'Đang tạo đặt chỗ...' : 'Tiến hành thanh toán'
```

---

## 📄 TRANG 8 — `Payment.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `state` | `navigate state` | Đọc `bookingId`, `bookingCode`, `totalPrice` từ SeatSelection |
| `createZaloPayUrl` | **React Query** `useMutation` | Gọi `POST /api/payments/zalopay/create-url` |

> ⚠️ **Hiện tại**: dùng `fetch()` thủ công. Cần thay bằng `useMutation` + `axiosInstance` để tự động gắn `Authorization` header.

### Tạo hook (`src/hooks/usePayment.ts`)

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

### Code tích hợp

```tsx
import { useCreateZaloPayUrl } from '../../../hooks/usePayment';

type PaymentState = {
  bookingId?: number;       // ← QUAN TRỌNG — dùng cho ZaloPay API
  bookingCode?: string;     // hiển thị cho user
  totalPrice?: number;
  flightCode?: string;
  seatClass?: string;
  selectedSeat?: string;
  passenger?: { firstName: string; lastName: string };
  contact?: { contactEmail: string; contactPhone: string; contactName: string };
};

export const Payment = () => {
  const location = useLocation();
  const state = location.state as PaymentState | null;
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
          window.location.href = res.data.data; // redirect sang ZaloPay
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Không thể tạo link thanh toán.';
          alert(msg);
        },
      }
    );
  };

  // JSX: disabled={createZaloPayUrl.isPending}
  // Text: createZaloPayUrl.isPending ? 'Đang tạo đơn hàng...' : 'Thanh toán qua ZaloPay'
};
```

---

## 📄 TRANG 9 — `PaymentResult.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `status` | `useSearchParams` | ZaloPay redirect: `?status=1&bookingId=1` |
| `booking` | **React Query** `useQuery` | Gọi `GET /api/bookings/:id/detail` để lấy thông tin đầy đủ |

> ✅ **Trang này gần hoàn chỉnh** — chỉ cần chuyển `fetch()` thủ công → `useQuery`.

### Code tích hợp

```tsx
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axiosInstance';
import type { ApiResponse } from '../../../api/types';

const [searchParams] = useSearchParams();
const status = searchParams.get('status');
const bookingIdParam = searchParams.get('bookingId');

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
  staleTime: 0,  // luôn fresh — kết quả thanh toán cần real-time
  retry: 2,
});

// ZaloPay redirect params:
// /booking/payment-result?status=1&bookingId=1&apptransid=...
// /booking/payment-result?status=0&reason=cancelled
const isSuccess = status === '1' || status === 'success' || booking?.status === 'PAID';
const isFailed  = status === '0' || status === 'failed'  || status === 'cancelled';
```

---

## 📄 TRANG 10 — `MyBookings.tsx`

### Phân tích State

| State | Loại | Lý do |
|-------|------|-------|
| `bookings` | **React Query** `useMyBookings` | `GET /api/bookings` — server tự filter theo user login |
| `selectedBooking` | `useState` | Booking đang chọn để hủy — local |
| `showCancelModal` | `useState` | Toggle modal — local UI |
| `cancelReason` | `useState` | Nội dung textarea — local |
| `cancelBooking` | **React Query** `useMutation` | Gọi `POST /api/bookings/:id/cancel` |
| `filteredBookings` | `useMemo` | Filter client-side theo searchCode |

> ❌ Xóa `mockBookings`. Server tự biết user đang login nhờ JWT token trong axiosInstance.

### Hooks (`src/hooks/useBookings.ts`)

```ts
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

  const { data: bookings = [], isLoading, isError } = useMyBookings();
  const cancelBooking = useCancelBooking();

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
          queryClient.invalidateQueries({ queryKey: ['myBookings'] }); // fetch lại
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

  // JSX: thay mockBookings → filteredBookings
  // Modal: cancelBooking.isPending thay cho loading state cũ
};
```

### Nút "Thanh toán ngay" cho PENDING_PAYMENT

```tsx
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
    className="..."
  >
    Thanh toán ngay
  </button>
)}
```

---

## 📁 Files cần tạo / đã có

```
src/
├── api/
│   ├── flightApi.ts      ✅ Đã có — getFlightById, getSeatClasses
│   └── types.ts          ✅ Đã có — FlightResult, SeatClass, BookingCreated, Booking, SeatItem
├── hooks/
│   ├── useFlights.ts     ✅ Đã có — useFlightDetail, useSeatClasses (cần thêm useFlightSeats)
│   ├── useBookings.ts    ❌ Cần tạo — useMyBookings, useCreateBooking, useCancelBooking
│   └── usePayment.ts     ❌ Cần tạo — useCreateZaloPayUrl
```

### `src/hooks/useBookings.ts` — full file

```ts
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import type { ApiResponse, Booking, BookingCreated } from '../api/types';

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
      passengers: { firstName: string; lastName: string; dateOfBirth: string; passportNumber: string; nationality: string }[];
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

## Types cần có trong `src/api/types.ts`

```ts
// SeatClass — từ GET /api/seat-classes
export interface SeatClass {
  seatClassId: number;
  className: 'ECONOMY' | 'BUSINESS' | 'FIRST' | 'PREMIUM_ECONOMY';
  description: string;
  priceMultiplier: number;   // Nhân với flight.basePrice để ra giá vé
}

// Kết quả POST /api/bookings
export type BookingCreated = {
  bookingId: number;
  bookingCode: string;
  flightId: number;
  totalPrice: number;
  status: 'PENDING_PAYMENT';
  passengers: { passengerCode: string; firstName: string; lastName: string; seatNumber: string }[];
  bookingDate: string;
};

// Item trong GET /api/bookings
export type Booking = {
  bookingId: number;
  bookingCode: string;
  flightId: number;
  flightCode?: string;
  totalPrice: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED' | 'PENDING_APPROVAL';
  bookingDate: string;
};

// Item trong GET /api/flights/:id/seats
export type SeatItem = {
  seatId: number;
  seatNumber: string;
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  status: 'AVAILABLE' | 'BOOKED';
};
```

---

## Thứ tự tích hợp khuyến nghị

| # | File | Việc cần làm |
|---|------|-------------|
| 1 | `types.ts` | Kiểm tra / thêm `BookingCreated`, `Booking`, `SeatItem` |
| 2 | `useBookings.ts` | Tạo mới với 3 hooks |
| 3 | `usePayment.ts` | Tạo mới với 1 hook |
| 4 | `useFlights.ts` | Thêm `useFlightSeats` |
| 5 | `FlightDetail.tsx` | ✅ Đã xong — dùng `useSeatClasses` + `basePrice × priceMultiplier` |
| 6 | `SeatSelection.tsx` | Thay `handleProceedToPayment` mock → `useCreateBooking` |
| 7 | `Payment.tsx` | Thay `fetch()` → `useCreateZaloPayUrl` |
| 8 | `PaymentResult.tsx` | Thay `useState+useEffect+fetch` → `useQuery` |
| 9 | `MyBookings.tsx` | Xóa mock, thêm `useMyBookings` + `useCancelBooking` |
