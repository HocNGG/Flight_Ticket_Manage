# Hướng Dẫn Tích Hợp API Quản Lý Đơn Đặt Vé (Booking Management) Cho Admin

Tài liệu này đặc tả toàn bộ các API cần thiết để triển khai màn hình quản lý đơn đặt vé (Booking Management Dashboard) dành cho quản trị viên (Admin/Staff), bao gồm các chức năng lọc trạng thái, tìm kiếm, xem chi tiết và phê duyệt/từ chối hủy vé.

---

## 1. MAPPING TRẠNG THÁI ĐƠN VÉ (STATUS MAPPING)

Dưới đây là bảng ánh xạ giữa giá trị trạng thái từ API và nhãn hiển thị tương ứng ở Frontend:

| Giá trị API (`status`) | Trạng thái hiển thị (Tiếng Việt) | Mô tả |
| :--- | :--- | :--- |
| `PENDING` | **Chờ thanh toán** | Đang giữ chỗ tạm thời, chờ hoàn tất thanh toán. |
| `CONFIRMED` | **Đã thanh toán** (Đã xuất vé) | Đã thanh toán thành công và có mã vé. |
| `CANCELLATION_PENDING` | **Chờ duyệt hủy** | Khách hàng đã gửi yêu cầu hủy vé, chờ Admin duyệt hoàn tiền. |
| `CANCELLED` | **Đã hủy** | Vé đã bị hủy (Tự động hủy do quá hạn hoặc Admin từ chối/hủy không hoàn tiền). |
| `REFUNDED` | **Đã hoàn tiền** | Admin đã duyệt yêu cầu hủy vé và hoàn tiền thành công. |
| `COMPLETED` | **Đã hoàn thành** | Chuyến bay đã hoàn tất. |

> [!NOTE]
> Trạng thái **Chờ duyệt hủy (`CANCELLATION_PENDING`)** được lọc động thông qua việc kiểm tra thực thể `Refund` đi kèm đơn vé có trạng thái là `PENDING`.

---

## 2. DANH SÁCH ENDPOINTS CHI TIẾT

### 2.1. Lấy danh sách & lọc đơn đặt vé (Admin)
* **Method**: `GET`
* **URL**: `/api/bookings/admin/list`
* **Query Parameters**:
  * `status` (String, tùy chọn): Lọc theo trạng thái. Các giá trị hợp lệ: `PENDING`, `CONFIRMED`, `CANCELLED`, `REFUNDED`, hoặc `CANCELLATION_PENDING` (lọc các đơn chờ duyệt hủy).
  * `keyword` (String, tùy chọn): Tìm kiếm theo Tên người liên hệ (`contactName`) hoặc Mã đặt chỗ (`bookingCode`).
* **Ví dụ Request**: `GET http://localhost:8081/api/bookings/admin/list?status=CANCELLATION_PENDING`
* **Phản hồi thành công (200 OK)**:
```json
{
  "success": true,
  "message": "Get bookings for admin successfully",
  "data": [
    {
      "bookingId": 1,
      "bookingCode": "BK1716301234SGN",
      "contactName": "Nguyen Van A",
      "contactEmail": "nguyenvana@gmail.com",
      "contactPhone": "0987654321",
      "bookingDate": "2026-05-21T12:00:00",
      "status": "CONFIRMED",
      "totalPrice": 2450000.00,
      "flight": {
        "flightId": 12,
        "flightNumber": "VN213",
        "departureTime": "2026-05-25T14:30:00",
        "arrivalTime": "2026-05-25T16:40:00"
      },
      "passengers": [
        {
          "bookingPassengerId": 1,
          "passenger": {
            "fullName": "Nguyen Van A",
            "passportNumber": "B1234567"
          },
          "flightSeat": {
            "flightSeatId": 50,
            "seat": {
              "seatNumber": "12A",
              "seatClass": {
                "className": "ECONOMY"
              }
            }
          }
        }
      ],
      "refund": {
        "refundId": 1,
        "penaltyAmount": 245000.00,
        "refundAmount": 2205000.00,
        "refundDate": "2026-05-21T13:45:00",
        "status": "PENDING",
        "reason": "Tôi có việc đột xuất không thể đi được.",
        "refundAccountNumber": "1903456789012",
        "refundBankName": "Techcombank"
      }
    }
  ]
}
```

---

### 2.2. Phê duyệt hủy vé & Hoàn tiền (Approve Cancel)
* **Mục tiêu**: Đồng ý với yêu cầu hủy vé của khách hàng. Ghế sẽ được giải phóng về trạng thái trống (`AVAILABLE`) và đơn đặt vé chuyển sang trạng thái hủy.
* **Method**: `PUT`
* **URL**: `/api/bookings/{id}/cancel/approve`
* **Headers**: `Content-Type: application/json`
* **Ví dụ Request**: `PUT http://localhost:8081/api/bookings/1/cancel/approve`
* **Phản hồi thành công (200 OK)**:
```json
{
  "success": true,
  "message": "Duyệt yêu cầu hủy vé và giải phóng chỗ ngồi thành công.",
  "data": null
}
```

---

### 2.3. Từ chối yêu cầu hủy vé (Reject Cancel)
* **Mục tiêu**: Bác bỏ yêu cầu hủy vé của khách. Xóa yêu cầu hoàn tiền đang chờ duyệt, giữ nguyên trạng thái đơn vé là `CONFIRMED`.
* **Method**: `PUT`
* **URL**: `/api/bookings/{id}/cancel/reject`
* **Headers**: `Content-Type: application/json`
* **Ví dụ Request**: `PUT http://localhost:8081/api/bookings/1/cancel/reject`
* **Phản hồi thành công (200 OK)**:
```json
{
  "success": true,
  "message": "Từ chối yêu cầu hủy vé thành công.",
  "data": null
}
```

---

### 2.4. Xem chi tiết đơn đặt vé (Get Detail)
* **Method**: `GET`
* **URL**: `/api/bookings/{id}/detail`
* **Ví dụ Request**: `GET http://localhost:8081/api/bookings/1/detail`
* **Phản hồi thành công (200 OK)**:
```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "bookingCode": "BK1716301234SGN",
    "bookingDate": "12:00 - 21/05/2026",
    "paymentDeadline": "Đã thanh toán",
    "bookingStatus": "CONFIRMED",
    "contactEmail": "nguyenvana@gmail.com",
    "contactName": "Nguyen Van A",
    "contactPhone": "0987654321",
    "totalPrice": "2.450.000 ₫",
    "flight": {
      "flightId": 12,
      "flightNumber": "VN213",
      "departureTime": "2026-05-25T14:30:00",
      "arrivalTime": "2026-05-25T16:40:00",
      "duration": "2h 10m",
      "aircraftModel": "Airbus A350",
      "status": "ACTIVE",
      "airline": {
        "airlineId": 1,
        "name": "Vietnam Airlines",
        "code": "HVN",
        "country": "Vietnam"
      },
      "departureAirport": {
        "airportId": 2,
        "airportCode": "SGN",
        "airportName": "Sân bay Tân Sơn Nhất",
        "city": "Hồ Chí Minh",
        "country": "Vietnam"
      },
      "arrivalAirport": {
        "airportId": 3,
        "airportCode": "HAN",
        "airportName": "Sân bay Nội Bài",
        "city": "Hà Nội",
        "country": "Vietnam"
      }
    },
    "passengers": [
      {
        "fullName": "Nguyen Van A",
        "seatClass": "ECONOMY",
        "seatNumber": "12A",
        "passportNumber": "B12*****567"
      }
    ]
  }
}
```
