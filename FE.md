# 📋 Hướng Dẫn Tích Hợp API "My Bookings" (Vé Của Tôi)

Tài liệu này cung cấp thông tin chi tiết về API lấy danh sách vé của người dùng hiện tại và hướng dẫn cách Frontend tích hợp bằng React Query.

---

## 1. Chi tiết API

### Endpoint
```http
GET /api/bookings
```

### Authentication
**Bắt buộc** phải có Token ở header để Backend xác định User.
```http
Authorization: Bearer <accessToken>
```

### Response (200 OK)
API sẽ trả về danh sách các booking của User. Nếu chưa có vé nào, `data` sẽ là mảng rỗng `[]`.

```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "bookingId": 42,
      "contactEmail": "user@example.com",
      "contactPhone": "0123456789",
      "contactName": "Nguyễn Văn A",
      "bookingCode": "F7A9B2C1D4",
      "bookingDate": "2026-05-14T22:00:00",
      "status": "PENDING", 
      "totalPrice": 1350000,
      "flight": {
        // Thông tin chuyến bay
        "flightId": 1,
        "flightNumber": "VN201",
        "departureTime": "2026-06-01T08:00:00",
        "arrivalTime": "2026-06-01T10:00:00"
      },
      "passengers": [
        // Danh sách hành khách trong booking này
      ]
    }
  ]
}
```

**Các trạng thái `status` có thể có:**
- `PENDING`: Đang chờ thanh toán (deadline 10 phút)
- `CONFIRMED`: Đã thanh toán thành công
- `CANCELLED`: Đã hủy (do quá hạn thanh toán hoặc hủy thủ công)

---

## 2. Hướng dẫn Frontend Tích Hợp (React & TypeScript)

Dưới đây là cấu trúc code chuẩn sử dụng **React Query** để gọi và render danh sách vé.

### Bước 1: Định nghĩa Types (`src/types/booking.ts`)

```typescript
export interface Booking {
  bookingId: number;
  contactEmail: string;
  contactPhone: string;
  contactName: string;
  bookingCode: string;
  bookingDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalPrice: number;
  flight: any; // Mở rộng theo Flight interface của bạn
  passengers: any[]; // Mở rộng theo Passenger interface của bạn
}

export interface GetBookingsResponse {
  success: boolean;
  message: string;
  data: Booking[];
}
```

### Bước 2: Tạo hàm gọi API (`src/services/bookingService.ts`)

```typescript
const API_URL = 'http://localhost:8081/api';

export const getUserBookings = async (): Promise<GetBookingsResponse> => {
  const token = localStorage.getItem('token'); 
  
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Header bắt buộc
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user bookings');
  }

  return response.json();
};
```

### Bước 3: Tạo custom hook (`src/hooks/useBookings.ts`)

```typescript
import { useQuery } from '@tanstack/react-query';
import { getUserBookings } from '../services/bookingService';

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: getUserBookings,
    // Hook chỉ kích hoạt gọi API nếu có token đăng nhập
    enabled: !!localStorage.getItem('token'), 
  });
};
```

### Bước 4: Hiển thị giao diện (`src/pages/customer/booking-management/MyBookings.tsx`)

```tsx
import React from 'react';
import { useMyBookings } from '../../../hooks/useBookings';

const MyBookings: React.FC = () => {
  const { data, isLoading, isError, error } = useMyBookings();

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Đang tải danh sách vé...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Lỗi khi tải danh sách vé: {(error as Error).message}
      </div>
    );
  }

  const bookings = data?.data || [];

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Vé Của Tôi</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Bạn chưa có chuyến bay nào được đặt.
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking.bookingId} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Mã Đặt Chỗ: <span className="text-blue-600">{booking.bookingCode}</span>
                  </h3>
                  <p className="text-sm text-gray-500">
                    Ngày đặt: {new Date(booking.bookingDate).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium
                  ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {booking.status}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">Người liên hệ</p>
                  <p className="font-medium">{booking.contactName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tổng tiền</p>
                  <p className="font-medium text-blue-600">
                    {booking.totalPrice.toLocaleString('vi-VN')} VND
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
```
