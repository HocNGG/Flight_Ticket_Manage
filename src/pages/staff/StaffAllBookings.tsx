import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, CheckCircle2, Clock, XCircle, X, Loader2, User, Ticket, DollarSign } from 'lucide-react';
import { StaffLayout } from '../../layouts/StaffLayout';
import api from '../../api/axiosInstance';

type Booking = {
  bookingId: number;
  bookingCode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  bookingDate: string;
  status: string;
  totalPrice: number;
  flight?: {
    flightId: number;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
  };
  passengers?: Array<{
    bookingPassengerId: number;
    passenger: { fullName: string; passportNumber: string };
    flightSeat: { flightSeatId: number; seat: { seatNumber: string; seatClass: { className: string } } };
  }>;
  refund?: {
    refundId: number;
    penaltyAmount: number;
    refundAmount: number;
    refundDate: string;
    status: string;
    reason?: string;
  };
};

type BookingDetail = {
  bookingId?: number;
  bookingCode: string;
  bookingDate: string;
  paymentDeadline?: string;
  bookingStatus: string;
  contactEmail: string;
  contactName: string;
  contactPhone: string;
  totalPrice: string | number;
  flight?: {
    flightId: number;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    aircraftModel: string;
    airline?: { name: string; code: string };
    departureAirport?: { airportCode: string; airportName: string; city: string };
    arrivalAirport?: { airportCode: string; airportName: string; city: string };
  };
  passengers?: Array<{
    fullName: string;
    seatClass: string;
    seatNumber: string;
    passportNumber: string;
  }>;
  refund?: {
    refundId: number;
    penaltyAmount: number;
    refundAmount: number;
    refundDate: string;
    status: string;
    reason?: string;
    refundAccountNumber?: string;
    refundBankName?: string;
  };
};

const resolveBookingStatus = (status: string, refund?: { status: string }) => {
  if (refund && refund.status === 'PENDING') {
    return 'CANCELLATION_PENDING';
  }
  return status;
};

const statusCfg: Record<string, { label: string; color: string; Icon: React.FC<{ className?: string }> }> = {
  PENDING: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700', Icon: Clock },
  CONFIRMED: { label: 'Đã thanh toán (Đã xuất vé)', color: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
  CANCELLATION_PENDING: { label: 'Chờ duyệt hủy', color: 'bg-orange-100 text-orange-700', Icon: Clock },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', Icon: XCircle },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-blue-100 text-blue-700', Icon: CheckCircle2 },
  COMPLETED: { label: 'Đã hoàn thành', color: 'bg-gray-100 text-gray-700', Icon: CheckCircle2 },
};

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatDate = (d: string) => {
  if (!d) return '---';
  try {
    return new Date(d).toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return d;
  }
};

export const StaffAllBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.keyword = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/api/bookings/admin/list', { params });
      if (res.data.success && res.data.data) {
        setBookings(res.data.data);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const fetchDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/bookings/${id}/detail`);
      if (res.data.success && res.data.data) {
        setDetail({ ...res.data.data, bookingId: id });
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">All Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Xem toàn bộ đặt chỗ (chỉ đọc)</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Tìm theo mã booking, tên, số điện thoại..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(statusCfg).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Mã booking', 'Hành khách / Người đặt', 'Chuyến bay', 'Ngày đặt', 'Tổng tiền', 'Trạng thái', 'Hành động'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">Không có dữ liệu</td></tr>
                  ) : bookings.map(b => {
                    const resolvedStatus = resolveBookingStatus(b.status, b.refund);
                    const cfg = statusCfg[resolvedStatus] ?? { label: b.status, color: 'bg-gray-100 text-gray-600', Icon: Clock };
                    const { Icon: SIcon } = cfg;
                    const passengersNames = b.passengers && b.passengers.length > 0 
                      ? b.passengers.map(p => p.passenger.fullName).join(', ') 
                      : '';
                    return (
                      <tr key={b.bookingId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-black text-gray-800 text-xs tracking-wider">{b.bookingCode}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 font-semibold">
                          {b.contactName}
                          {passengersNames && (
                            <span className="text-gray-400 font-normal block text-[10px] mt-0.5">Đi: {passengersNames}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {b.flight?.flightNumber || `ID: ${b.flight?.flightId || '---'}`}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(b.bookingDate)}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-700 whitespace-nowrap">{formatPrice(b.totalPrice)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.color}`}>
                            <SIcon className="w-2.5 h-2.5" />{cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => fetchDetail(b.bookingId)}
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-3 h-3" /> Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal (read only) */}
        {(detail || detailLoading) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <div>
                  <h3 className="font-black text-gray-900">Booking Detail</h3>
                  {detail && <p className="text-xs text-gray-400 mt-0.5">{detail.bookingCode}</p>}
                </div>
                <button onClick={() => setDetail(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              
              {detailLoading ? (
                <div className="flex items-center justify-center py-16 flex-1">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              ) : detail ? (
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {/* Status badge */}
                  {(() => {
                    const resolvedDetailStatus = resolveBookingStatus(detail.bookingStatus, detail.refund);
                    const cfg = statusCfg[resolvedDetailStatus] ?? { label: detail.bookingStatus, color: 'bg-gray-100 text-gray-600', Icon: Clock };
                    const { Icon: SIcon } = cfg;
                    return (
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
                        <SIcon className="w-3.5 h-3.5" />{cfg.label}
                      </div>
                    );
                  })()}

                  {detail.flight && (
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Chuyến bay</p>
                      <p className="text-2xl font-black">{detail.flight.flightNumber}</p>
                      <p className="text-slate-300 text-xs mt-1">Khởi hành: {formatDate(detail.flight.departureTime)}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Mã booking', value: detail.bookingCode, Icon: Ticket },
                      { label: 'Tổng tiền', value: typeof detail.totalPrice === 'number' ? formatPrice(detail.totalPrice) : detail.totalPrice, Icon: DollarSign },
                      { label: 'Người đặt', value: detail.contactName ?? '---', Icon: User },
                      { label: 'Email', value: detail.contactEmail ?? '---', Icon: User },
                    ].map(({ label, value, Icon }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="w-3 h-3 text-gray-400" />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800 truncate">{value}</p>
                      </div>
                    ))}
                  </div>

                  {detail.refund && (
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 space-y-2.5">
                      <p className="text-orange-800 font-black text-xs uppercase tracking-widest">Thông Tin Hoàn Tiền</p>
                      
                      {detail.refund.reason && (
                        <div className="text-xs text-gray-700 bg-white/60 p-2.5 rounded-lg border border-orange-100/50">
                          <p className="text-gray-400 font-bold text-[9px] uppercase tracking-wider">Lý do hủy vé</p>
                          <p className="mt-0.5 font-medium italic">"{detail.refund.reason}"</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                        <div>
                          <p className="text-gray-500">Phí phạt hủy vé</p>
                          <p className="text-red font-black text-sm mt-0.5">{formatPrice(detail.refund.penaltyAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Số tiền hoàn trả</p>
                          <p className="text-green-700 font-black text-sm mt-0.5">{formatPrice(detail.refund.refundAmount)}</p>
                        </div>
                      </div>

                      {(detail.refund.refundBankName || detail.refund.refundAccountNumber) && (
                        <div className="text-xs text-gray-700 bg-white/60 p-2.5 rounded-lg border border-orange-100/50 space-y-1">
                          <p className="text-gray-400 font-bold text-[9px] uppercase tracking-wider">Thông tin nhận tiền hoàn</p>
                          <p className="font-semibold text-gray-800">
                            Ngân hàng: <span className="font-bold text-gray-900">{detail.refund.refundBankName || '---'}</span>
                          </p>
                          <p className="font-semibold text-gray-800">
                            Số tài khoản: <span className="font-bold text-gray-900 tracking-wider">{detail.refund.refundAccountNumber || '---'}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {detail.passengers && detail.passengers.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Hành khách</p>
                      <div className="space-y-2">
                        {detail.passengers.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                            <div>
                              <p className="text-sm font-bold text-gray-800">{p.fullName}</p>
                              <p className="text-[10px] text-gray-400">Passport: {p.passportNumber}</p>
                            </div>
                            <span className="text-xs font-black text-gray-600 bg-white border border-gray-100 px-3 py-1 rounded-lg">
                              Ghế {p.seatNumber} ({p.seatClass})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
                    ℹ️ Bạn đang xem ở chế độ chỉ đọc. Để duyệt hủy, vào <strong>Booking Requests</strong>.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};
