import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, CheckCircle2, XCircle, Clock, ChevronDown, X, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import api from '../../../api/axiosInstance';

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
    refundAccountNumber?: string;
    refundBankName?: string;
  };
};

type BookingDetail = {
  bookingId?: number; // kept to approve/reject
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

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLATION_PENDING', 'CANCELLED', 'REFUNDED', 'COMPLETED'];
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

const resolveBookingStatus = (status: string, refund?: { status: string }) => {
  if (refund && refund.status === 'PENDING') {
    return 'CANCELLATION_PENDING';
  }
  return status;
};

export const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (search.trim()) {
        params.keyword = search.trim();
      }
      const res = await api.get('/api/bookings/admin/list', { params });
      if (res.data.success && res.data.data) {
        setBookings(res.data.data);
      }
    } catch (e: any) {
      console.error(e);
      showToast('Lỗi khi tải danh sách đặt chỗ', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

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
      showToast('Lỗi khi tải chi tiết đặt chỗ', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const approveCancel = async (id: number) => {
    setProcessingId(id);
    try {
      const res = await api.put(`/api/bookings/${id}/cancel/approve`);
      if (res.data.success) {
        showToast('Đã duyệt yêu cầu hủy vé thành công', 'success');
        setDetail(null);
        fetchBookings();
      } else {
        showToast(res.data.message || 'Lỗi duyệt hủy vé', 'error');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.response?.data?.message || 'Lỗi kết nối', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectCancel = async (id: number) => {
    setProcessingId(id);
    try {
      const res = await api.put(`/api/bookings/${id}/cancel/reject`);
      if (res.data.success) {
        showToast('Từ chối yêu cầu hủy vé thành công', 'success');
        setDetail(null);
        fetchBookings();
      } else {
        showToast(res.data.message || 'Lỗi từ chối hủy vé', 'error');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.response?.data?.message || 'Lỗi kết nối', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-xl text-white text-sm font-bold shadow-lg
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.msg}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Booking Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý toàn bộ đơn đặt vé — duyệt hủy, xem chi tiết và từ chối hủy</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Tìm theo mã booking hoặc tên người đặt..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red/30"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red/30"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'Tất cả trạng thái' : (statusCfg[s]?.label ?? s)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
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
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Không có dữ liệu</td></tr>
                  ) : bookings.map((b) => {
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
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${cfg.color}`}>
                            <SIcon className="w-2.5 h-2.5" />{cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => fetchDetail(b.bookingId)}
                              className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <Eye className="w-3 h-3" /> Chi tiết
                            </button>
                            {resolvedStatus === 'CANCELLATION_PENDING' && (
                              <>
                                <button
                                  onClick={() => approveCancel(b.bookingId)}
                                  disabled={processingId === b.bookingId}
                                  className="flex items-center gap-1 text-[10px] font-bold text-green-700 hover:text-green-900 bg-green-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {processingId === b.bookingId ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => rejectCancel(b.bookingId)}
                                  disabled={processingId === b.bookingId}
                                  className="flex items-center gap-1 text-[10px] font-bold text-red hover:text-reddark bg-red/10 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {processingId === b.bookingId ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                  Từ chối
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {(detail || detailLoading) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <h3 className="font-bold text-gray-900">Chi tiết đặt chỗ {detail?.bookingCode}</h3>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>
              {detailLoading ? (
                <div className="flex items-center justify-center py-12 flex-1"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : detail ? (
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {/* General details grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: 'Mã booking', v: detail.bookingCode },
                      { l: 'Trạng thái', v: statusCfg[resolveBookingStatus(detail.bookingStatus, detail.refund)]?.label ?? resolveBookingStatus(detail.bookingStatus, detail.refund) },
                      { l: 'Chuyến bay', v: detail.flight?.flightNumber ?? '---' },
                      { l: 'Tổng tiền', v: typeof detail.totalPrice === 'number' ? formatPrice(detail.totalPrice) : detail.totalPrice },
                    ].map(({ l, v }) => (
                      <div key={l} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{l}</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Flight Route and Schedule */}
                  {detail.flight && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thông tin chuyến bay</p>
                      <div className="text-xs text-gray-700 font-semibold space-y-1">
                        <p>Hãng bay: {detail.flight.airline?.name} ({detail.flight.airline?.code})</p>
                        <p>Tàu bay: {detail.flight.aircraftModel}</p>
                        <p>Hành trình: {detail.flight.departureAirport?.city} ({detail.flight.departureAirport?.airportCode}) → {detail.flight.arrivalAirport?.city} ({detail.flight.arrivalAirport?.airportCode})</p>
                        <p>Khởi hành: {formatDate(detail.flight.departureTime)}</p>
                        <p>Thời gian bay: {detail.flight.duration}</p>
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thông tin liên hệ đặt vé</p>
                    <div className="text-xs text-gray-700 font-semibold space-y-1">
                      <p>Họ tên: {detail.contactName}</p>
                      <p>Email: {detail.contactEmail}</p>
                      <p>Điện thoại: {detail.contactPhone}</p>
                      <p>Ngày đặt: {detail.bookingDate}</p>
                    </div>
                  </div>

                  {/* Passengers */}
                  {detail.passengers && detail.passengers.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hành khách bay</p>
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

                  {/* Refund Information */}
                  {detail.refund && (
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 space-y-2.5">
                      <p className="text-orange-800 font-black text-xs uppercase tracking-widest">Yêu Cầu Hoàn Tiền</p>
                      
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

                  {/* Action Buttons for CANCELLATION_PENDING status */}
                  {resolveBookingStatus(detail.bookingStatus, detail.refund) === 'CANCELLATION_PENDING' && (
                    <div className="flex gap-3 mt-4 pt-2 border-t border-gray-100 flex-shrink-0">
                      <button
                        onClick={() => { approveCancel(detail.bookingId!); }}
                        disabled={processingId === detail.bookingId}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processingId === detail.bookingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Duyệt hủy
                      </button>
                      <button
                        onClick={() => { rejectCancel(detail.bookingId!); }}
                        disabled={processingId === detail.bookingId}
                        className="flex-1 bg-red hover:bg-reddark text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processingId === detail.bookingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
