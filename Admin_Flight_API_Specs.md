# TÀI LIỆU API CHO TRANG QUẢN LÝ CHUYẾN BAY (ADMIN FLIGHT)

Để xây dựng giao diện CRUD cho Chuyến bay (Flight) ở phía Admin, Frontend cần gọi các API lấy dữ liệu (để đổ vào Dropdown/Select) và các API thao tác (Thêm, Sửa, Xóa). Dưới đây là tổng hợp Request và Response của toàn bộ các API liên quan.

---

## PHẦN 1: CÁC API LẤY DỮ LIỆU ĐỂ RENDER FORM (GET OPTIONS)

Trước khi Admin có thể thêm mới một chuyến bay, Frontend cần gọi 3 API dưới đây để lấy danh sách lựa chọn cho các thẻ `<select>`.

### 1. Lấy danh sách Hãng bay (Airline)
- **Endpoint:** `GET /api/airlines`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách hãng bay thành công",
  "data": [
    {
      "airlineId": 1,
      "airlineCode": "VN",
      "airlineName": "Vietnam Airlines",
      "country": "Vietnam"
    }
  ]
}
```

### 2. Lấy danh sách Máy bay (Aircraft)
- **Endpoint:** `GET /api/aircrafts`
- **Response (200 OK):**
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

### 3. Lấy danh sách Tuyến bay (Route)
- **Endpoint:** `GET /api/routes`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách tuyến bay thành công",
  "data": [
    {
      "routeId": 1,
      "departureAirport": "SGN", // FE nên ghép "SGN -> HAN" để hiển thị cho đẹp
      "arrivalAirport": "HAN",
      "distance": 1700,
      "flightDuration": "2 giờ"
    }
  ]
}
```

---

## PHẦN 2: CÁC API THAO TÁC VỚI CHUYẾN BAY (CRUD FLIGHT)

Đây là các API tương tác trực tiếp khi Admin ấn nút "Lưu", "Cập nhật", hoặc "Xóa" trên bảng (Table) chuyến bay. Tất cả API này đều yêu cầu `Authorization: Bearer <admin_token>`.

### 1. Thêm mới Chuyến bay (Create)
- **Endpoint:** `POST /api/flights`
- **Mô tả logic ẩn:** Khi gọi API này, Backend không chỉ tạo dữ liệu Flight mà còn tự động sinh ra hàng trăm ghế (FlightSeat) ở trạng thái AVAILABLE dựa trên sơ đồ ghế của Máy bay đã chọn.
- **Request Body:**
```json
{
  "flightNumber": "VN205",
  "airlineId": 1,         // ID lấy từ danh sách Airline
  "routeId": 2,           // ID lấy từ danh sách Route
  "aircraftId": 1,        // ID lấy từ danh sách Aircraft
  "basePrice": 1200000,   // Giá vé gốc (chưa nhân hệ số hạng ghế)
  "departureTime": "2026-06-01T08:00:00", // Format chuẩn ISO 8601
  "arrivalTime": "2026-06-01T10:15:00",
  "status": "SCHEDULED"   // Khuyên dùng: SCHEDULED, DELAYED, CANCELLED, COMPLETED
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Tạo chuyến bay thành công",
  "data": {
    "flightId": 15,
    "flightNumber": "VN205",
    "departureTime": "2026-06-01T08:00:00",
    "arrivalTime": "2026-06-01T10:15:00",
    "duration": "2h 15m",
    "aircraftModel": "Boeing 787",
    "status": "SCHEDULED",
    "airline": {
      "airlineId": 1,
      "name": "Vietnam Airlines",
      "code": "VN",
      "country": "Vietnam"
    },
    "departureAirport": {
      "airportId": 1,
      "airportCode": "SGN",
      "airportName": "Sân bay Tân Sơn Nhất",
      "city": "Hồ Chí Minh",
      "country": "Vietnam"
    },
    "arrivalAirport": {
      "airportId": 2,
      "airportCode": "HAN",
      "airportName": "Sân bay Nội Bài",
      "city": "Hà Nội",
      "country": "Vietnam"
    },
    "seats": {
      "totalSeats": 300,
      "availableSeats": 300,
      "bookedSeats": 0,
      "seatsByClass": {}
    }
  }
}
```

---

### 2. Cập nhật Chuyến bay (Update)
- **Endpoint:** `PUT /api/flights/{flightId}`
- **Mô tả logic ẩn:** Nếu bạn thay đổi `aircraftId` (đổi sang dòng máy bay khác), Backend sẽ TỰ ĐỘNG hủy toàn bộ sơ đồ ghế cũ và vẽ lại sơ đồ ghế mới cho chuyến bay đó.
- **Request Body:** Gửi lại toàn bộ thông tin giống như khi tạo mới (chỉ thay đổi field cần cập nhật).
```json
{
  "flightNumber": "VN205",
  "airlineId": 1,
  "routeId": 2,
  "aircraftId": 2, // Thay đổi sang ID máy bay khác
  "basePrice": 1500000,
  "departureTime": "2026-06-01T09:00:00",
  "arrivalTime": "2026-06-01T11:15:00",
  "status": "DELAYED" // Cập nhật trạng thái
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật chuyến bay thành công",
  "data": {
    "flightId": 15,
    "flightNumber": "VN205",
    "departureTime": "2026-06-01T09:00:00",
    "status": "DELAYED",
    //... (các thông tin còn lại giống lúc tạo)
  }
}
```

---

### 3. Xóa Chuyến bay (Delete)
- **Endpoint:** `DELETE /api/flights/{flightId}`
- **Mô tả logic ẩn:** Backend sẽ tự động xóa sạch các ghế (`FlightSeat`) thuộc về chuyến bay này trước khi xóa chuyến bay, để đảm bảo không bị lỗi dữ liệu mồ côi (orphan data).
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Xóa chuyến bay thành công",
  "data": null
}
```
