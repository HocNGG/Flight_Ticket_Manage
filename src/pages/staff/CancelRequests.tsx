import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Clock, Eye, X, Loader2,
  User, Ticket, DollarSign, AlertTriangle, Search
} from 'lucide-react';
import { StaffLayout } from '../../layouts/StaffLayout';
import api from '../../api/axiosInstance';

type CancelRequest = {
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
  CANCELLED: { label: 'Đã từ chối / Hủy', color: 'bg-red-100 text-red-700', Icon: XCircle },
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

export const CancelRequests = () => {
  const [requests, setRequests] = useState<CancelRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/bookings/admin/list');
      if (res.data.success && res.data.data) {
        // Chỉ lấy các đơn vé có yêu cầu hủy đang chờ duyệt (refund.status === 'PENDING')
        const cancelItems = res.data.data.filter(
          (b: CancelRequest) => b.refund && b.refund.status === 'PENDING'
        );
        setRequests(cancelItems);
      }
    } catch (e: any) {
      console.error(e);
      showToast('Lỗi khi tải yêu cầu hủy vé', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const fetchDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/bookings/${id}/detail`);
      if (res.data.success && res.data.data) {
        const reqItem = requests.find(r => r.bookingId === id);
        const refundData = res.data.data.refund || reqItem?.refund;
        setDetail({ ...res.data.data, bookingId: id, refund: refundData });
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
        fetchRequests();
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
        fetchRequests();
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

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.bookingCode.toLowerCase().includes(q) || r.contactName.toLowerCase().includes(q);
    return matchSearch;
  });

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-xl text-white text-sm font-bold shadow-xl
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Booking Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Xử lý các yêu cầu hủy đặt chỗ từ hành khách</p>
        </div>

        {/* Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-center gap-4">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-orange-800">
              Hiện có <span className="text-orange-600 font-extrabold">{requests.length} yêu cầu hủy vé</span> đang chờ xử lý.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo mã booking hoặc tên người đặt..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải yêu cầu...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Mã booking', 'Người đặt', 'Lý do hủy', 'Hoàn tiền yêu cầu', 'Trạng thái', 'Hành động'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16 text-gray-400">Không có yêu cầu nào cần xử lý</td></tr>
                  ) : filtered.map((req) => {
                    const resolvedStatus = resolveBookingStatus(req.status, req.refund);
                    const cfg = statusCfg[resolvedStatus] ?? { label: req.status, color: 'bg-gray-100 text-gray-600', Icon: Clock };
                    const { Icon: SIcon } = cfg;
                    return (
                      <tr key={req.bookingId} className="border-b border-gray-50 transition-colors bg-orange-50/10 hover:bg-orange-50/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse flex-shrink-0" />
                            <span className="font-black text-gray-800 text-xs tracking-wider">{req.bookingCode}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-bold text-gray-700">{req.contactName ?? '---'}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{req.contactEmail ?? ''}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-[300px] space-y-1">
                            <p className="text-xs text-gray-700 font-bold whitespace-pre-wrap">
                              {req.refund?.reason ?? '---'}
                            </p>
                            {(req.refund?.refundBankName || req.refund?.refundAccountNumber) && (
                              <p className="text-[10px] text-gray-500 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 inline-block font-semibold">
                                🏦 {req.refund.refundBankName}: <span className="font-extrabold text-gray-700 select-all">{req.refund.refundAccountNumber}</span>
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-bold text-green-700">{formatPrice(req.refund?.refundAmount ?? 0)}</p>
                            <p className="text-[10px] text-gray-400">/ {formatPrice(req.totalPrice)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.color}`}>
                            <SIcon className="w-2.5 h-2.5" />{cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              id={`btn-detail-${req.bookingId}`}
                              onClick={() => fetchDetail(req.bookingId)}
                              className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <Eye className="w-3 h-3" /> Chi tiết
                            </button>
                            <button
                              onClick={() => approveCancel(req.bookingId)}
                              disabled={processingId === req.bookingId}
                              className="flex items-center gap-1 text-[10px] font-bold text-green-700 hover:text-green-900 bg-green-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {processingId === req.bookingId ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                              Duyệt
                            </button>
                            <button
                              onClick={() => rejectCancel(req.bookingId)}
                              disabled={processingId === req.bookingId}
                              className="flex items-center gap-1 text-[10px] font-bold text-red hover:text-reddark bg-red/10 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {processingId === req.bookingId ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                              Từ chối
                            </button>
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

        {/* ── Booking Detail Modal ── */}
        {(detail || detailLoading) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <div>
                  <h3 className="font-black text-gray-900">Booking Detail</h3>
                  {detail && <p className="text-xs text-gray-400 mt-0.5">{detail.bookingCode}</p>}
                </div>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
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

                  {/* Flight info */}
                  {detail.flight && (
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Thông tin chuyến bay</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-black tracking-wider">{detail.flight.flightNumber}</p>
                          <p className="text-slate-300 text-xs mt-1">{formatDate(detail.flight.departureTime)}</p>
                        </div>
                        <div className="text-slate-400">✈</div>
                        <div className="text-right">
                          <p className="text-slate-300 text-xs">Đến</p>
                          <p className="text-sm font-bold mt-0.5">{formatDate(detail.flight.arrivalTime)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grid info */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Mã booking', value: detail.bookingCode, Icon: Ticket },
                      { label: 'Tổng tiền vé', value: typeof detail.totalPrice === 'number' ? formatPrice(detail.totalPrice) : detail.totalPrice, Icon: DollarSign },
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

                  {/* Cancel reason */}
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

                  {/* Passengers */}
                  {detail.passengers && detail.passengers.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Hành khách</p>
                      <div className="space-y-2">
                        {detail.passengers.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{p.fullName}</p>
                                <p className="text-[10px] text-gray-400">Passport: {p.passportNumber}</p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-gray-600 bg-white border border-gray-100 px-3 py-1 rounded-lg">
                              Ghế {p.seatNumber} ({p.seatClass})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  {resolveBookingStatus(detail.bookingStatus, detail.refund) === 'CANCELLATION_PENDING' && (
                    <div className="flex gap-3 mt-4 pt-2 border-t border-gray-100 flex-shrink-0">
                      <button
                        onClick={() => { approveCancel(detail.bookingId!); }}
                        disabled={processingId === detail.bookingId}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processingId === detail.bookingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Duyệt hủy
                      </button>
                      <button
                        onClick={() => { rejectCancel(detail.bookingId!); }}
                        disabled={processingId === detail.bookingId}
                        className="flex-1 bg-red hover:bg-reddark text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
    </StaffLayout>
  );
};
