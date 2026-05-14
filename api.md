# API Documentation - Airline Booking System

## Tổng Quan Hệ Thống
- **Framework**: Spring Boot 3.5.14
- **Language**: Java 21
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Token)
- **Security**: Rate Limiting, Email Verification, Password Reset

---

## Phân Loại Người Dùng (User Roles)

Hệ thống có **3 loại người dùng chính**:

1. **Passenger (Hành khách)** - Vai trò mặc định khi đăng ký
   - Có thể tìm kiếm và đặt chuyến bay
   - Quản lý đặt chỗ của mình
   - Thanh toán vé
   
2. **Admin (Quản trị viên)**
   - Quản lý toàn bộ hệ thống
   - Quản lý hãng bay, sân bay, tuyến bay
   - Quản lý máy bay, ghế ngồi, giá động
   - Quản lý dịch vụ, chính sách, hành lý
   
3. **Staff (Nhân viên)**
   - Duyệt yêu cầu hủy đặt chỗ
   - Hỗ trợ quản lý hệ thống

---

## API ENDPOINTS

### 1. AUTHENTICATION APIs (`/api/auth`)

#### 1.1 Đăng Ký Tài Khoản
```
POST /api/auth/register
```

**Quyền truy cập**: Public (Tất cả người dùng)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0123456789"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0123456789",
    "role": "passenger",
    "status": "active"
  }
}
```

---

#### 1.2 Đăng Nhập
```
POST /api/auth/login
```

**Quyền truy cập**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Rate Limiting**: 5 lần đăng nhập / 15 phút

---

#### 1.3 Xác Thực Email
```
GET /api/auth/verify-email?token={token}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in.",
  "data": null
}
```

---

#### 1.4 Yêu Cầu Đặt Lại Mật Khẩu
```
POST /api/auth/request-password-reset?email={email}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset OTP sent to email. Please check your inbox.",
  "data": null
}
```

---

#### 1.5 Đặt Lại Mật Khẩu
```
POST /api/auth/reset-password?email={email}&otp={otp}&newPassword={newPassword}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successful. You can now log in with your new password.",
  "data": null
}
```

---

### 2. USER APIs (`/api/users`)

#### 2.1 Lấy Thông Tin Hồ Sơ Cá Nhân
```
GET /api/users/me
```

**Quyền truy cập**: Authenticated (Passenger, Admin, Staff)

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0123456789"
  }
}
```

---

### 3. FLIGHT SEARCH & BOOKING APIs

#### 3.1 Tìm Kiếm Chuyến Bay
```
GET /api/flights?departure=SGN&arrival=HAN&departureDate=2024-03-20&passengerCount=2&seatClass=ECONOMY
```

**Quyền truy cập**: Public

**Query Parameters**:
- `departure` *(bắt buộc)*: Mã sân bay khởi hành (VD: `SGN`)
- `arrival` *(bắt buộc)*: Mã sân bay đến (VD: `HAN`)
- `departureDate` *(bắt buộc)*: Ngày khở hành (YYYY-MM-DD)
- `passengerCount` *(bắt buộc)*: Số hành khách (≥ 1)
- `seatClass` *(tuỳ chọn)*: Hạng ghế (`ECONOMY`, `BUSINESS`, `FIRST`, `PREMIUM_ECONOMY`)
- `roundTrip` *(tuỳ chọn)*: `true` nếu khứ hồi
- `returnDate` *(tuỳ chọn)*: Ngày về nếu khứ hồi (YYYY-MM-DD)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Flights found successfully",
  "data": {
    "flights": [
      {
        "flightId": 1,
        "flightNumber": "VN201",
        "departureTime": "2026-05-20T06:00:00",
        "arrivalTime": "2026-05-20T08:00:00",
        "duration": "2h 00m",
        "aircraftModel": "A350-900",
        "status": "ACTIVE",
        "airline": {
          "airlineId": 1,
          "name": "Vietnam Airlines",
          "code": "VN",
          "country": "Vietnam"
        },
        "departureAirport": {
          "airportId": 1,
          "airportCode": "HAN",
          "airportName": "Noi Bai International Airport",
          "city": "Ha Noi",
          "country": "Vietnam"
        },
        "arrivalAirport": {
          "airportId": 2,
          "airportCode": "SGN",
          "airportName": "Tan Son Nhat International Airport",
          "city": "Ho Chi Minh",
          "country": "Vietnam"
        },
        "seats": {
          "totalSeats": 18,
          "availableSeats": 14,
          "bookedSeats": 4,
          "seatsByClass": {
            "ECONOMY": { "availableSeats": 10, "price": 900000 },
            "BUSINESS": { "availableSeats": 4, "price": 1350000 }
          }
        }
      }
    ],
    "totalResults": 1
  }
}
```

> 💡 `price` = `flight.basePrice × seatClass.priceMultiplier` (không có dynamic pricing)

---

#### 3.2 Lấy Chi Tiết Chuyến Bay
```
GET /api/flights/{id}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Flight details retrieved successfully",
  "data": {
    "flightId": 1,
    "flightNumber": "VN201",
    "departureTime": "2024-03-20T08:00:00",
    "arrivalTime": "2024-03-20T10:00:00",
    "duration": "2h 00m",
    "aircraftModel": "A350-900",
    "status": "SCHEDULED",
    "airline": {
      "airlineId": 1,
      "name": "Vietnam Airlines",
      "code": "VN",
      "country": "Vietnam"
    },
    "departureAirport": {
      "airportId": 2,
      "airportCode": "SGN",
      "airportName": "Tan Son Nhat International Airport",
      "city": "Ho Chi Minh",
      "country": "Vietnam"
    },
    "arrivalAirport": {
      "airportId": 1,
      "airportCode": "HAN",
      "airportName": "Noi Bai International Airport",
      "city": "Ha Noi",
      "country": "Vietnam"
    },
    "seats": {
      "totalSeats": 50,
      "availableSeats": 45,
      "bookedSeats": 5,
      "seatsByClass": {
        "ECONOMY": { "availableSeats": 40, "price": 900000 },
        "BUSINESS": { "availableSeats": 5, "price": 1350000 }
      }
    }
  }
}
```

---

#### 3.3 Lấy Sơ Đồ Ghế Ngồi
```
GET /api/flights/{id}/seats
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seat map retrieved successfully",
  "data": {
    "flightId": 1,
    "aircraft": "A350-900",
    "rows": [
      {
        "row": 1,
        "seats": [
          {
            "flightSeatId": 1,
            "seatNumber": "1A",
            "seatClass": "BUSINESS",
            "status": "AVAILABLE",
            "price": 1350000
          },
          {
            "flightSeatId": 2,
            "seatNumber": "1B",
            "seatClass": "BUSINESS",
            "status": "BOOKED",
            "price": 1350000
          }
        ]
      },
      {
        "row": 20,
        "seats": [
          {
            "flightSeatId": 10,
            "seatNumber": "20A",
            "seatClass": "ECONOMY",
            "status": "AVAILABLE",
            "price": 900000
          }
        ]
      }
    ]
  }
}
```

> 💡 `price` = `flight.basePrice × seatClass.priceMultiplier`

---

#### 3.4 Lấy Chuyến Bay Theo Hãng Bay
```
GET /api/flights/airline/{airlineId}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Flights retrieved successfully",
  "data": [
    {
      "flightId": 1,
      "flightNumber": "VN201",
      "departureTime": "2024-03-20T08:00:00",
      "arrivalTime": "2024-03-20T10:00:00",
      "duration": "2h 00m",
      "aircraftModel": "A350-900",
      "status": "SCHEDULED",
      "airline": { "airlineId": 1, "name": "Vietnam Airlines", "code": "VN", "country": "Vietnam" },
      "departureAirport": { "airportCode": "SGN", "airportName": "Tan Son Nhat", "city": "Ho Chi Minh" },
      "arrivalAirport": { "airportCode": "HAN", "airportName": "Noi Bai", "city": "Ha Noi" },
      "seats": {
        "totalSeats": 50, "availableSeats": 45, "bookedSeats": 5,
        "seatsByClass": { "ECONOMY": { "availableSeats": 40, "price": 900000 } }
      }
    }
  ]
}
```

---

#### 3.5 Lấy Chuyến Bay Theo Tuyến Bay
```
GET /api/flights/route/{routeId}?date=2024-03-20
```

**Quyền truy cập**: Public

**Response** (200 OK): Cấu trúc giống **3.4** (danh sách `FlightDTO`).

---

### 4. BOOKING APIs (`/api/bookings`)

#### 4.1 Tạo Đặt Chỗ
```
POST /api/bookings
```

**Quyền truy cập**: Passenger, Admin

**Request Body**:
```json
{
  "flightId": 1,
  "passengers": [
    {
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "dateOfBirth": "1990-01-15",
      "gender": "MALE",
      "nationality": "VN"
    }
  ],
  "seatIds": [1, 2],
  "contactName": "Nguyễn Văn A",
  "contactEmail": "user@example.com",
  "contactPhone": "0123456789"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Booking created successfully. Please payment for keep flight seat.",
  "data": {
    "bookingId": 1,
    "bookingCode": "BK123456",
    "flightId": 1,
    "totalPrice": 5000000,
    "status": "PENDING_PAYMENT",
    "passengers": [
      {
        "passengerCode": "PS001",
        "firstName": "Nguyễn",
        "lastName": "Văn A",
        "seatNumber": "1A"
      }
    ],
    "bookingDate": "2024-03-15T10:30:00"
  }
}
```

---

#### 4.2 Lấy Danh Sách Đặt Chỗ Của Người Dùng
```
GET /api/bookings
```

**Quyền truy cập**: Passenger (chỉ xem đặt chỗ của chính mình)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "bookingId": 1,
      "bookingCode": "BK123456",
      "flightId": 1,
      "totalPrice": 5000000,
      "status": "PAID",
      "bookingDate": "2024-03-15T10:30:00"
    }
  ]
}
```

---

#### 4.3 Lấy Chi Tiết Đặt Chỗ
```
GET /api/bookings/{id}
```

**Quyền truy cập**: Passenger (chỉ xem đặt chỗ của chính mình), Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "bookingId": 1,
    "bookingCode": "BK123456",
    "flightId": 1,
    "passengers": [
      {
        "passengerCode": "PS001",
        "firstName": "Nguyễn",
        "lastName": "Văn A",
        "seatNumber": "1A",
        "status": "CHECKED_IN"
      }
    ],
    "totalPrice": 5000000,
    "status": "PAID",
    "bookingDate": "2024-03-15T10:30:00"
  }
}
```

---

#### 4.4 Lấy Chi Tiết Đặt Chỗ (Detailed)
```
GET /api/bookings/{id}/detail
```

**Quyền truy cập**: Public (có thể xem bằng mã đặt chỗ)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "bookingId": 1,
    "bookingCode": "BK123456",
    "flight": {
      "flightCode": "VN001",
      "departureTime": "2024-03-20T08:00:00",
      "arrivalTime": "2024-03-20T10:00:00"
    },
    "passengers": [
      {
        "passengerCode": "PS001",
        "fullName": "Nguyễn Văn A",
        "seatNumber": "1A"
      }
    ],
    "totalPrice": 5000000,
    "status": "PAID"
  }
}
```

---

#### 4.5 Lấy Đặt Chỗ Theo Mã Booking
```
GET /api/bookings/code/{code}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "passengerCode": "PS001",
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "seatNumber": "1A",
    "flightCode": "VN001"
  }
}
```

---

#### 4.6 Yêu Cầu Hủy Đặt Chỗ
```
POST /api/bookings/{id}/cancel
```

**Quyền truy cập**: Passenger (hủy đặt chỗ của chính mình), Admin

**Request Body**:
```json
{
  "reason": "Lý do hủy vé",
  "requestedRefundAmount": 5000000
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Cancel booking request submitted successfully",
  "data": {
    "cancelId": 1,
    "bookingId": 1,
    "status": "PENDING_APPROVAL",
    "reason": "Lý do hủy vé",
    "requestedRefundAmount": 5000000,
    "createdAt": "2024-03-15T11:00:00"
  }
}
```

---

#### 4.7 Phê Duyệt Hủy Đặt Chỗ
```
PUT /api/bookings/{id}/cancel/approve
```

**Quyền truy cập**: Admin, Staff

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Duyệt yêu cầu hủy vé và giải phóng chỗ ngồi thành công.",
  "data": null
}
```

---

### 5. PAYMENT APIs (`/api/payments`)

#### 5.1 Tạo Link Thanh Toán ZaloPay
```
POST /api/payments/zalopay/create-url?bookingId={bookingId}&amount={amount}
```

**Quyền truy cập**: Passenger, Admin

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Create order successfully. Please payment in 1h if not, the order will be cancelled.",
  "data": "https://sandbox.zalopay.com.vn/web/redirect?code=123456..."
}
```

---

#### 5.2 ZaloPay Callback (Webhook)
```
POST /api/payments/zalopay/callback
```

**Quyền truy cập**: ZaloPay Internal Only

**Request Body** (từ ZaloPay):
```json
{
  "data": "eyJhcHBfaWQiOjIxMjEsImFwcF90cmFuc19pZCI6IjI2MDMyOV8xMjMiLCJhcHBfdXNlciI6IiIsImFtb3VudCI6NTAwMDAwMDAsImFtb3VudF9kaXNjb3VudCI6MCwiYmFua19jb2RlIjoiUFBFIiwiYmFua190cmFuc19pZCI6IjI2MDMyOV8xMjN...",
  "mac": "d3d7cf3e5b9c5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"
}
```

**Response** (200 OK):
```json
{
  "return_code": 1,
  "return_message": "success"
}
```

---

### 6. AIRLINE APIs (`/api/airlines`)

#### 6.1 Lấy Danh Sách Hãng Bay
```
GET /api/airlines
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy danh sách hãng bay thành công",
  "data": [
    {
      "airlineId": 1,
      "airlineCode": "VN",
      "airlineName": "Vietnam Airlines",
      "country": "Vietnam",
      "foundedYear": 1990
    }
  ]
}
```

---

#### 6.2 Lấy Chi Tiết Hãng Bay
```
GET /api/airlines/{id}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy thông tin hãng bay thành công",
  "data": {
    "airlineId": 1,
    "airlineCode": "VN",
    "airlineName": "Vietnam Airlines",
    "country": "Vietnam"
  }
}
```

---

#### 6.3 Tạo Hãng Bay
```
POST /api/airlines
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "airlineCode": "VN",
  "airlineName": "Vietnam Airlines",
  "country": "Vietnam",
  "foundedYear": 1990
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Tạo hãng bay thành công",
  "data": {
    "airlineId": 1,
    "airlineCode": "VN",
    "airlineName": "Vietnam Airlines"
  }
}
```

---

#### 6.4 Cập Nhật Hãng Bay
```
PUT /api/airlines/{id}
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "airlineCode": "VN",
  "airlineName": "Vietnam Airlines",
  "country": "Vietnam"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Cập nhật hãng bay thành công",
  "data": {
    "airlineId": 1,
    "airlineCode": "VN",
    "airlineName": "Vietnam Airlines"
  }
}
```

---

#### 6.5 Xóa Hãng Bay
```
DELETE /api/airlines/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Xóa hãng bay thành công",
  "data": null
}
```

---

### 7. AIRPORT APIs (`/api/airports`)

#### 7.1 Lấy Danh Sách Sân Bay
```
GET /api/airports
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy danh sách sân bay thành công",
  "data": [
    {
      "airportId": 1,
      "airportCode": "SGN",
      "airportName": "Sân bay Tân Sơn Nhất",
      "city": "Hồ Chí Minh",
      "country": "Vietnam"
    }
  ]
}
```

---

#### 7.2 Lấy Chi Tiết Sân Bay
```
GET /api/airports/{id}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy thông tin sân bay thành công",
  "data": {
    "airportId": 1,
    "airportCode": "SGN",
    "airportName": "Sân bay Tân Sơn Nhất",
    "city": "Hồ Chí Minh"
  }
}
```

---

#### 7.3 Lấy Sân Bay Theo Mã
```
GET /api/airports/code/{code}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy thông tin sân bay thành công",
  "data": {
    "airportId": 1,
    "airportCode": "SGN",
    "airportName": "Sân bay Tân Sơn Nhất"
  }
}
```

---

#### 7.4 Tạo Sân Bay
```
POST /api/airports
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "airportCode": "SGN",
  "airportName": "Sân bay Tân Sơn Nhất",
  "city": "Hồ Chí Minh",
  "country": "Vietnam"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Tạo sân bay thành công",
  "data": {
    "airportId": 1,
    "airportCode": "SGN",
    "airportName": "Sân bay Tân Sơn Nhất"
  }
}
```

---

#### 7.5 Cập Nhật Sân Bay
```
PUT /api/airports/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Cập nhật sân bay thành công",
  "data": { ... }
}
```

---

#### 7.6 Xóa Sân Bay
```
DELETE /api/airports/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Xóa sân bay thành công",
  "data": null
}
```

---

#### 7.7 Lấy Danh Sách Sân Bay (General)
```
GET /api/airports/general
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy danh sách sân bay thành công",
  "data": [
    {
      "airportCode": "SGN",
      "airportName": "Sân bay Tân Sơn Nhất"
    }
  ]
}
```

---

### 8. AIRCRAFT APIs (`/api/aircrafts`)

#### 8.1 Lấy Danh Sách Máy Bay
```
GET /api/aircrafts
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Aircraft list retrieved successfully",
  "data": [
    {
      "aircraftId": 1,
      "model": "Boeing 787",
      "manufacturer": "Boeing",
      "totalSeats": 300
    }
  ]
}
```

---

#### 8.2 Lấy Chi Tiết Máy Bay
```
GET /api/aircrafts/{id}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Aircraft retrieved successfully",
  "data": {
    "aircraftId": 1,
    "model": "Boeing 787",
    "manufacturer": "Boeing",
    "totalSeats": 300
  }
}
```

---

#### 8.3 Tạo Máy Bay
```
POST /api/aircrafts
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "model": "Boeing 787",
  "manufacturer": "Boeing",
  "totalSeats": 300
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Aircraft created successfully",
  "data": {
    "aircraftId": 1,
    "model": "Boeing 787",
    "manufacturer": "Boeing",
    "totalSeats": 300
  }
}
```

---

#### 8.4 Cập Nhật Máy Bay
```
PUT /api/aircrafts/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Aircraft updated successfully",
  "data": { ... }
}
```

---

#### 8.5 Xóa Máy Bay
```
DELETE /api/aircrafts/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Aircraft deleted successfully",
  "data": null
}
```

---

#### 8.6 Lấy Máy Bay Theo Hãng Sản Xuất
```
GET /api/aircrafts/manufacturer/{manufacturer}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Aircraft list retrieved successfully",
  "data": [
    {
      "aircraftId": 1,
      "model": "Boeing 787",
      "manufacturer": "Boeing"
    }
  ]
}
```

---

### 9. ROUTE APIs (`/api/routes`)

#### 9.1 Lấy Danh Sách Tuyến Bay
```
GET /api/routes
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy danh sách tuyến bay thành công",
  "data": [
    {
      "routeId": 1,
      "departureAirport": "SGN",
      "arrivalAirport": "HAN",
      "distance": 1700,
      "flightDuration": "2 giờ"
    }
  ]
}
```

---

#### 9.2 Lấy Chi Tiết Tuyến Bay
```
GET /api/routes/{id}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy thông tin tuyến bay thành công",
  "data": {
    "routeId": 1,
    "departureAirport": "SGN",
    "arrivalAirport": "HAN",
    "distance": 1700
  }
}
```

---

#### 9.3 Tạo Tuyến Bay
```
POST /api/routes
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "departureAirportId": 1,
  "arrivalAirportId": 2,
  "distance": 1700,
  "flightDuration": "2 giờ"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Tạo tuyến bay thành công",
  "data": {
    "routeId": 1,
    "departureAirport": "SGN",
    "arrivalAirport": "HAN"
  }
}
```

---

#### 9.4 Cập Nhật Tuyến Bay
```
PUT /api/routes/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Cập nhật tuyến bay thành công",
  "data": { ... }
}
```

---

#### 9.5 Xóa Tuyến Bay
```
DELETE /api/routes/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Xóa tuyến bay thành công",
  "data": null
}
```

---

### 10. SEAT & SEAT CLASS APIs

#### 10.1 Lấy Danh Sách Hạng Ghế
```
GET /api/seat-classes
```

**Quyền truy cập**: Public

> 💡 **Công thức tính giá ghế**: `giá ghế = flight.basePrice × seatClass.priceMultiplier`
> - `basePrice` nằm ở chức năng **Flight** (mỗi chuyến bay có giá cơ bản riêng)
> - `priceMultiplier` là **hệ số nhân** của hạng ghế (ECONOMY=1.0, BUSINESS=1.5, FIRST=2.5)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seat classes retrieved successfully",
  "data": [
    {
      "seatClassId": 1,
      "className": "ECONOMY",
      "description": "Hạng phổ thông",
      "priceMultiplier": 1.0
    },
    {
      "seatClassId": 2,
      "className": "BUSINESS",
      "description": "Hạng thương gia",
      "priceMultiplier": 1.5
    },
    {
      "seatClassId": 3,
      "className": "FIRST",
      "description": "Hạng thương gia hạng nhất",
      "priceMultiplier": 2.5
    }
  ]
}
```

---

#### 10.2 Lấy Chi Tiết Hạng Ghế
```
GET /api/seat-classes/{id}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seat class retrieved successfully",
  "data": {
    "seatClassId": 1,
    "className": "ECONOMY",
    "description": "Hạng phổ thông",
    "priceMultiplier": 1.0
  }
}
```

---

#### 10.3 Lấy Hạng Ghế Theo Tên
```
GET /api/seat-classes/name/{name}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seat class retrieved successfully",
  "data": {
    "seatClassId": 1,
    "className": "ECONOMY",
    "description": "Hạng phổ thông",
    "priceMultiplier": 1.0
  }
}
```

---

#### 10.4 Tạo Hạng Ghế
```
POST /api/seat-classes
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "className": "ECONOMY",
  "description": "Hạng phổ thông",
  "priceMultiplier": 1.0
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Seat class created successfully",
  "data": {
    "seatClassId": 1,
    "className": "ECONOMY",
    "description": "Hạng phổ thông",
    "priceMultiplier": 1.0
  }
}
```

---

#### 10.5 Cập Nhật Hạng Ghế
```
PUT /api/seat-classes/{id}
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "className": "BUSINESS",
  "description": "Hạng thương gia",
  "priceMultiplier": 1.5
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seat class updated successfully",
  "data": {
    "seatClassId": 1,
    "className": "BUSINESS",
    "description": "Hạng thương gia",
    "priceMultiplier": 1.5
  }
}
```

---

#### 10.6 Xóa Hạng Ghế
```
DELETE /api/seat-classes/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seat class deleted successfully",
  "data": null
}
```

---

#### 10.7 Lấy Danh Sách Ghế
```
GET /api/seats
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seats retrieved successfully",
  "data": [
    {
      "seatId": 1,
      "aircraftId": 1,
      "aircraftModel": "Boeing 787",
      "seatClassId": 1,
      "seatClassName": "ECONOMY",
      "seatNumber": "1A"
    }
  ]
}
```

---

#### 10.8 Lấy Chi Tiết Ghế
```
GET /api/seats/{id}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seat retrieved successfully",
  "data": {
    "seatId": 1,
    "aircraftModel": "Boeing 787",
    "seatClassName": "ECONOMY",
    "seatNumber": "1A"
  }
}
```

---

#### 10.9 Tạo Ghế
```
POST /api/seats
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "aircraftId": 1,
  "seatClassId": 1,
  "seatNumber": "1A"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Seat created successfully",
  "data": {
    "seatId": 1,
    "aircraftId": 1,
    "aircraftModel": "Boeing 787",
    "seatClassId": 1,
    "seatClassName": "ECONOMY",
    "seatNumber": "1A"
  }
}
```

---

#### 10.10 Cập Nhật Ghế
```
PUT /api/seats/{id}
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "aircraftId": 1,
  "seatClassId": 2,
  "seatNumber": "2A"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seat updated successfully",
  "data": {
    "seatId": 1,
    "aircraftId": 1,
    "aircraftModel": "Boeing 787",
    "seatClassId": 2,
    "seatClassName": "BUSINESS",
    "seatNumber": "2A"
  }
}
```

---

#### 10.11 Xóa Ghế
```
DELETE /api/seats/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seat deleted successfully",
  "data": null
}
```

---

#### 10.12 Lấy Ghế Theo Máy Bay
```
GET /api/seats/aircraft/{aircraftId}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seats retrieved successfully",
  "data": [
    {
      "seatId": 1,
      "aircraftId": 1,
      "aircraftModel": "Boeing 787",
      "seatClassId": 1,
      "seatClassName": "ECONOMY",
      "seatNumber": "1A"
    }
  ]
}
```

---

#### 10.13 Lấy Ghế Theo Hạng Ghế
```
GET /api/seats/class/{seatClassId}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Seats retrieved successfully",
  "data": [
    {
      "seatId": 1,
      "aircraftId": 1,
      "aircraftModel": "Boeing 787",
      "seatClassId": 1,
      "seatClassName": "ECONOMY",
      "seatNumber": "1A"
    }
  ]
}
```

---

### 11. FLIGHT SEAT APIs (`/api/flight-seats`)

#### 11.1 Lấy Danh Sách Flight Seats
```
GET /api/flight-seats
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Flight seats retrieved successfully",
  "data": [
    {
      "flightSeatId": 1,
      "flightId": 1,
      "seatId": 1,
      "seatNumber": "1A",
      "status": "AVAILABLE",
      "price": 2500000
    }
  ]
}
```

---

#### 11.2 Lấy Chi Tiết Flight Seat
```
GET /api/flight-seats/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Flight seat retrieved successfully",
  "data": {
    "flightSeatId": 1,
    "flightId": 1,
    "seatNumber": "1A",
    "status": "AVAILABLE",
    "price": 2500000
  }
}
```

---

#### 11.3 Tạo Flight Seat
```
POST /api/flight-seats
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "flightId": 1,
  "seatId": 1,
  "price": 2500000
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Flight seat created successfully",
  "data": {
    "flightSeatId": 1,
    "flightId": 1,
    "status": "AVAILABLE"
  }
}
```

---

#### 11.4 Cập Nhật Flight Seat
```
PUT /api/flight-seats/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Flight seat updated successfully",
  "data": { ... }
}
```

---

#### 11.5 Xóa Flight Seat
```
DELETE /api/flight-seats/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Flight seat deleted successfully",
  "data": null
}
```

---

#### 11.6 Lấy Flight Seats Theo Chuyến Bay
```
GET /api/flight-seats/flight/{flightId}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Flight seats retrieved successfully",
  "data": [
    {
      "flightSeatId": 1,
      "seatNumber": "1A",
      "status": "AVAILABLE",
      "price": 2500000
    }
  ]
}
```

---

#### 11.7 Cập Nhật Trạng Thái Flight Seat
```
PATCH /api/flight-seats/{id}/status?status=BOOKED
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Flight seat status updated successfully",
  "data": null
}
```

**Status Values**: `AVAILABLE`, `BOOKED`, `BLOCKED`, `MAINTENANCE`

---

#### 11.8 Lấy Ghế Trống
```
GET /api/flight-seats/flight/{flightId}/available
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Available seats retrieved successfully",
  "data": [
    {
      "flightSeatId": 1,
      "seatNumber": "1A",
      "status": "AVAILABLE",
      "price": 2500000
    }
  ]
}
```

---

### 12. DYNAMIC PRICE APIs (`/api/dynamic-prices`)

#### 12.1 Lấy Danh Sách Giá Động
```
GET /api/dynamic-prices
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Dynamic prices retrieved successfully",
  "data": [
    {
      "priceId": 1,
      "seatClassId": 1,
      "seatClassName": "ECONOMY",
      "adjustmentType": "PERCENTAGE",
      "adjustmentValue": 10,
      "startDate": "2024-03-20T00:00:00",
      "endDate": "2024-03-25T23:59:59"
    }
  ]
}
```

---

#### 12.2 Lấy Chi Tiết Giá Động
```
GET /api/dynamic-prices/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Dynamic price retrieved successfully",
  "data": {
    "priceId": 1,
    "seatClassId": 1,
    "adjustmentType": "PERCENTAGE",
    "adjustmentValue": 10
  }
}
```

---

#### 12.3 Tạo Giá Động
```
POST /api/dynamic-prices
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "seatClassId": 1,
  "adjustmentType": "PERCENTAGE",
  "adjustmentValue": 10,
  "startDate": "2024-03-20T00:00:00",
  "endDate": "2024-03-25T23:59:59"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Dynamic price created successfully",
  "data": {
    "priceId": 1,
    "seatClassId": 1,
    "adjustmentValue": 10
  }
}
```

**Adjustment Types**: `PERCENTAGE`, `FIXED_AMOUNT`

---

#### 12.4 Cập Nhật Giá Động
```
PUT /api/dynamic-prices/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Dynamic price updated successfully",
  "data": { ... }
}
```

---

#### 12.5 Xóa Giá Động
```
DELETE /api/dynamic-prices/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Dynamic price deleted successfully",
  "data": null
}
```

---

#### 12.6 Lấy Giá Động Theo Hạng Ghế
```
GET /api/dynamic-prices/seat-class/{seatClassId}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Dynamic prices retrieved successfully",
  "data": [
    {
      "priceId": 1,
      "adjustmentValue": 10
    }
  ]
}
```

---

#### 12.7 Lấy Giá Động Hoạt Động
```
GET /api/dynamic-prices/active?startDate=2024-03-20T00:00:00&endDate=2024-03-25T23:59:59
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Active dynamic prices retrieved successfully",
  "data": [
    {
      "priceId": 1,
      "seatClassId": 1,
      "adjustmentValue": 10
    }
  ]
}
```

---

### 13. SERVICE APIs (`/api/services`)

#### 13.1 Lấy Danh Sách Dịch Vụ
```
GET /api/services
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy dịch vụ hành khách thành công",
  "data": [
    {
      "serviceId": 1,
      "serviceName": "Meal",
      "type": "FOOD",
      "description": "Bữa ăn trên chuyến bay",
      "price": 200000
    }
  ]
}
```

---

#### 13.2 Lấy Chi Tiết Dịch Vụ
```
GET /api/services/{id}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy dịch vụ hành khách thành công",
  "data": {
    "serviceId": 1,
    "serviceName": "Meal",
    "type": "FOOD",
    "price": 200000
  }
}
```

---

#### 13.3 Tạo Dịch Vụ
```
POST /api/services
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "serviceName": "Meal",
  "type": "FOOD",
  "description": "Bữa ăn trên chuyến bay",
  "price": 200000
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Tạo mới dịch vụ hành khách thành công",
  "data": {
    "serviceId": 1,
    "serviceName": "Meal",
    "price": 200000
  }
}
```

---

#### 13.4 Cập Nhật Dịch Vụ
```
PUT /api/services/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Cập nhật mới dịch vụ hành khách thành công",
  "data": { ... }
}
```

---

#### 13.5 Xóa Dịch Vụ
```
DELETE /api/services/{id}
```

**Quyền truy cập**: Admin

**Response** (204 No Content)
```json
{
  "success": true,
  "message": "Xóa dịch vụ hành khách thành công",
  "data": null
}
```

---

### 14. BAGGAGE APIs (`/api/baggages`)

#### 14.1 Lấy Danh Sách Hành Lý
```
GET /api/baggages
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "baggageId": 1,
      "baggageName": "7kg Cabin Baggage",
      "description": "Hành lý xách tay 7kg",
      "weight": 7,
      "price": 0
    }
  ]
}
```

---

#### 14.2 Lấy Chi Tiết Hành Lý
```
GET /api/baggages/{id}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "baggageId": 1,
    "baggageName": "7kg Cabin Baggage",
    "weight": 7,
    "price": 0
  }
}
```

---

#### 14.3 Tạo Hành Lý
```
POST /api/baggages
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "baggageName": "7kg Cabin Baggage",
  "description": "Hành lý xách tay 7kg",
  "weight": 7,
  "price": 0
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "baggageId": 1,
    "baggageName": "7kg Cabin Baggage"
  }
}
```

---

#### 14.4 Cập Nhật Hành Lý
```
PUT /api/baggages/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OK",
  "data": { ... }
}
```

---

#### 14.5 Xóa Hành Lý
```
DELETE /api/baggages/{id}
```

**Quyền truy cập**: Admin

**Response** (204 No Content)

---

### 15. AMENITY APIs (`/api/amenities`)

#### 15.1 Tạo Tiện Nghi
```
POST /api/amenities
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "amenityName": "WiFi",
  "description": "Dịch vụ WiFi miễn phí"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Tạo trang thiết bị thành công",
  "data": {
    "amenityId": 1,
    "amenityName": "WiFi"
  }
}
```

---

#### 15.2 Lấy Danh Sách Tiện Nghi
```
GET /api/amenities
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy danh sách thành công",
  "data": [
    {
      "amenityId": 1,
      "amenityName": "WiFi",
      "description": "Dịch vụ WiFi miễn phí"
    }
  ]
}
```

---

#### 15.3 Lấy Chi Tiết Tiện Nghi
```
GET /api/amenities/{id}
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy thông tin trang thiết bị thành công",
  "data": {
    "amenityId": 1,
    "amenityName": "WiFi"
  }
}
```

---

#### 15.4 Xóa Tiện Nghi
```
DELETE /api/amenities/{id}
```

**Quyền truy cập**: Admin

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Xóa trang thiết bị thành công",
  "data": null
}
```

---

### 16. POLICY APIs (`/api/policies`)

#### 16.1 Tạo Chính Sách
```
POST /api/policies
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "policyName": "Refund Policy",
  "description": "Chính sách hoàn tiền",
  "content": "Khách hàng có thể hoàn tiền trước 24 giờ chuyến bay"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Tạo chính sách thành công",
  "data": {
    "policyId": 1,
    "policyName": "Refund Policy"
  }
}
```

---

#### 16.2 Tạo Quy Tắc Chính Sách
```
POST /api/policies/{policyId}/rules
```

**Quyền truy cập**: Admin

**Request Body**:
```json
{
  "ruleName": "Full Refund",
  "description": "Hoàn tiền toàn bộ",
  "refundPercentage": 100,
  "daysBefore": 24
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Tạo quy tắc cho chính sách thành công",
  "data": {
    "ruleId": 1,
    "ruleName": "Full Refund"
  }
}
```

---

#### 16.3 Lấy Danh Sách Chính Sách
```
GET /api/policies
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy danh sách chính sách thành công",
  "data": [
    {
      "policyId": 1,
      "policyName": "Refund Policy",
      "description": "Chính sách hoàn tiền"
    }
  ]
}
```

---

#### 16.4 Lấy Quy Tắc Chính Sách
```
GET /api/policies/{policyId}/rules
```

**Quyền truy cập**: Public

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Lấy danh sách quy tắc thành công",
  "data": [
    {
      "ruleId": 1,
      "ruleName": "Full Refund",
      "refundPercentage": 100
    }
  ]
}
```

---

### 17. TICKET APIs (`/api/tickets`)

#### 17.1 Tải Xuống Vé PDF
```
GET /api/tickets/download/{bookingId}
```

**Quyền truy cập**: Passenger (chỉ tải vé của chính mình), Admin

**Response** (200 OK):
- Content-Type: `application/pdf`
- File name: `Airline_ETicket_{bookingId}.pdf`

---

## Tóm Tắt Quyền Truy Cập Theo Role

| Resource | Passenger | Admin | Staff | Public |
|----------|-----------|-------|-------|--------|
| Auth (Login/Register) | ✓ | ✓ | ✓ | ✓ |
| User Profile | ✓ | ✓ | ✓ | ✗ |
| Flight Search | ✓ | ✓ | ✓ | ✓ |
| Booking (Create) | ✓ | ✓ | ✗ | ✗ |
| Booking (View Own) | ✓ | ✓ | ✗ | ✗ |
| Booking (Cancel) | ✓ | ✓ | ✗ | ✗ |
| Booking (Approve Cancel) | ✗ | ✓ | ✓ | ✗ |
| Payment | ✓ | ✓ | ✗ | ✓ |
| Airline Management | ✗ | ✓ | ✗ | ✓ (View) |
| Airport Management | ✗ | ✓ | ✗ | ✓ (View) |
| Aircraft Management | ✗ | ✓ | ✗ | ✓ (View) |
| Route Management | ✗ | ✓ | ✗ | ✓ (View) |
| Seat Management | ✗ | ✓ | ✗ | ✓ (View) |
| Price Management | ✗ | ✓ | ✗ | ✗ |
| Service Management | ✗ | ✓ | ✗ | ✓ (View) |
| Baggage Management | ✗ | ✓ | ✗ | ✓ (View) |
| Amenity Management | ✗ | ✓ | ✗ | ✓ (View) |
| Policy Management | ✗ | ✓ | ✗ | ✓ (View) |
| Ticket Download | ✓ | ✓ | ✗ | ✗ |

---

## Error Responses

### Common Error Format
```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "data": null
}
```

### Common HTTP Status Codes
- `200 OK` - Yêu cầu thành công
- `201 Created` - Tạo mới thành công
- `204 No Content` - Thành công nhưng không có dữ liệu trả về
- `400 Bad Request` - Yêu cầu không hợp lệ
- `401 Unauthorized` - Chưa đăng nhập
- `403 Forbidden` - Không có quyền truy cập
- `404 Not Found` - Không tìm thấy tài nguyên
- `409 Conflict` - Xung đột (VD: Email đã tồn tại)
- `429 Too Many Requests` - Quá nhiều yêu cầu (Rate Limiting)
- `500 Internal Server Error` - Lỗi máy chủ

---

## Authentication

### JWT Token Structure

**Header**: 
```
Authorization: Bearer {accessToken}
```

**Token Payload Example**:
```json
{
  "email": "user@example.com",
  "iat": 1710499800,
  "exp": 1710503400
}
```

### Refresh Token
Sau khi token hết hạn, sử dụng `refreshToken` để lấy token mới.

---

## Rate Limiting

- **Login**: 5 lần / 15 phút
- **Other APIs**: Không áp dụng rate limiting trên các API khác

---

## Kết Luận

Hệ thống Airline Booking có **17 nhóm API chính** với tổng cộng **100+ endpoints** bao gồm:

1. **Authentication & User Management** (5 APIs)
2. **Flight Search & Details** (5 APIs)
3. **Booking Management** (7 APIs)
4. **Payment Processing** (2 APIs)
5. **Airline Management** (5 APIs)
6. **Airport Management** (7 APIs)
7. **Aircraft Management** (6 APIs)
8. **Route Management** (5 APIs)
9. **Seat & Seat Class Management** (13 APIs)
10. **Flight Seat Management** (8 APIs)
11. **Dynamic Pricing** (7 APIs)
12. **Service Management** (5 APIs)
13. **Baggage Management** (5 APIs)
14. **Amenity Management** (4 APIs)
15. **Policy Management** (4 APIs)
16. **Ticket Management** (1 API)

Tất cả API đều sử dụng JWT authentication và có 3 loại người dùng chính: Passenger, Admin, và Staff.
