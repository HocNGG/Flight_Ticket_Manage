import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, CheckCircle2, Clock, XCircle, X, Loader2, User, Ticket, DollarSign } from 'lucide-react';
import { StaffLayout } from '../../layouts/StaffLayout';

// GET /api/bookings — Staff reads all bookings (read only)
// GET /api/bookings/{id}/detail — View full detail

type Booking = {
  bookingId: number;
  bookingCode: string;
  flightId?: number;
  totalPrice: number;
  status: string;
  bookingDate?: string;
  passengerName?: string;
};

type BookingDetail = {
  bookingId: number;
  bookingCode: string;
  flight?: { flightCode: string; departureTime: string; arrivalTime: string };
  passengers?: Array<{ passengerCode: string; fullName: string; seatNumber: string }>;
  totalPrice: number;
  status: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
};

const MOCK_BOOKINGS: Booking[] = [
  { bookingId: 1, bookingCode: 'BK123456', flightId: 1, totalPrice: 2500000, status: 'PAID', bookingDate: '2024-03-15T10:30:00', passengerName: 'Nguyễn Văn A' },
  { bookingId: 2, bookingCode: 'BK123457', flightId: 2, totalPrice: 5200000, status: 'PENDING_PAYMENT', bookingDate: '2024-03-16T08:00:00', passengerName: 'Trần Thị B' },
  { bookingId: 3, bookingCode: 'BK123458', flightId: 1, totalPrice: 1800000, status: 'CANCEL_REQUESTED', bookingDate: '2024-03-17T14:00:00', passengerName: 'Lê Văn C' },
  { bookingId: 4, bookingCode: 'BK123459', flightId: 3, totalPrice: 3100000, status: 'CANCELLED', bookingDate: '2024-03-18T09:00:00', passengerName: 'Phạm Thị D' },
  { bookingId: 5, bookingCode: 'BK123460', flightId: 2, totalPrice: 2750000, status: 'PAID', bookingDate: '2024-03-19T11:00:00', passengerName: 'Hoàng Minh E' },
  { bookingId: 6, bookingCode: 'BK123461', flightId: 1, totalPrice: 4000000, status: 'PAID', bookingDate: '2024-03-20T13:00:00', passengerName: 'Nguyễn Thị F' },
];

const statusCfg: Record<string, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  PAID: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700', Icon: Clock },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', Icon: XCircle },
  CANCEL_REQUESTED: { label: 'Chờ duyệt hủy', color: 'bg-orange-100 text-orange-700', Icon: Clock },
};

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '---';
const token = () => localStorage.getItem('accessToken') ?? '';
const authH = () => ({ Authorization: `Bearer ${token()}` });

export const StaffAllBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const r = await fetch('/api/bookings', { headers: authH() });
      const j = await r.json();
      if (j.success && j.data) setBookings(j.data);
    } catch { /* mock */ }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const r = await fetch(`/api/bookings/${id}/detail`, { headers: authH() });
      const j = await r.json();
      if (j.success && j.data) { setDetail(j.data); }
      else throw new Error();
    } catch {
      const b = bookings.find(x => x.bookingId === id);
      if (b) setDetail({ bookingId: b.bookingId, bookingCode: b.bookingCode, totalPrice: b.totalPrice, status: b.status, contactName: b.passengerName });
    }
    setDetailLoading(false);
  };

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = b.bookingCode.toLowerCase().includes(q) || (b.passengerName ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo mã booking hoặc tên hành khách..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/40">
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(statusCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Mã booking', 'Hành khách', 'Chuyến bay', 'Ngày đặt', 'Tổng tiền', 'Trạng thái', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Không có dữ liệu</td></tr>
                  : filtered.map(b => {
                    const cfg = statusCfg[b.status] ?? { label: b.status, color: 'bg-gray-100 text-gray-600', Icon: Clock };
                    const { Icon: SIcon } = cfg;
                    return (
                      <tr key={b.bookingId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-black text-gray-800 text-xs tracking-wider">{b.bookingCode}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{b.passengerName ?? '---'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">ID: {b.flightId ?? '---'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(b.bookingDate)}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-700 whitespace-nowrap">{formatPrice(b.totalPrice)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.color}`}>
                            <SIcon className="w-2.5 h-2.5" />{cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => fetchDetail(b.bookingId)}
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                            <Eye className="w-3 h-3" /> Xem
                          </button>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal (read only) */}
        {(detail || detailLoading) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-gray-900">Booking Detail</h3>
                  {detail && <p className="text-xs text-gray-400 mt-0.5">{detail.bookingCode}</p>}
                </div>
                <button onClick={() => setDetail(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              {detailLoading
                ? <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
                : detail && (
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {detail.flight && (
                      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Chuyến bay</p>
                        <p className="text-2xl font-black">{detail.flight.flightCode}</p>
                        <p className="text-slate-300 text-xs mt-1">Khởi hành: {new Date(detail.flight.departureTime).toLocaleString('vi-VN')}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Mã booking', value: detail.bookingCode, Icon: Ticket },
                        { label: 'Tổng tiền', value: formatPrice(detail.totalPrice), Icon: DollarSign },
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
                    {detail.passengers && detail.passengers.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Hành khách</p>
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
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
                      ℹ️ Bạn đang xem ở chế độ chỉ đọc. Để duyệt hủy, vào <strong>Booking Requests</strong>.
                    </div>
                  </div>
                )
              }
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};
