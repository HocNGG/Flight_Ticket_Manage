import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axiosInstance';
import type { ApiResponse } from '../../../api/types';
import {
  CheckCircle2,
  XCircle,
  Ticket,
  Calendar,
  User,
  Armchair,
  Mail,
  Phone,
  ArrowRight,
  RotateCcw,
  Home,
  Download,
  Loader2,
} from 'lucide-react';

// Sau khi ZaloPay redirect về, URL sẽ có query params:
// ?status=success&bookingId=1&bookingCode=BK123456&...
// hoặc ?status=failed&reason=...
// Nếu không có params, ta gọi GET /api/bookings/{id}/detail để lấy dữ liệu

type BookingDetail = {
  bookingId: number;
  bookingCode: string;
  flight: {
    flightCode?: string;
    flightNumber?: string;
    departureTime: string;
    arrivalTime: string;
    departureAirport?: any;
    arrivalAirport?: any;
  };
  passengers: Array<{
    passengerCode: string;
    fullName: string;
    seatNumber: string;
  }>;
  totalPrice: number;
  status: string;
  contactEmail?: string;
  contactPhone?: string;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDateTime = (dt: string) => {
  if (!dt) return '---';
  const d = new Date(dt);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── Main Component ────────────────────────────────────────────────────────
export const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ZaloPay redirect query params
  const status = searchParams.get('status'); // '1' (thành công), khác 1 là thất bại
  const apptransid = searchParams.get('apptransid');
  const reasonParam = searchParams.get('reason');

  // Lấy ra Booking ID từ chuỗi "260517_26_1779034540305" -> lấy "26"
  // Hỗ trợ cả tham số bookingId cũ (nếu có)
  const bookingIdParam = apptransid ? apptransid.split('_')[1] : searchParams.get('bookingId');

  // Nếu có status trên URL mà khác 1 và khác success thì coi là failed
  const isFailedUrl = status !== null && status !== '1' && status !== 'success';

  const { data: booking, isLoading: loading } = useQuery({
    queryKey: ['bookingDetail', bookingIdParam],
    queryFn: async () => {
      const res = await api.get<ApiResponse<BookingDetail>>(
        `/api/bookings/${bookingIdParam}/detail`
      );
      return res.data.data;
    },
    enabled: !!bookingIdParam,
    staleTime: 0,
    retry: 2,
    refetchInterval: (query) => {
      if (isFailedUrl) return false;
      const data = query.state.data as any;
      const currentStatus = data?.status || data?.bookingStatus;
      if (currentStatus === 'PENDING' || currentStatus === 'PENDING_PAYMENT') {
        return 2000;
      }
      return false;
    },
  });

  // Backend trả về `bookingStatus` thay vì `status`
  const dbStatus = (booking?.status || (booking as any)?.bookingStatus || '').toUpperCase();
  const isPaid = dbStatus === 'PAID' || dbStatus === 'CONFIRMED';
  const isPending = dbStatus === 'PENDING' || dbStatus === 'PENDING_PAYMENT';

  // Debug để dễ theo dõi
  console.log('URL Status:', status, '| DB Status:', dbStatus, '| isPaid:', isPaid, '| isPending:', isPending);

  const isFetchingOrPolling = loading || (booking && isPending && !isFailedUrl);

  if (isFetchingOrPolling) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin text-red" />
          <p className="font-medium">
            {booking && isPending ? 'Đang chờ xác nhận từ cổng thanh toán...' : 'Đang kiểm tra kết quả thanh toán...'}
          </p>
        </div>
      </div>
    );
  }

  // Determine final state ONLY from DB status to prevent fake payment
  const finalSuccess = isPaid;
  const finalFailed = isFailedUrl || (booking && !isPaid && !isPending);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-12 pb-32 bg-surface">
      {finalSuccess ? (
        <SuccessView booking={booking ?? null} navigate={navigate} />
      ) : finalFailed ? (
        <FailedView reason={reasonParam} booking={booking ?? null} navigate={navigate} />
      ) : (
        // Fallback nếu không có params
        <UnknownView navigate={navigate} />
      )}
    </div>
  );
};

// ─── Success View ─────────────────────────────────────────────────────────────
const SuccessView = ({
  booking,
  navigate,
}: {
  booking: BookingDetail | null;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const bookingCode = booking?.bookingCode ?? '---';
  const flightCode = booking?.flight?.flightCode || booking?.flight?.flightNumber || '---';
  const departureTime = booking?.flight?.departureTime ?? '';
  const arrivalTime = booking?.flight?.arrivalTime ?? '';
  const totalPrice = booking?.totalPrice ?? 0;
  const passengers = booking?.passengers ?? [];
  const contactEmail = booking?.contactEmail ?? '';
  const contactPhone = booking?.contactPhone ?? '';
  
  const getExtractedAirportCode = (airport: any) => {
    if (!airport) return '';
    if (typeof airport === 'string') return airport;
    return airport.airportCode || airport.city || '';
  };
  
  const departureAirport = getExtractedAirportCode(booking?.flight?.departureAirport);
  const arrivalAirport = getExtractedAirportCode(booking?.flight?.arrivalAirport);

  const displayPrice = typeof totalPrice === 'string' 
    ? totalPrice 
    : formatPrice(Number(totalPrice) || 0);
  
  const hasPrice = Boolean(totalPrice && (typeof totalPrice === 'string' || Number(totalPrice) > 0));

  return (
    <div className="flex flex-col items-center">
      {/* ── Hero ── */}
      <div className="flex flex-col items-center text-center mb-10">
        {/* Animated checkmark */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
            <div className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={1.5} />
            </div>
          </div>
          {/* Confetti dots */}
          <span className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</span>
          <span className="absolute -bottom-2 -left-2 text-xl animate-bounce delay-150">✈️</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-3">
          Thanh toán <span className="text-green-600 italic">thành công!</span>
        </h1>
        <p className="text-gray-500 text-base max-w-md">
          Đặt chỗ của bạn đã được xác nhận. Vé điện tử đã được gửi đến email của bạn.
        </p>
      </div>

      <div className="w-full max-w-3xl grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Ticket Card ── */}
        <div className="lg:col-span-3">
          {/* Ticket-style card */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

            {/* Top strip */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-bold uppercase tracking-widest">Mã đặt chỗ</p>
                <p className="text-white text-3xl font-black tracking-widest mt-0.5">{bookingCode}</p>
              </div>
              <div className="text-right">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/30">
                  ✓ ĐÃ THANH TOÁN
                </span>
              </div>
            </div>

            {/* Dashed separator */}
            <div className="flex items-center px-6 py-0">
              <div className="w-5 h-5 rounded-full bg-surface -ml-9 flex-shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2" />
              <div className="w-5 h-5 rounded-full bg-surface -mr-9 flex-shrink-0" />
            </div>

            {/* Flight info */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Khởi hành</p>
                  <p className="text-2xl font-black text-gray-900 mt-0.5">{departureAirport || '---'}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatDateTime(departureTime)}</p>
                </div>
                <div className="flex flex-col items-center gap-1 px-4">
                  <span className="text-gray-300 text-2xl">✈</span>
                  <p className="text-xs font-bold text-gray-400">{flightCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đến nơi</p>
                  <p className="text-2xl font-black text-gray-900 mt-0.5">{arrivalAirport || '---'}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatDateTime(arrivalTime)}</p>
                </div>
              </div>

              {/* Passenger list */}
              {passengers.length > 0 && (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hành khách</p>
                  {passengers.map((p, idx) => (
                    <div key={p.passengerCode || idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{p.fullName}</p>
                          {(p.passengerCode || (p as any).passportNumber) && (
                            <p className="text-[10px] text-gray-400">{p.passengerCode || (p as any).passportNumber}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-1.5">
                        <Armchair className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-black text-gray-700">{p.seatNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price footer */}
            {hasPrice && (
              <div className="border-t border-dashed border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tổng tiền</span>
                <span className="text-2xl font-black text-green-600">{displayPrice}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Side info ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Contact info */}
          {(contactEmail || contactPhone) && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Thông tin liên hệ</p>
              {contactEmail && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-700 font-medium break-all">{contactEmail}</p>
                </div>
              )}
              {contactPhone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{contactPhone}</p>
                </div>
              )}
            </div>
          )}

          {/* Email confirmation notice */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-800">Vé đã được gửi qua email</p>
                <p className="text-xs text-green-700 mt-1">
                  Vui lòng kiểm tra hộp thư{contactEmail ? ` "${contactEmail}"` : ''} để nhận vé điện tử và thông tin chuyến bay.
                </p>
              </div>
            </div>
          </div>

          {/* Calendar reminder */}
          {departureTime && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-red" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ngày khởi hành</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{formatDateTime(departureTime)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Lưu ý</p>
            <ul className="text-xs text-blue-700 space-y-1.5 list-disc list-inside">
              <li>Mang theo CMND/CCCD/Hộ chiếu khi làm thủ tục</li>
              <li>Có mặt tại sân bay trước ít nhất 2 tiếng</li>
              <li>Check-in online để tiết kiệm thời gian</li>
            </ul>
          </div>

          {/* CTA buttons */}
          <button
            id="btn-download-ticket"
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            In / Tải vé
          </button>

          <button
            id="btn-view-my-bookings"
            onClick={() => navigate('/bookings')}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            <Ticket className="w-4 h-4" />
            Xem đặt chỗ của tôi
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="btn-back-home-success"
            onClick={() => navigate('/search')}
            className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-bold py-3.5 rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Failed View ─────────────────────────────────────────────────────────────
const FailedView = ({
  reason,
  booking,
  navigate,
}: {
  reason: string | null;
  booking: BookingDetail | null;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const bookingCode = booking?.bookingCode ?? null;

  const failReasonMap: Record<string, string> = {
    cancelled: 'Giao dịch đã bị hủy bởi người dùng.',
    timeout: 'Giao dịch đã hết thời gian chờ (quá 1 giờ).',
    insufficient_funds: 'Số dư không đủ để thực hiện giao dịch.',
    payment_error: 'Đã xảy ra lỗi trong quá trình thanh toán.',
    cancel: 'Giao dịch đã bị hủy.',
  };

  const displayReason = (reason && failReasonMap[reason]) ||
    reason ||
    'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.';

  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto">

      {/* Hero icon */}
      <div className="relative mb-6">
        <div className="w-28 h-28 rounded-full bg-red-100 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-red-200 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600" strokeWidth={1.5} />
          </div>
        </div>
        <span className="absolute -top-2 -right-2 text-2xl">😞</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-3">
        Thanh toán <span className="text-red italic">thất bại.</span>
      </h1>
      <p className="text-gray-500 text-base mb-8 max-w-sm">{displayReason}</p>

      {/* Error card */}
      <div className="w-full bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-6">

        {/* Red header */}
        <div className="bg-gradient-to-r from-red-500 to-red-700 px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-red-100 text-xs font-bold uppercase tracking-widest">Trạng thái</p>
            <p className="text-white text-lg font-black">Giao dịch thất bại</p>
          </div>
          {bookingCode && (
            <div className="ml-auto text-right">
              <p className="text-red-100 text-xs font-bold uppercase tracking-widest">Mã booking</p>
              <p className="text-white font-black tracking-widest">{bookingCode}</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-6 space-y-4 text-left">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-sm font-bold text-red-800 mb-1">Lý do</p>
            <p className="text-sm text-red-700">{displayReason}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bạn có thể</p>
            <div className="space-y-2">
              {[
                { icon: '🔄', text: 'Thử lại với phương thức thanh toán khác' },
                { icon: '💳', text: 'Kiểm tra số dư tài khoản / thẻ' },
                { icon: '📞', text: 'Liên hệ hỗ trợ nếu vấn đề tiếp tục xảy ra' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-base">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Lưu ý: Đặt chỗ của bạn vẫn còn hiệu lực. Vui lòng hoàn tất thanh toán trong thời hạn quy định.
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full flex flex-col gap-3">
        <button
          id="btn-retry-payment"
          onClick={() => navigate(-1)}
          className="w-full flex items-center justify-center gap-2 bg-red hover:bg-red/90 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-red/20"
        >
          <RotateCcw className="w-4 h-4" />
          Thử lại thanh toán
        </button>

        <button
          id="btn-view-my-bookings-failed"
          onClick={() => navigate('/bookings')}
          className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-bold py-4 rounded-xl transition-colors"
        >
          <Ticket className="w-4 h-4" />
          Xem đặt chỗ của tôi
        </button>

        <button
          id="btn-back-home-failed"
          onClick={() => navigate('/search')}
          className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 font-medium py-2 transition-colors text-sm"
        >
          <Home className="w-4 h-4" />
          Về trang chủ
        </button>
      </div>
    </div>
  );
};

// ─── Unknown / Fallback View ──────────────────────────────────────────────────
const UnknownView = ({ navigate }: { navigate: ReturnType<typeof useNavigate> }) => (
  <div className="flex flex-col items-center text-center max-w-md mx-auto py-20">
    <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
      <Loader2 className="w-10 h-10 text-yellow-500" />
    </div>
    <h1 className="text-3xl font-black text-gray-900 mb-3">Không xác định được trạng thái</h1>
    <p className="text-gray-500 text-sm mb-8">
      Chúng tôi không thể xác định kết quả giao dịch của bạn. Vui lòng kiểm tra mục{' '}
      <span className="font-bold text-red">Đặt chỗ của tôi</span> để xem trạng thái mới nhất.
    </p>
    <div className="flex flex-col gap-3 w-full">
      <button
        id="btn-view-my-bookings-unknown"
        onClick={() => navigate('/bookings')}
        className="w-full flex items-center justify-center gap-2 bg-red hover:bg-red/90 text-white font-bold py-4 rounded-xl transition-colors"
      >
        <Ticket className="w-4 h-4" />
        Xem đặt chỗ của tôi
        <ArrowRight className="w-4 h-4" />
      </button>
      <button
        id="btn-back-home-unknown"
        onClick={() => navigate('/search')}
        className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-bold py-4 rounded-xl transition-colors"
      >
        <Home className="w-4 h-4" />
        Về trang chủ
      </button>
    </div>
  </div>
);
