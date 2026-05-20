# Hướng dẫn Xây dựng & Tích hợp Trang Quản lý Chuyến bay (Flight) cho Admin

Tài liệu này phân tích cấu trúc Database của hệ thống, các mối quan hệ (Dependencies) của thực thể `Flight` và đề xuất luồng (Flow) chuẩn nhất để xây dựng giao diện CRUD quản lý chuyến bay trên Frontend (FE), cũng như nhắc nhở những logic Backend (BE) cần thiết.

---

## 1. Phân tích Cấu trúc & Mối quan hệ (Database Dependencies)

Dựa trên các entity Java của hệ thống, một chuyến bay (`Flight`) không thể tồn tại độc lập mà bị phụ thuộc vào rất nhiều bảng dữ liệu khác. Cụ thể:

*   **`Airport` (Sân bay):** Bảng gốc, độc lập.
*   **`Route` (Tuyến bay):** Phụ thuộc vào 2 `Airport` (Điểm đi - `departureAirport` và Điểm đến - `arrivalAirport`).
*   **`Airline` (Hãng bay):** Bảng gốc, độc lập.
*   **`SeatClass` (Hạng ghế):** Bảng gốc, độc lập (chứa `priceMultiplier` - hệ số giá).
*   **`Aircraft` (Máy bay):** Bảng gốc, độc lập (chứa tổng số ghế).
*   **`Seat` (Ghế cố định trên máy bay):** Phụ thuộc vào `Aircraft` và `SeatClass`. (Ví dụ: Máy bay Boeing 777 có ghế 1A thuộc hạng Thương gia).
*   **`Flight` (Chuyến bay):** Thực thể trung tâm. Phụ thuộc vào:
    *   `Airline` (Chuyến bay của hãng nào?)
    *   `Route` (Bay từ đâu đến đâu?)
    *   `Aircraft` (Sử dụng máy bay nào?)
    *   Có `basePrice` (Giá vé cơ sở). Giá từng ghế = `basePrice * seatClass.priceMultiplier`.
*   **`FlightSeat` (Ghế bán cho chuyến bay):** Phụ thuộc vào `Flight` và `Seat`. Xác định trạng thái của ghế (AVAILABLE, BOOKED) trong 1 chuyến bay cụ thể.

### ➜ Kết luận về thứ tự tạo dữ liệu (Data Flow):
Admin **BẮT BUỘC** phải tạo dữ liệu theo thứ tự sau thì mới tạo được Chuyến bay:
1. Sân bay (`Airport`) ➔ 2. Tuyến bay (`Route`) 
3. Hãng bay (`Airline`) 
4. Máy bay (`Aircraft`) ➔ 5. Layout Ghế cho Máy bay (`Seat`)
6. **Cuối cùng mới tạo được Chuyến bay (`Flight`).**

---

## 2. Hướng dẫn xây dựng UI (Frontend) cho Quản lý Flight

### 2.1. Màn hình Danh sách (Flight List - GET)
Hiển thị DataGrid/Table liệt kê các chuyến bay.
*   **Các cột cần hiển thị:** 
    - Flight Number (Mã chuyến bay, vd: VN202)
    - Airline (Logo/Tên hãng bay)
    - Route (Vd: SGN ➔ HAN)
    - Aircraft (Tên máy bay, vd: Boeing 777)
    - Departure Time (Thời gian đi)
    - Arrival Time (Thời gian đến)
    - Base Price (Giá cơ bản)
    - Status (SCHEDULED, DELAYED, CANCELLED, COMPLETED)
*   **Tính năng:** Lọc (Filter) theo trạng thái, theo tuyến bay, hoặc khoảng thời gian.

### 2.2. Màn hình Thêm Mới / Cập nhật (Create / Edit Flight - POST/PUT)
Để tạo một form Thêm chuyến bay, FE cần gọi các API **lấy dữ liệu dropdown** trước khi render form:

1.  **Gọi API lấy Options:**
    *   `GET /api/airlines` ➔ Đổ vào Select `Airline`.
    *   `GET /api/routes` ➔ Đổ vào Select `Route`. (FE nên format text hiển thị là: `{Điểm đi} ➔ {Điểm đến}`).
    *   `GET /api/aircrafts` ➔ Đổ vào Select `Aircraft`.
2.  **Các field nhập liệu tay (Input):**
    *   `flightNumber` (String): vd "VN202"
    *   `basePrice` (Number): Giá tiền cơ bản.
    *   `departureTime` (DateTime Picker)
    *   `arrivalTime` (DateTime Picker)
    *   `status` (Select: SCHEDULED)

### 2.3. Cấu trúc Payload (JSON) khi FE gửi POST tạo Flight
*(Lưu ý: Hiện tại Backend `FlightController` chưa có API POST/PUT/DELETE, BE cần code bổ sung API này)*

```json
{
  "flightNumber": "VN202",
  "airlineId": 1,
  "routeId": 5,
  "aircraftId": 2,
  "basePrice": 1000000,
  "departureTime": "2026-05-25T08:00:00",
  "arrivalTime": "2026-05-25T10:00:00",
  "status": "SCHEDULED"
}
```

---

## 3. Logic "Ẩn" cực kỳ quan trọng dành cho Backend (Cần báo BE check)

Khi Admin bấm "Tạo chuyến bay" và FE gửi Request ở trên xuống Backend, Backend **KHÔNG CHỈ** lưu dòng dữ liệu vào bảng `Flight`, mà còn **PHẢI** tự động sinh ra dữ liệu cho bảng `FlightSeat`.

**Luồng xử lý lý tưởng cho BE (Service Layer):**
1. Nhận Request ➔ Lưu `Flight` mới vào DB.
2. Lấy `aircraftId` từ Request ➔ Tìm tất cả các ghế (`Seat`) thuộc về `Aircraft` này.
3. Chạy vòng lặp (`for`), ứng với mỗi `Seat`, Backend tự động `insert` một dòng vào bảng `FlightSeat` với cấu hình:
    *   `flight_id` = ID chuyến bay vừa tạo.
    *   `seat_id` = ID của ghế.
    *   `status` = "AVAILABLE" (Sẵn sàng bán).

> **Lưu ý Cập nhật (Edit Flight):** 
> Tránh việc cho phép Edit `AircraftId` nếu chuyến bay đã có khách đặt vé (vì nó sẽ làm sai lệch cấu trúc ghế `FlightSeat` đã có khách ngồi). Nếu chưa ai mua vé, có thể xoá toàn bộ `FlightSeat` cũ và sinh lại `FlightSeat` mới theo `Aircraft` mới. 

---
hướng xử lý ghế : 
# TÀI LIỆU HƯỚNG DẪN XỬ LÝ LOGIC CẤU HÌNH GHẾ MÁY BAY (AIRCRAFT SEAT CONFIGURATION)

Khi tạo một chiếc Máy bay (Aircraft) ở giao diện Admin, Máy bay đó có một tham số là `totalSeats` (Tổng số ghế, ví dụ: 300 ghế). Để có thể bán vé, Admin cần thiết lập sơ đồ ghế (Seat Map) cho chiếc máy bay đó (Gán từng ghế thuộc hạng Thương gia hay Phổ thông).

Vì số lượng ghế lên tới hàng trăm, việc Frontend phải gọi API POST tạo từng ghế là bất khả thi. Dưới đây là kiến trúc và logic chi tiết để xử lý bài toán này bằng cách kết hợp thuật toán FE và API Bulk Create từ BE.

---

## 1. THÔNG TIN API BACKEND (BULK CREATE)
Backend đã hỗ trợ API để nhận 1 mảng hàng trăm ghế và lưu xuống DB trong 1 lần duy nhất để tối ưu hiệu năng.

- **Endpoint:** `POST /api/seats/bulk`
- **Quyền:** Admin (`Authorization: Bearer <token>`)
- **Request Body Payload:**
```json
[
  { "aircraftId": 1, "seatClassId": 2, "seatNumber": "1A" },
  { "aircraftId": 1, "seatClassId": 2, "seatNumber": "1B" },
  { "aircraftId": 1, "seatClassId": 1, "seatNumber": "2A" }
  // ... hàng trăm object tương tự
]
```

---

## 2. Ý TƯỞNG GIAO DIỆN FRONTEND (UI/UX)
Để xây dựng tính năng này thân thiện với Admin, Frontend cần dựng UI theo luồng sau:
1. **Lấy cấu hình máy bay**: Lấy giá trị `totalSeats` (Ví dụ 175).
2. **Hiển thị thông tin hỗ trợ tính toán**:
   - Mặc định quy ước: Mỗi hàng (Row) có tối đa **6 ghế** (A, B, C, D, E, F).
   - FE tự tính và hiển thị: `Tổng số hàng = Math.ceil(totalSeats / 6)` (Ví dụ `Math.ceil(175/6) = 30 hàng`).
3. **Form nhập cấu hình (Seat Ranges)**: Cho phép Admin nhấn nút "Thêm Khoảng (Add Range)" để quy định hạng ghế:
   - Khoảng 1: Từ hàng **1** đến hàng **5** -> Hạng: **BUSINESS (Thương gia)**
   - Khoảng 2: Từ hàng **6** đến hàng **30** -> Hạng: **ECONOMY (Phổ thông)**

---

## 3. THUẬT TOÁN XỬ LÝ TRÊN FRONTEND (TYPESCRIPT LOGIC)
Khi Admin nhấn nút **"Lưu cấu hình"**, Frontend cần chạy thuật toán dưới đây để chuyển đổi các "Khoảng (Ranges)" mà Admin vừa nhập thành mảng hàng trăm ghế để gửi lên Backend.

**Quy tắc thuật toán:**
- Dùng vòng lặp chạy từ hàng `1` đến `Tổng số hàng`.
- Trong mỗi hàng, chạy vòng lặp 6 lần để sinh chữ cái `A, B, C, D, E, F`.
- **Quan trọng:** Dùng biến đếm. Nếu biến đếm bằng `totalSeats` thì dừng ngay lập tức. Việc này giúp **hàng cuối cùng có thể ít hơn 6 ghế** (nếu tổng số ghế không chia hết cho 6).

### Đoạn code TypeScript chi tiết:
Bạn có thể copy/paste đoạn code này vào file Utilities hoặc trực tiếp vào Component.

```typescript
// Định nghĩa kiểu dữ liệu cho Khoảng mà Admin chọn trên UI
export interface SeatRange {
  startRow: number;
  endRow: number;
  seatClassId: number;
}

// Định nghĩa payload từng ghế gửi lên API
export interface SeatPayload {
  aircraftId: number;
  seatClassId: number;
  seatNumber: string;
}

/**
 * Thuật toán sinh mảng Payload các ghế để gọi API Bulk Create
 * @param aircraftId ID của máy bay cần thiết lập
 * @param totalSeats Tổng số ghế quy định của máy bay (VD: 175)
 * @param ranges Các khoảng hạng ghế Admin đã cấu hình trên Form
 * @returns Mảng payload đúng chuẩn yêu cầu của BE
 */
export function generateSeatsPayload(
  aircraftId: number, 
  totalSeats: number, 
  ranges: SeatRange[]
): SeatPayload[] {
  // Mặc định luôn là tối đa 6 ghế 1 hàng
  const letters = ['A', 'B', 'C', 'D', 'E', 'F']; 
  const payloads: SeatPayload[] = [];
  
  let currentGeneratedSeats = 0;
  const totalRows = Math.ceil(totalSeats / 6); // Làm tròn lên

  // Quét từ hàng số 1 đến hàng cuối cùng
  for (let row = 1; row <= totalRows; row++) {
    
    // Tìm hạng ghế (Class) tương ứng với số hàng hiện tại dựa vào cấu hình Admin
    const activeRange = ranges.find(r => row >= r.startRow && row <= r.endRow);
    
    // Nếu Admin sót không cấu hình, lấy ID mặc định là 1 (Ví dụ: Economy)
    const classId = activeRange ? activeRange.seatClassId : 1;

    // Mỗi hàng lặp qua 6 cột A,B,C,D,E,F
    for (let col = 0; col < 6; col++) {
      // LOGIC CHẶN CHÍNH: Nếu tổng số ghế sinh ra đã ĐỦ BẰNG tổng số ghế quy định thì DỪNG 
      // Xử lý tốt trường hợp hàng cuối cùng bị lẻ (Ví dụ có 5 ghế thay vì 6)
      if (currentGeneratedSeats >= totalSeats) break;
      
      const seatNumber = `${row}${letters[col]}`; // Nối chuỗi, VD: 1A, 12F
      
      payloads.push({
        aircraftId: aircraftId,
        seatClassId: classId,
        seatNumber: seatNumber
      });
      
      currentGeneratedSeats++;
    }
  }
  
  return payloads;
}
```

---

## 4. TÍCH HỢP VÀO SỰ KIỆN GỌI API (ON SUBMIT)
Sau khi có thuật toán ở trên, bước cuối cùng là gọi API trong sự kiện bấm nút của React Component.

```tsx
import { generateSeatsPayload } from './utils'; // Import hàm bạn vừa tạo
import api from '@/api/axios'; // File config axios của bạn
import { toast } from 'react-toastify';

const handleSaveSeatConfiguration = async () => {
  try {
    // 1. Dữ liệu này bạn lấy từ State form của Formik/React Hook Form
    const totalSeats = 175; // Hoặc lấy từ aircraftData.totalSeats
    const ranges = [
      { startRow: 1, endRow: 5, seatClassId: 2 }, // 2 là Business
      { startRow: 6, endRow: 30, seatClassId: 1 } // 1 là Economy
    ];

    // 2. Chạy thuật toán sinh mảng (Sẽ sinh ra array có 175 objects)
    const payloadToAPI = generateSeatsPayload(aircraftId, totalSeats, ranges);

    // 3. Bắn API Bulk Create của Backend
    const response = await api.post('/api/seats/bulk', payloadToAPI);
    
    if(response.data.success) {
        toast.success("Cấu hình sơ đồ ghế thành công!");
    }
  } catch (err) {
    toast.error("Có lỗi xảy ra khi cấu hình ghế");
  }
};
```


## 4. Các bước tiếp theo cho Team
1. **Backend:** Bổ sung ngay các endpoint Admin vào `FlightController`: 
   - `GET /api/admin/flights` (Lấy tất cả kèm phân trang)
   - `POST /api/admin/flights` (Tạo mới & Tự động sinh `FlightSeat`)
   - `PUT /api/admin/flights/{id}` (Cập nhật)
   - `DELETE /api/admin/flights/{id}` (Hoặc cập nhật status thành CANCELLED).
