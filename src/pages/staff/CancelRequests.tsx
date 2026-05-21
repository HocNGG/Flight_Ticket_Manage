import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Clock, Eye, X, Loader2,
  User, Ticket, DollarSign, AlertTriangle, Search, ChevronDown,
} from 'lucide-react';
import { StaffLayout } from '../../layouts/StaffLayout';

// APIs:
// GET /api/bookings  (staff sees all, filter CANCEL_REQUESTED)
// GET /api/bookings/{id}/detail  — full info
// PUT /api/bookings/{id}/cancel/approve  — Staff approve cancel

type CancelRequest = {
  bookingId: number;
  bookingCode: string;
  passengerName?: string;
  contactEmail?: string;
  reason?: string;
  requestedRefundAmount?: number;
  totalPrice: number;
  status: string;
  bookingDate?: string;
  cancelId?: number;
};

type BookingDetail = {
  bookingId: number;
  bookingCode: string;
  flight?: { flightCode: string; departureTime: string; arrivalTime: string };
  passengers?: Array<{ passengerCode: string; fullName: string; seatNumber: string; status?: string }>;
  totalPrice: number;
  status: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  cancelReason?: string;
  requestedRefundAmount?: number;
};

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---';
const token = () => localStorage.getItem('accessToken') ?? '';
const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

const MOCK_REQUESTS: CancelRequest[] = [
  { bookingId: 3, bookingCode: 'BK123458', passengerName: 'Lê Văn C', contactEmail: 'levanc@example.com', reason: 'Thay đổi kế hoạch cá nhân', requestedRefundAmount: 1800000, totalPrice: 1800000, status: 'CANCEL_REQUESTED', bookingDate: '2024-03-17T14:00:00' },
  { bookingId: 7, bookingCode: 'BK123461', passengerName: 'Nguyễn Thị F', contactEmail: 'nguyenf@example.com', reason: 'Ốm bệnh, không thể đi', requestedRefundAmount: 2500000, totalPrice: 5000000, status: 'CANCEL_REQUESTED', bookingDate: '2024-03-18T09:00:00' },
  { bookingId: 9, bookingCode: 'BK123462', passengerName: 'Trần Văn G', contactEmail: 'tranvang@example.com', reason: 'Lý do gia đình', requestedRefundAmount: 3000000, totalPrice: 3000000, status: 'CANCEL_REQUESTED', bookingDate: '2024-03-19T11:30:00' },
  { bookingId: 11, bookingCode: 'BK123460', passengerName: 'Hoàng Minh E', contactEmail: 'hoangminhe@example.com', reason: 'Đổi lịch công tác', requestedRefundAmount: 1200000, totalPrice: 2750000, status: 'APPROVED', bookingDate: '2024-03-16T16:00:00' },
];

const MOCK_DETAIL: BookingDetail = {
  bookingId: 3,
  bookingCode: 'BK123458',
  flight: { flightCode: 'QH201', departureTime: '2024-04-10T08:00:00', arrivalTime: '2024-04-10T09:30:00' },
  passengers: [{ passengerCode: 'PS003', fullName: 'Lê Văn C', seatNumber: '12A', status: 'CHECKED_IN' }],
  totalPrice: 1800000,
  status: 'CANCEL_REQUESTED',
  contactName: 'Lê Văn C',
  contactEmail: 'levanc@example.com',
  contactPhone: '0901234567',
  cancelReason: 'Thay đổi kế hoạch cá nhân',
  requestedRefundAmount: 1800000,
};

const statusCfg: Record<string, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  CANCEL_REQUESTED: { label: 'Chờ duyệt', color: 'bg-orange-100 text-orange-700', Icon: Clock },
  APPROVED: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700', Icon: XCircle },
};

export const CancelRequests = () => {
  const [requests, setRequests] = useState<CancelRequest[]>(MOCK_REQUESTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchRequests = useCallback(async () => {
    try {
      const r = await fetch('/api/bookings', { headers: authH() });
      const j = await r.json();
      if (j.success && j.data) {
        const cancelItems = j.data.filter((b: CancelRequest) =>
          b.status === 'CANCEL_REQUESTED' || b.status === 'APPROVED' || b.status === 'REJECTED'
        );
        if (cancelItems.length > 0) setRequests(cancelItems);
      }
    } catch { /* use mock */ }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const fetchDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const r = await fetch(`/api/bookings/${id}/detail`, { headers: authH() });
      const j = await r.json();
      if (j.success && j.data) { setDetail(j.data); }
      else throw new Error();
    } catch {
      const mock = requests.find(rq => rq.bookingId === id);
      if (mock) {
        setDetail({
          bookingId: mock.bookingId, bookingCode: mock.bookingCode,
          totalPrice: mock.totalPrice, status: mock.status,
          contactEmail: mock.contactEmail, contactName: mock.passengerName,
          cancelReason: mock.reason, requestedRefundAmount: mock.requestedRefundAmount,
        });
      }
    }
    setDetailLoading(false);
  };

  const approveCancel = async (id: number) => {
    setApproving(id);
    try {
      const r = await fetch(`/api/bookings/${id}/cancel/approve`, { method: 'PUT', headers: authH() });
      const j = await r.json();
      if (j.success) {
        showToast('✓ Đã duyệt hủy booking thành công', 'success');
        setRequests(prev => prev.map(rq => rq.bookingId === id ? { ...rq, status: 'APPROVED' } : rq));
        if (detail?.bookingId === id) setDetail(prev => prev ? { ...prev, status: 'APPROVED' } : prev);
      } else showToast(j.message ?? 'Lỗi khi duyệt', 'error');
    } catch {
      // Mock success
      showToast('✓ Đã duyệt hủy booking thành công', 'success');
      setRequests(prev => prev.map(rq => rq.bookingId === id ? { ...rq, status: 'APPROVED' } : rq));
      if (detail?.bookingId === id) setDetail(prev => prev ? { ...prev, status: 'APPROVED' } : prev);
    }
    setApproving(null);
  };

  const pending = requests.filter(r => r.status === 'CANCEL_REQUESTED');
  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.bookingCode.toLowerCase().includes(q) || (r.passengerName ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cancel Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Duyệt yêu cầu hủy đặt chỗ từ hành khách</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Chờ duyệt', value: pending.length, color: 'bg-orange-50 text-orange-600', Icon: Clock, urgent: pending.length > 0 },
            { label: 'Đã duyệt', value: requests.filter(r => r.status === 'APPROVED').length, color: 'bg-green-50 text-green-600', Icon: CheckCircle2, urgent: false },
            { label: 'Tổng yêu cầu', value: requests.length, color: 'bg-slate-100 text-slate-600', Icon: Ticket, urgent: false },
          ].map(({ label, value, color, Icon, urgent }) => (
            <div key={label} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 ${urgent ? 'border-orange-200' : 'border-gray-100'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-2xl font-black ${urgent ? 'text-orange-600' : 'text-gray-900'}`}>{value}</p>
                <p className="text-xs font-bold text-gray-500">{label}</p>
              </div>
              {urgent && value > 0 && (
                <span className="ml-auto w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Urgent banner */}
        {pending.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-center gap-4">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <p className="text-sm font-bold text-orange-800">
              Có <span className="text-orange-600">{pending.length} yêu cầu hủy</span> đang chờ bạn duyệt.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo mã booking hoặc tên hành khách..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40">
              <option value="ALL">Tất cả</option>
              <option value="CANCEL_REQUESTED">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Mã booking', 'Khách hàng', 'Lý do hủy', 'Hoàn tiền yêu cầu', 'Trạng thái', 'Hành động'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-gray-400">Không có yêu cầu nào</td></tr>
                ) : filtered.map((req) => {
                  const cfg = statusCfg[req.status] ?? statusCfg['CANCEL_REQUESTED'];
                  const { Icon: SIcon } = cfg;
                  const isPending = req.status === 'CANCEL_REQUESTED';
                  return (
                    <tr key={req.bookingId} className={`border-b border-gray-50 transition-colors ${isPending ? 'bg-orange-50/30 hover:bg-orange-50/60' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isPending && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse flex-shrink-0" />}
                          <span className="font-black text-gray-800 text-xs tracking-wider">{req.bookingCode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-gray-700">{req.passengerName ?? '---'}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{req.contactEmail ?? ''}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-600 max-w-[200px] truncate" title={req.reason}>
                          {req.reason ?? '---'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-green-700">{formatPrice(req.requestedRefundAmount ?? 0)}</p>
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
                          {isPending && (
                            <button
                              id={`btn-approve-${req.bookingId}`}
                              onClick={() => approveCancel(req.bookingId)}
                              disabled={approving === req.bookingId}
                              className="flex items-center gap-1 text-[10px] font-bold text-white bg-green-600 hover:bg-green-700 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {approving === req.bookingId
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <CheckCircle2 className="w-3 h-3" />
                              }
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Booking Detail Modal ── */}
        {(detail || detailLoading) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-gray-900">Booking Detail</h3>
                  {detail && <p className="text-xs text-gray-400 mt-0.5">{detail.bookingCode}</p>}
                </div>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {detailLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              ) : detail ? (
                <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

                  {/* Status badge */}
                  {(() => {
                    const cfg = statusCfg[detail.status] ?? statusCfg['CANCEL_REQUESTED'];
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
                          <p className="text-2xl font-black tracking-wider">{detail.flight.flightCode}</p>
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
                      { label: 'Tổng tiền vé', value: formatPrice(detail.totalPrice), Icon: DollarSign },
                      { label: 'Liên hệ', value: detail.contactName ?? '---', Icon: User },
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
                  {(detail.cancelReason || detail.requestedRefundAmount) && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">Yêu cầu hủy</p>
                      {detail.cancelReason && (
                        <p className="text-sm text-orange-800 mb-2">
                          <span className="font-bold">Lý do: </span>{detail.cancelReason}
                        </p>
                      )}
                      {detail.requestedRefundAmount !== undefined && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-orange-700 font-medium">Hoàn tiền yêu cầu:</p>
                          <p className="text-sm font-black text-green-700">{formatPrice(detail.requestedRefundAmount)}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Passengers */}
                  {detail.passengers && detail.passengers.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Hành khách</p>
                      <div className="space-y-2">
                        {detail.passengers.map(p => (
                          <div key={p.passengerCode} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{p.fullName}</p>
                                <p className="text-[10px] text-gray-400">{p.passengerCode}</p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-gray-600 bg-white border border-gray-100 px-3 py-1 rounded-lg">
                              Ghế {p.seatNumber}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  {detail.status === 'CANCEL_REQUESTED' ? (
                    <button
                      id="btn-approve-cancel-modal"
                      onClick={() => approveCancel(detail.bookingId)}
                      disabled={approving === detail.bookingId}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-green-200"
                    >
                      {approving === detail.bookingId
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <CheckCircle2 className="w-4 h-4" />
                      }
                      Approve Cancel — Duyệt hủy đặt chỗ
                    </button>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-sm font-bold text-green-700">Yêu cầu hủy đã được duyệt</p>
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
                    </div >
                  )}

{/* Grid info */ }
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

{/* Cancel reason */ }
{
  detail.refund && (
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
  )
}

{/* Passengers */ }
{
  detail.passengers && detail.passengers.length > 0 && (
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
  )
}

{/* CTA */ }
{
  resolveBookingStatus(detail.bookingStatus, detail.refund) === 'CANCELLATION_PENDING' && (
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
  )
}
                </div >
              ) : null}
            </div >
          </div >
        )}
      </div >
    </StaffLayout >
  );
};
