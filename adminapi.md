# TỔNG HỢP TOÀN BỘ API DÀNH CHO ADMIN (ADMINISTRATION APIs)

Tài liệu này tổng hợp **TẤT CẢ** các API liên quan đến trang quản trị (Admin). Bao gồm việc thêm, sửa, xóa (CRUD) các danh mục dữ liệu lõi, xử lý nghiệp vụ đặt vé/hủy vé và đặc biệt là quản lý Chuyến bay, Sơ đồ ghế.

> **⚠️ QUAN TRỌNG:** Tất cả các API POST, PUT, DELETE (và một số API GET nội bộ) bên dưới đều yêu cầu quyền Admin. Phải đính kèm Token vào Header: 
> `Authorization: Bearer <admin_access_token>`

---

## 1. QUẢN LÝ SÂN BAY (AIRPORT)

- **Lấy danh sách:** `GET /api/airports`
- **Lấy chi tiết:** `GET /api/airports/{id}`
- **Thêm mới:** `POST /api/airports`
  ```json
  { "airportCode": "SGN", "airportName": "Sân bay Tân Sơn Nhất", "city": "Hồ Chí Minh", "country": "Vietnam" }
  ```
- **Cập nhật:** `PUT /api/airports/{id}` (Body tương tự POST)
- **Xóa:** `DELETE /api/airports/{id}`

---

## 2. QUẢN LÝ HÃNG BAY (AIRLINE)

- **Lấy danh sách:** `GET /api/airlines`
- **Lấy chi tiết:** `GET /api/airlines/{id}`
- **Thêm mới:** `POST /api/airlines`
  ```json
  { "code": "VN", "name": "Vietnam Airlines", "country": "Vietnam" }
  ```
- **Cập nhật:** `PUT /api/airlines/{id}` (Body tương tự POST)
- **Xóa:** `DELETE /api/airlines/{id}`

---

## 3. QUẢN LÝ TUYẾN BAY (ROUTE)

- **Lấy danh sách:** `GET /api/routes`
- **Lấy chi tiết:** `GET /api/routes/{id}`
- **Thêm mới:** `POST /api/routes`
  ```json
  { "departureAirportId": 1, "arrivalAirportId": 2, "distance": 1700, "flightDuration": "2 giờ" }
  ```
- **Cập nhật:** `PUT /api/routes/{id}` (Body tương tự POST)
- **Xóa:** `DELETE /api/routes/{id}`

---

## 4. QUẢN LÝ MÁY BAY (AIRCRAFT)

- **Lấy danh sách:** `GET /api/aircrafts`
- **Lấy chi tiết:** `GET /api/aircrafts/{id}`
- **Thêm mới:** `POST /api/aircrafts`
  ```json
  { "model": "Boeing 787", "manufacturer": "Boeing", "totalSeats": 300 }
  ```
- **Cập nhật:** `PUT /api/aircrafts/{id}` (Body tương tự POST)
- **Xóa:** `DELETE /api/aircrafts/{id}`

---

## 5. QUẢN LÝ HẠNG GHẾ (SEAT CLASS)

- **Lấy danh sách:** `GET /api/seat-classes`
- **Lấy chi tiết:** `GET /api/seat-classes/{id}`
- **Thêm mới:** `POST /api/seat-classes`
  ```json
  { "className": "BUSINESS", "description": "Hạng thương gia", "priceMultiplier": 1.5 }
  ```
- **Cập nhật:** `PUT /api/seat-classes/{id}` (Body tương tự POST)
- **Xóa:** `DELETE /api/seat-classes/{id}`

---

## 6. QUẢN LÝ SƠ ĐỒ GHẾ CỦA MÁY BAY (SEATS CONFIGURATION)

- **Lấy danh sách ghế của 1 Máy bay:** `GET /api/seats/aircraft/{aircraftId}`
- **Lấy chi tiết 1 ghế:** `GET /api/seats/{id}`
- **Xóa 1 ghế:** `DELETE /api/seats/{id}`
- **Tạo HÀNG LOẠT ghế (Bulk Create):** `POST /api/seats/bulk`
  *(Dùng khi Admin setup phân bổ số hàng ghế cho máy bay)*
  ```json
  [
    { "aircraftId": 1, "seatClassId": 2, "seatNumber": "1A" },
    { "aircraftId": 1, "seatClassId": 2, "seatNumber": "1B" },
    { "aircraftId": 1, "seatClassId": 1, "seatNumber": "2A" }
  ]
  ```

---

## 7. QUẢN LÝ CHUYẾN BAY (FLIGHT)

*Logic ngầm:* Khi tạo mới hoặc cập nhật đổi Máy bay, Backend sẽ tự động sinh ra sơ đồ ghế thực tế (`FlightSeat`) dựa trên Sơ đồ ghế gốc (`Seat`) của Máy bay được chọn.

- **Thêm mới chuyến bay:** `POST /api/flights`
  ```json
  {
    "flightNumber": "VN205",
    "airlineId": 1,
    "routeId": 2,
    "aircraftId": 1,
    "basePrice": 1200000,
    "departureTime": "2026-06-01T08:00:00",
    "arrivalTime": "2026-06-01T10:15:00",
    "status": "SCHEDULED" 
  }
  ```
- **Cập nhật chuyến bay:** `PUT /api/flights/{id}` (Body tương tự POST)
- **Xóa chuyến bay:** `DELETE /api/flights/{id}`
- *(Các API lấy list chuyến bay đã có ở phần Search Public, Admin có thể dùng lại như `GET /api/flights/airline/{id}` hoặc `GET /api/flights/route/{id}`)*

---

## 8. XỬ LÝ YÊU CẦU ĐẶT VÉ & HỦY VÉ (BOOKING MANAGEMENT)

- **Xem chi tiết Đặt chỗ:** `GET /api/bookings/{id}`
- **Phê duyệt yêu cầu Hủy vé (Hoàn tiền):** `PUT /api/bookings/{id}/cancel/approve`
  *(Chuyển trạng thái vé từ PENDING_APPROVAL sang CANCELLED và giải phóng chỗ ngồi lại thành AVAILABLE).*
