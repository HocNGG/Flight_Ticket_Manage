import { Check, ExternalLink, ShieldCheck, Clock, Ticket } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

// API: POST /api/payments/zalopay/create-url?bookingId={bookingId}&amount={amount}
// Response: { success: true, data: "https://sandbox.zalopay.com.vn/..." }

type PaymentState = {
  flightId?: number | string;
  flightCode?: string;
  seatClass?: string;
  selectedSeat?: string;
  passenger?: { firstName: string; lastName: string };
  contact?: { contactEmail: string; contactPhone: string; contactName: string };
  bookingCode?: string;
  totalPrice?: number;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const seatClassLabel: Record<string, string> = {
  ECONOMY: 'Economy',
  BUSINESS: 'Business',
  FIRST: 'First Class',
};

export const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PaymentState | null;

  const bookingCode = state?.bookingCode || 'BK000000';
  const totalPrice = state?.totalPrice || 0;
  const passengerName = state?.passenger
    ? `${state.passenger.firstName} ${state.passenger.lastName}`
    : 'Hành khách';
  const flightCode = state?.flightCode || '---';
  const seatClass = seatClassLabel[state?.seatClass || ''] || state?.seatClass || '---';
  const selectedSeat = state?.selectedSeat || '---';
  const contactEmail = state?.contact?.contactEmail || '---';

  const handlePayWithZaloPay = async () => {
    // API: POST /api/payments/zalopay/create-url?bookingId={bookingId}&amount={amount}
    // Response: { success: true, data: "https://sandbox.zalopay.com.vn/..." }
    // ZaloPay sẽ redirect về: /booking/payment-result?status=success|failed&bookingId=...
    try {
      const token = localStorage.getItem('accessToken');
      const bookingId = state?.bookingCode; // dùng bookingCode hoặc bookingId tuỳ API
      const res = await fetch(
        `/api/payments/zalopay/create-url?bookingId=${bookingId}&amount=${totalPrice}`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const json = await res.json();
      if (json.success && json.data) {
        // Redirect đến trang thanh toán ZaloPay
        window.location.href = json.data as string;
      } else {
        alert('Không thể tạo link thanh toán. Vui lòng thử lại.\n' + (json.message || ''));
      }
    } catch (err) {
      // Fallback demo khi chưa có backend sẵn
      alert(
        `[Demo] Đang tạo đơn hàng ZaloPay...\n\nMã booking: ${bookingCode}\nSố tiền: ${formatPrice(totalPrice)}\n\n` +
          `Sau khi thanh toán, ZaloPay sẽ redirect về:\n/booking/payment-result?status=success&bookingId=...`
      );
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-8 pb-32 bg-surface">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
          Thanh toán <span className="italic text-red">an toàn.</span>
        </h1>
        <p className="text-gray-500 font-medium mt-2">
          Hoàn tất thanh toán để xác nhận đặt chỗ của bạn.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between w-full relative py-6 my-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[95%] h-0.5 bg-red"></div>
        <StepDot done /><StepDot done /><StepDot done /><StepDot active label="05" />
        <span className="relative z-10 bg-surface pl-4 text-[10px] font-bold uppercase tracking-widest text-dark">
          Bước 5: Thanh toán
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left — Payment */}
        <div className="lg:col-span-2 space-y-6">

          {/* Booking Code Banner */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red/10 flex items-center justify-center flex-shrink-0">
              <Ticket className="w-6 h-6 text-red" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mã đặt chỗ</p>
              <p className="text-2xl font-black text-gray-900 tracking-wider">{bookingCode}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trạng thái</p>
              <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full mt-1">
                Chờ thanh toán
              </span>
            </div>
          </div>

          {/* Time Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-4">
            <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-orange-800 text-sm">Vui lòng hoàn tất thanh toán trong <span className="text-orange-600">1 giờ</span></p>
              <p className="text-xs text-orange-600 mt-1">
                Nếu không thanh toán trong thời gian quy định, đơn đặt chỗ sẽ tự động bị hủy và ghế sẽ được giải phóng.
              </p>
            </div>
          </div>

          {/* ZaloPay Payment Block */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>

            {/* ZaloPay card — phương thức duy nhất theo API */}
            <div className="border-2 border-blue-500 bg-blue-50 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {/* ZaloPay logo text */}
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-sm leading-none text-center">ZALO<br/>PAY</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">ZaloPay</h3>
                  <p className="text-sm text-gray-500">Ví điện tử ZaloPay — Thanh toán nhanh, an toàn</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 mb-5 space-y-2">
                <p className="text-xs text-gray-500">Hỗ trợ thanh toán qua:</p>
                <div className="flex flex-wrap gap-2">
                  {['Ví ZaloPay', 'Thẻ ATM nội địa', 'Thẻ Visa/Mastercard', 'QR Code ngân hàng'].map((method) => (
                    <span key={method} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-full">
                      {method}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePayWithZaloPay}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-4 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
              >
                <span>Thanh toán qua ZaloPay</span>
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>

            {/* Security note */}
            <div className="mt-5 flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">
                Bạn sẽ được chuyển hướng đến trang thanh toán bảo mật của ZaloPay. Sau khi thanh toán thành công, vé điện tử sẽ được gửi đến email <span className="font-bold text-gray-800">{contactEmail}</span>.
              </p>
            </div>
          </div>

          {/* Security Badges */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '🔒', label: 'Mã hóa SSL' },
              { icon: '✅', label: 'Xác thực 2 bước' },
              { icon: '💳', label: 'PCI DSS Secure' },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 flex flex-col items-center gap-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-[10px] font-bold text-gray-600 text-center uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 sticky top-8">

            {/* Flight Visual Header */}
            <div className="relative h-36 bg-gradient-to-br from-red-600 to-red-800 flex items-end justify-start overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                {seatClass}
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm font-bold">{flightCode}</p>
                <p className="text-xs opacity-80">Chuyến bay của bạn</p>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div className="border-b border-gray-100 pb-4 space-y-3">
                <InfoRow label="Hành khách" value={passengerName} />
                <InfoRow label="Ghế" value={selectedSeat} />
                <InfoRow label="Hạng ghế" value={seatClass} />
                <InfoRow label="Email nhận vé" value={contactEmail} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Giá vé</span>
                  <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Phí dịch vụ</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-700 uppercase">Tổng cộng</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-red">{formatPrice(totalPrice)}</p>
                    <p className="text-xs text-gray-500">Đã bao gồm VAT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-xs font-bold text-gray-800 text-right max-w-[55%] truncate">{value}</span>
  </div>
);

const StepDot = ({ done, active, label }: { done?: boolean; active?: boolean; label?: string }) => (
  <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center relative z-10 ${
    done ? 'bg-red text-white' : active ? 'bg-white border-2 border-red text-red' : 'bg-white border-2 border-gray-200 text-gray-400'
  }`}>
    {done ? <Check className="w-3 h-3" /> : label}
  </div>
);
