# QUẢN LÝ ĐẶT CHỖ (MY BOOKINGS) - API SPECS

## 1. Lấy Danh Sách Vé
**Request:**
- `GET /api/bookings`
- Header: `Authorization: Bearer <token>`

**Response JSON:**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "bookingId": 5,
      "bookingCode": "B19C9664E9",
      "bookingDate": "2026-05-15T01:30:03.999",
      "status": "CONFIRMED", 
      "totalPrice": 900000.00,
      "contactName": "Nguyen Van Test",
      "contactEmail": "test@gmail.com",
      "contactPhone": "0901234567",
      "flight": {
        "flightId": 7,
        "flightNumber": "VN202",
        "departureTime": "2026-05-21T08:00:00",
        "arrivalTime": "2026-05-21T10:00:00",
        "airline": { "name": "Vietnam Airlines" },
        "route": {
          "departureAirport": { "airportCode": "SGN", "city": "Ho Chi Minh" },
          "arrivalAirport": { "airportCode": "HAN", "city": "Ha Noi" }
        }
      }
    }
  ]
}
```

---

## 2. Lấy Chi Tiết Vé Bằng ID (User đã đăng nhập)
**Request:**
- `GET /api/bookings/{id}/detail` (VD: `/api/bookings/5/detail`)
- Header: `Authorization: Bearer <token>`

**Response JSON:**
```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "bookingId": 5,
    "bookingCode": "B19C9664E9",
    "status": "CONFIRMED",
    "totalPrice": 900000.00,
    "bookingDate": "2026-05-15T01:30:03.999",
    "contactName": "Nguyen Van Test",
    "contactEmail": "test@gmail.com",
    "contactPhone": "0901234567",
    "flight": {
      "flightNumber": "VN202",
      "departureTime": "2026-05-21T08:00:00",
      "arrivalTime": "2026-05-21T10:00:00"
    },
    "passengers": [
      {
        "bookingPassengerId": 1,
        "passenger": {
          "fullName": "Nguyen Van A",
          "gender": "MALE",
          "dateOfBirth": "1990-01-01",
          "passportNumber": "C1234567"
        },
        "flightSeat": {
          "flightSeatId": 125,
          "seat": {
            "seatNumber": "21F",
            "seatClass": {
              "className": "ECONOMY",
              "priceMultiplier": 1.00
            }
          }
        }
      }
    ]
  }
}
```

---

## 3. Tra Cứu Vé Bằng PNR Code (Khách vãng lai)
**Request:**
- `GET /api/bookings/code/{code}` (VD: `/api/bookings/code/B19C9664E9`)
- Không cần Header.

**Response JSON:**
- Trả về JSON y hệt như API số 2.

---

## 4. Hủy Vé
**Request:**
- `POST /api/bookings/{id}/cancel` (VD: `/api/bookings/5/cancel`)
- Header: `Authorization: Bearer <token>`
- Body:
```json
{
  "reason": "Lý do hủy",
  "requestedRefundAmount": 900000.00
}
```

**Response JSON:**
```json
{
  "success": true,
  "message": "Cancel request submitted successfully.",
  "data": {
    "cancelId": 12,
    "status": "PENDING_APPROVAL",
    "refundAmount": 450000.00,
    "penaltyAmount": 450000.00
  }
}
```
