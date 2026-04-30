// MyBookings.tsx
// Trang quản lý đặt chỗ của Passenger
// API: GET /api/bookings — lấy danh sách booking của user đang đăng nhập

import { Download, X, Search, ChevronRight, Plane } from 'lucide-react';
import { useState } from 'react';

// API response types
// GET /api/bookings
type BookingStatus = 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED' | 'PENDING_APPROVAL';

type Booking = {
  bookingId: number;
  bookingCode: string;
  flightId: number;
  flightCode: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  totalPrice: number;
  status: BookingStatus;
  bookingDate: string;
  passengers: { firstName: string; lastName: string; seatNumber: string }[];
};

// Mock data theo API response structure
const mockBookings: Booking[] = [
  {
    bookingId: 1,
    bookingCode: 'BK123456',
    flightId: 1,
    flightCode: 'VN001',
    departureAirport: 'SGN',
    arrivalAirport: 'HAN',
    departureTime: '2024-03-20T08:00:00',
    totalPrice: 2500000,
    status: 'PAID',
    bookingDate: '2024-03-15T10:30:00',
    passengers: [{ firstName: 'Nguyễn', lastName: 'Văn A', seatNumber: '12A' }],
  },
  {
    bookingId: 2,
    bookingCode: 'BK789012',
    flightId: 2,
    flightCode: 'VJ202',
    departureAirport: 'HAN',
    arrivalAirport: 'DAD',
    departureTime: '2024-04-05T14:30:00',
    totalPrice: 1890000,
    status: 'PENDING_PAYMENT',
    bookingDate: '2024-03-20T09:00:00',
    passengers: [{ firstName: 'Nguyễn', lastName: 'Văn A', seatNumber: '5C' }],
  },
  {
    bookingId: 3,
    bookingCode: 'BK345678',
    flightId: 3,
    flightCode: 'QH305',
    departureAirport: 'DAD',
    arrivalAirport: 'SGN',
    departureTime: '2024-02-10T18:00:00',
    totalPrice: 3200000,
    status: 'CANCELLED',
    bookingDate: '2024-02-01T11:00:00',
    passengers: [{ firstName: 'Nguyễn', lastName: 'Văn A', seatNumber: '20B' }],
  },
];

const statusConfig: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  PAID: { label: 'Đã thanh toán', color: 'text-green-700', bg: 'bg-green-100' },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-700', bg: 'bg-red-100' },
  PENDING_APPROVAL: { label: 'Chờ duyệt hủy', color: 'text-orange-700', bg: 'bg-orange-100' },
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

export const MyBookings = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [searchCode, setSearchCode] = useState('');

  const filteredBookings = mockBookings.filter((b) =>
    b.bookingCode.toLowerCase().includes(searchCode.toLowerCase()) ||
    b.flightCode.toLowerCase().includes(searchCode.toLowerCase())
  );

  const handleDownloadTicket = (booking: Booking) => {
    // API: GET /api/tickets/download/{bookingId}
    // Response: application/pdf — file "Airline_ETicket_{bookingId}.pdf"
    alert(`Đang tải vé PDF...\nBooking: ${booking.bookingCode}\nAPI: GET /api/tickets/download/${booking.bookingId}`);
    // window.open(`/api/tickets/download/${booking.bookingId}`, '_blank');
  };

  const handleCancelRequest = async () => {
    if (!selectedBooking || !cancelReason.trim()) return;
    setCancelLoading(true);
    try {
      // API: POST /api/bookings/{id}/cancel
      // Body: { reason, requestedRefundAmount }
      // Response: { cancelId, status: 'PENDING_APPROVAL' }
      await new Promise((r) => setTimeout(r, 1000)); // mock delay
      alert(`Yêu cầu hủy đã được gửi!\nMã booking: ${selectedBooking.bookingCode}\nLý do: ${cancelReason}`);
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedBooking(null);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-8 pb-24">

      {/* Header */}
      <div className="mb-10">
        <p className="text-red text-[10px] font-bold uppercase tracking-widest mb-1">Quản lý</p>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">ĐẶT CHỖ CỦA TÔI</h1>
        <p className="text-gray-500 font-medium mt-2">Xem, tải vé và quản lý tất cả chuyến bay của bạn.</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Tìm theo mã booking hoặc số hiệu chuyến bay..."
          className="w-full bg-white rounded-2xl h-12 pl-10 pr-4 text-sm font-medium text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red/20 shadow-sm"
        />
      </div>

      {/* Booking List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 && (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-400 font-medium">Không tìm thấy đặt chỗ nào.</p>
          </div>
        )}

        {filteredBookings.map((booking) => {
          const status = statusConfig[booking.status];
          return (
            <div
              key={booking.bookingId}
              className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">

                {/* Flight Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-red/10 flex items-center justify-center flex-shrink-0">
                    <Plane className="w-6 h-6 text-red -rotate-45" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-black text-gray-900 text-lg">{booking.departureAirport}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="font-black text-gray-900 text-lg">{booking.arrivalAirport}</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      {booking.flightCode} · {formatDate(booking.departureTime)} lúc {formatTime(booking.departureTime)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Ghế: {booking.passengers.map((p) => p.seatNumber).join(', ')} ·
                      {booking.passengers.map((p) => ` ${p.firstName} ${p.lastName}`).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Booking Code + Status */}
                <div className="flex flex-col gap-2 md:items-end">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mã:</span>
                    <span className="font-black text-gray-900 tracking-wider">{booking.bookingCode}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-lg font-black text-gray-900">{formatPrice(booking.totalPrice)}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 md:items-end">
                  {/* Download Ticket — chỉ khi PAID */}
                  {booking.status === 'PAID' && (
                    <button
                      onClick={() => handleDownloadTicket(booking)}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Tải vé PDF
                    </button>
                  )}

                  {/* Cancel — chỉ khi PAID hoặc PENDING_PAYMENT */}
                  {(booking.status === 'PAID' || booking.status === 'PENDING_PAYMENT') && (
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCancelModal(true);
                      }}
                      className="flex items-center gap-2 bg-red/10 hover:bg-red/20 text-red font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Yêu cầu hủy vé
                    </button>
                  )}

                  {booking.status === 'PENDING_PAYMENT' && (
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
                      Thanh toán ngay
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">Yêu cầu hủy vé</h3>
                <p className="text-sm text-gray-500 mt-1">Booking: {selectedBooking.bookingCode}</p>
              </div>
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-orange-700 font-medium">
                Yêu cầu hủy sẽ được gửi đến nhân viên để xem xét. Tiền hoàn lại sẽ được xử lý theo chính sách của hãng.
              </p>
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Lý do hủy <span className="text-red">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy vé..."
                rows={4}
                className="w-full bg-surface rounded-xl p-4 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={!cancelReason.trim() || cancelLoading}
                className="flex-1 bg-red text-white hover:bg-reddark font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {cancelLoading ? 'Đang gửi...' : 'Gửi yêu cầu hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
