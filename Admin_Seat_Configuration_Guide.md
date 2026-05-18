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
