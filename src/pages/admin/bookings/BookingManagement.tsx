import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, CheckCircle2, XCircle, Clock, ChevronDown, X, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

// GET /api/bookings (admin — all bookings)
// GET /api/bookings/{id}/detail
// PUT /api/bookings/{id}/cancel/approve

type Booking = {
  bookingId: number;
  bookingCode: string;
  flightId: number;
  totalPrice: number;
  status: string;
  bookingDate: string;
  passengerName?: string;
};

type BookingDetail = {
  bookingId: number;
  bookingCode: string;
  flight?: { flightCode: string; departureTime: string; arrivalTime: string };
  passengers?: Array<{ passengerCode: string; fullName: string; seatNumber: string; status?: string }>;
  totalPrice: number;
  status: string;
};

const STATUS_OPTIONS = ['ALL', 'PAID', 'PENDING_PAYMENT', 'CANCELLED', 'CANCEL_REQUESTED'];
const statusCfg: Record<string, { label: string; color: string; Icon: React.FC<{ className?: string }> }> = {
  PAID: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700', Icon: Clock },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', Icon: XCircle },
  CANCEL_REQUESTED: { label: 'Chờ duyệt hủy', color: 'bg-orange-100 text-orange-700', Icon: Clock },
};

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '---';

const token = () => localStorage.getItem('accessToken') ?? '';
const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

// Mock data fallback
const MOCK: Booking[] = [
  { bookingId: 1, bookingCode: 'BK123456', flightId: 1, totalPrice: 2500000, status: 'PAID', bookingDate: '2024-03-15T10:30:00', passengerName: 'Nguyễn Văn A' },
  { bookingId: 2, bookingCode: 'BK123457', flightId: 2, totalPrice: 5200000, status: 'PENDING_PAYMENT', bookingDate: '2024-03-16T08:00:00', passengerName: 'Trần Thị B' },
  { bookingId: 3, bookingCode: 'BK123458', flightId: 1, totalPrice: 1800000, status: 'CANCEL_REQUESTED', bookingDate: '2024-03-17T14:00:00', passengerName: 'Lê Văn C' },
  { bookingId: 4, bookingCode: 'BK123459', flightId: 3, totalPrice: 3100000, status: 'CANCELLED', bookingDate: '2024-03-18T09:00:00', passengerName: 'Phạm Thị D' },
];

export const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>(MOCK);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', { headers: authH() });
      const json = await res.json();
      if (json.success && json.data) setBookings(json.data);
    } catch { /* use mock */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const fetchDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}/detail`, { headers: authH() });
      const json = await res.json();
      if (json.success) setDetail(json.data);
    } catch {
      const m = bookings.find(b => b.bookingId === id);
      if (m) setDetail({ bookingId: m.bookingId, bookingCode: m.bookingCode, totalPrice: m.totalPrice, status: m.status });
    }
    setDetailLoading(false);
  };

  const approveCancel = async (id: number) => {
    setApproving(id);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel/approve`, { method: 'PUT', headers: authH() });
      const json = await res.json();
      if (json.success) {
        showToast('Đã duyệt hủy booking thành công', 'success');
        setDetail(null);
        fetchBookings();
      } else showToast(json.message || 'Lỗi', 'error');
    } catch { showToast('Lỗi kết nối', 'error'); }
    setApproving(null);
  };

  const filtered = bookings.filter(b => {
    const matchSearch = b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      (b.passengerName ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
          <p className="text-sm text-gray-500 mt-0.5">Quản lý toàn bộ đặt chỗ — duyệt hủy, xem chi tiết</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo mã booking hoặc tên hành khách..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red/30"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
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
                    {['Mã booking', 'Hành khách', 'Chuyến bay', 'Ngày đặt', 'Tổng tiền', 'Trạng thái', 'Hành động'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Không có dữ liệu</td></tr>
                  ) : filtered.map((b) => {
                    const cfg = statusCfg[b.status] ?? { label: b.status, color: 'bg-gray-100 text-gray-600', Icon: Clock };
                    const { Icon: SIcon } = cfg;
                    return (
                      <tr key={b.bookingId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-black text-gray-800 text-xs tracking-wider">{b.bookingCode}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{b.passengerName ?? `#${b.bookingId}`}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">ID: {b.flightId}</td>
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
                            {b.status === 'CANCEL_REQUESTED' && (
                              <button
                                onClick={() => approveCancel(b.bookingId)}
                                disabled={approving === b.bookingId}
                                className="flex items-center gap-1 text-[10px] font-bold text-green-700 hover:text-green-900 bg-green-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {approving === b.bookingId ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                Duyệt hủy
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
          )}
        </div>

        {/* Detail Modal */}
        {(detail || detailLoading) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Chi tiết đặt chỗ {detail?.bookingCode}</h3>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>
              {detailLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : detail ? (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: 'Mã booking', v: detail.bookingCode },
                      { l: 'Trạng thái', v: statusCfg[detail.status]?.label ?? detail.status },
                      { l: 'Chuyến bay', v: detail.flight?.flightCode ?? '---' },
                      { l: 'Tổng tiền', v: formatPrice(detail.totalPrice) },
                    ].map(({ l, v }) => (
                      <div key={l} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{l}</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                  {detail.passengers && detail.passengers.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hành khách</p>
                      <div className="space-y-2">
                        {detail.passengers.map(p => (
                          <div key={p.passengerCode} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                            <div>
                              <p className="text-sm font-bold text-gray-800">{p.fullName}</p>
                              <p className="text-[10px] text-gray-400">{p.passengerCode}</p>
                            </div>
                            <span className="text-xs font-black text-gray-600 bg-white border border-gray-100 px-3 py-1 rounded-lg">Ghế {p.seatNumber}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {detail.status === 'CANCEL_REQUESTED' && (
                    <button
                      onClick={() => { approveCancel(detail.bookingId); setDetail(null); }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Duyệt hủy đặt chỗ
                    </button>
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
