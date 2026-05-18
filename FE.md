# Hướng dẫn chi tiết code trang Payment Result (ZaloPay) trên Frontend

Dựa trên link mẫu sau khi thanh toán thành công:
`http://localhost:5173/payment-result?amount=1200000&appid=2554&apptransid=260517_26_1779034540305&bankcode=CCDB&checksum=e...&discountamount=0&pmcid=41&status=1`

Dưới đây là hướng dẫn từ A đến Z để Frontend xây dựng trang `PaymentResult.tsx`.

---

## Bước 1: Phân tích URL Parameters

Trên trang `/payment-result`, bạn sẽ nhận được các thông tin quan trọng nhất từ URL:
1. **`status`**: Bằng `1` là thành công, khác `1` (như `-49`) là thất bại/đã huỷ.
2. **`apptransid`**: Ví dụ `260517_26_1779034540305`. 
   - Backend quy định format mã này là: `[Ngày]_[Booking_ID]_[Timestamp]`.
   - ➜ **Vì vậy, bạn có thể dễ dàng tách chuỗi này để lấy ra `bookingId` (số 26 ở giữa) để gọi API.**
3. **`amount`**: Số tiền đã thanh toán (tuỳ chọn dùng để hiển thị).

---

## Bước 2: Flow xử lý logic cho React

Vì lý do bảo mật, Frontend KHÔNG bao giờ được xuất vé ngay lập tức chỉ vì thấy `status=1` trên URL (người dùng có thể tự gõ lên URL để hack). Bạn **BẮT BUỘC** phải gọi API kiểm tra lại với Backend.

Quy trình:
1. Đọc URL, lấy `status` và `apptransid`.
2. Nếu `status === '1'`:
   - Lấy `bookingId` từ `apptransid` bằng cách split("_").
   - Gọi API `GET /api/bookings/{bookingId}` để xem `paymentStatus` của booking đã là `PAID` chưa.
   - **Lưu ý nhỏ:** Đôi khi ZaloPay redirect về trình duyệt NHANH HƠN tốc độ ZaloPay gọi ngrok ngầm báo cho Backend. Lúc Frontend gọi API ngay lập tức thì Backend có thể vẫn đang hiển thị là `PENDING`. Do đó, nếu thấy `PENDING`, Frontend nên có cơ chế **Polling (chờ 2 giây gọi API lại 1 lần)** để đợi Backend cập nhật thành công.
3. Nếu `status !== '1'`:
   - Hiển thị luôn giao diện thanh toán thất bại, không cần gọi API.

---

## Bước 3: Code mẫu Component `PaymentResult.tsx`

Dưới đây là mẫu code TypeScript sử dụng React Hooks và React Router (bạn có thể copy và điều chỉnh lại thư viện call API như React Query / Axios tuỳ project):

```tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Trạng thái giao diện: loading | success | failed
  const [pageState, setPageState] = useState<'loading' | 'success' | 'failed'>('loading');
  
  // Số lần đã thử gọi lại API (polling)
  const [retryCount, setRetryCount] = useState(0);

  // 1. Lấy tham số từ URL
  const status = searchParams.get('status');
  const apptransid = searchParams.get('apptransid'); 
  const amount = searchParams.get('amount');

  // Lấy ra Booking ID từ chuỗi "260517_26_1779034540305" -> lấy "26"
  const bookingId = apptransid ? apptransid.split('_')[1] : null;

  useEffect(() => {
    if (!status || !apptransid) {
      setPageState('failed');
      return;
    }

    // Nếu người dùng huỷ hoặc thanh toán thất bại (status khác 1)
    if (status !== '1') {
      setPageState('failed');
      return;
    }

    // NẾU STATUS = 1: Bắt đầu quá trình xác thực với Backend
    checkPaymentStatus();

  }, [retryCount]); // Sẽ chạy lại nếu retryCount thay đổi

  const checkPaymentStatus = async () => {
    try {
      if (!bookingId) return;
      
      // Gọi API đến Backend để check (Thay url bằng API thật của bạn)
      // Chú ý: Cần thêm header Authorization Bearer token nếu API bị chặn bảo mật
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();

      // Kiểm tra trạng thái booking trả về
      // Giả sử Backend trả về data có chứa field status hoặc paymentStatus
      if (data.status === 'CONFIRMED' || data.paymentStatus === 'PAID') {
        setPageState('success'); // Xong! Backend đã nhận được tiền.
      } else {
        // Backend vẫn chưa cập nhật kịp, đợi 2 giây rồi thử lại (tối đa 5 lần)
        if (retryCount < 5) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        } else {
          // Chờ quá lâu mà chưa thành công
          setPageState('failed'); 
        }
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái vé", error);
      setPageState('failed');
    }
  };

  // ================= RENDER GIAO DIỆN =================
  if (pageState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="loader inline-block w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold">Đang xác nhận kết quả thanh toán...</h2>
        <p className="text-gray-500">Vui lòng không đóng trình duyệt.</p>
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
           {/* SVG icon checkmark */}
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
        <p className="text-gray-600 mb-6">Cảm ơn bạn. Chuyến bay của bạn đã được đặt thành công.</p>
        
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border w-full max-w-md mb-6">
          <p><strong>Mã Booking:</strong> {bookingId}</p>
          <p><strong>Số tiền:</strong> {amount ? (Number(amount)).toLocaleString('vi-VN') + ' VNĐ' : 'N/A'}</p>
          <p><strong>Mã giao dịch ZaloPay:</strong> {apptransid}</p>
        </div>

        <button 
          onClick={() => navigate('/my-bookings')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Xem vé của tôi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
        {/* SVG icon cross */}
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </div>
      <h2 className="text-3xl font-bold text-red-600 mb-2">Thanh toán không thành công</h2>
      <p className="text-gray-600 mb-6">Giao dịch đã bị huỷ hoặc có lỗi xảy ra trong quá trình thanh toán.</p>
      
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
        >
          Về trang chủ
        </button>
        {bookingId && (
          <button 
            onClick={() => navigate(`/my-bookings`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Vào chi tiết đặt chỗ để thử lại
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
```
