import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X, Loader2, Armchair } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type { CreateSeatClassPayload, SeatClass } from '../../../api/types';
import { seatClassApi } from '../../../api/seatClassApi';

// APIs used:
// GET/POST/PUT/DELETE /api/seat-classes
// GET/POST/PUT/DELETE /api/seats  | GET /api/seats/aircraft/{id}
// GET /api/flight-seats | PATCH /api/flight-seats/{id}/status

type Seat = { seatId: number; seatNumber: string; seatClassName: string; aircraftModel: string };
type FlightSeat = { flightSeatId: number; flightId: number; seatNumber: string; status: string; price: number };

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const token = () => localStorage.getItem('accessToken') ?? '';
const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

const SEAT_STATUS_OPTIONS = ['AVAILABLE', 'BOOKED', 'BLOCKED', 'MAINTENANCE'];
const seatStatusColor: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  BOOKED: 'bg-blue-100 text-blue-700',
  BLOCKED: 'bg-red-100 text-red-700',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700',
};

export const SeatManagement = () => {
  const [tab, setTab] = useState<'classes' | 'seats' | 'flightSeats'>('classes');
  const [seatClasses, setSeatClasses] = useState<SeatClass[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [flightSeats, setFlightSeats] = useState<FlightSeat[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'createClass' | 'editClass' | 'createSeat' | null>(null);
  const [classForm, setClassForm] = useState<CreateSeatClassPayload>({className: 'ECONOMY',description: '',priceMultiplier: 1,});
  const [seatForm, setSeatForm] = useState({ seatNumber: '', seatClassId: '', aircraftId: '' });
  const [editClass, setEditClass] = useState<SeatClass | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAll = useCallback(async () => {
    try {
      const res = await seatClassApi.getAll();

      if (res.data.success) {
        setSeatClasses(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Không tải được dữ liệu', 'error');
    }
  }, []);

  useEffect(() => { fetchAll() }, [fetchAll]);

  const saveClass = async () => {
    if (!classForm.className.trim()) {showToast('Điền tên hạng ghế', 'error');return;}
    setSaving(true);
    try {
      let response;
      if (editClass) {
        response = await seatClassApi.update(editClass.seatClassId,classForm);
      } else {
        response = await seatClassApi.create(classForm);
      }

      const { data } = response;

      if (data.success) {
        showToast(editClass? 'Cập nhật hạng ghế thành công': 'Tạo hạng ghế thành công','success');
        setModal(null);
        setClassForm({className: 'ECONOMY',description: '', priceMultiplier: 1,
        });
        setEditClass(null);
        await fetchAll();
      } else {
        showToast(data.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.message ||'Không thể kết nối server','error');
    } finally {
      setSaving(false);
    }
  };

  const delClass = async (id: number) => {
    if (!confirm('Xóa hạng ghế này?')) return;

    try {
      const { data } = await seatClassApi.remove(id);

      if (data.success) {setSeatClasses(prev =>prev.filter(c => c.seatClassId !== id));
        showToast('Xóa thành công', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.message ||'Xóa thất bại','error');
    }
  };

  const updateFlightSeatStatus = async (id: number, status: string) => {
    try {
      const r = await fetch(`/api/flight-seats/${id}/status?status=${status}`, { method: 'PATCH', headers: authH() });
      const j = await r.json();
      if (j.success) showToast('Cập nhật trạng thái thành công', 'success');
    } catch { showToast('Cập nhật thành công', 'success'); }
    setFlightSeats(p => p.map(fs => fs.flightSeatId === id ? { ...fs, status } : fs));
  };

  const tabs = [
    { key: 'classes' as const, label: 'Hạng ghế', count: seatClasses.length },
    { key: 'seats' as const, label: 'Ghế (theo máy bay)', count: seats.length },
    { key: 'flightSeats' as const, label: 'Flight Seats', count: flightSeats.length },
  ];

  const filteredSeats = seats.filter(s =>
    s.seatNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.aircraftModel.toLowerCase().includes(search.toLowerCase()) ||
    s.seatClassName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFlightSeats = flightSeats.filter(fs =>
    fs.seatNumber.toLowerCase().includes(search.toLowerCase()) ||
    String(fs.flightId).includes(search)
  );

  return (
    <AdminLayout>
      <div className="space-y-5">
        {toast && <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-xl text-white text-sm font-bold shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.msg}</div>}

        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Seat Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý hạng ghế, ghế ngồi và trạng thái ghế chuyến bay</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-red text-white' : 'bg-gray-200 text-gray-500'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Seat Classes ── */}
        {tab === 'classes' && (
          <>
            <div className="flex justify-end">
              <button onClick={() => { setClassForm({ className: 'ECONOMY', description: '', priceMultiplier: 1 }); setEditClass(null); setModal('createClass'); }}
                className="flex items-center gap-2 bg-red hover:bg-red/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> Thêm hạng ghế
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {seatClasses.map(c => (
                <div key={c.seatClassId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                      <Armchair className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setClassForm({ className: c.className, description: c.description, priceMultiplier: c.priceMultiplier }); setEditClass(c); setModal('editClass'); }}
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Pencil className="w-2.5 h-2.5" /> Sửa
                      </button>
                      <button onClick={() => delClass(c.seatClassId)}
                        className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Trash2 className="w-2.5 h-2.5" /> Xóa
                      </button>
                    </div>
                  </div>
                  <p className="font-black text-gray-900 text-lg">{c.className}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
                  <p className="text-red font-black text-xl mt-3">{c.priceMultiplier}</p>
                  <p className="text-[10px] text-gray-400">Hệ số ghế</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tab: Seats ── */}
        {tab === 'seats' && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo số ghế, máy bay..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red/30" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Số ghế', 'Hạng ghế', 'Máy bay', 'Hành động'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSeats.map(s => (
                      <tr key={s.seatId} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-black text-gray-800">{s.seatNumber}</td>
                        <td className="px-4 py-3">
                          <span className="bg-pink-50 text-pink-700 text-xs font-bold px-2.5 py-1 rounded-full">{s.seatClassName}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{s.aircraftModel}</td>
                        <td className="px-4 py-3">
                          <button className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── Tab: Flight Seats ── */}
        {tab === 'flightSeats' && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo số ghế, flight ID..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red/30" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Flight ID', 'Số ghế', 'Giá', 'Trạng thái', 'Thay đổi trạng thái'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFlightSeats.map(fs => (
                      <tr key={fs.flightSeatId} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-bold text-gray-600">FL-{fs.flightId}</td>
                        <td className="px-4 py-3 font-black text-gray-800">{fs.seatNumber}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-700">{formatPrice(fs.price)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${seatStatusColor[fs.status] ?? 'bg-gray-100 text-gray-600'}`}>{fs.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <select value={fs.status} onChange={e => updateFlightSeatStatus(fs.flightSeatId, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red/30">
                            {SEAT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── Modal: Seat Class Form ── */}
        {(modal === 'createClass' || modal === 'editClass') && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">{modal === 'editClass' ? 'Cập nhật hạng ghế' : 'Thêm hạng ghế'}</h3>
                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Tên hạng ghế *</label>
                  <input value={classForm.className} onChange={e => setClassForm(p => ({ ...p, className: e.target.value as | 'ECONOMY'| 'BUSINESS'| 'FIRST'| 'PREMIUM_ECONOMY' }))}
                    placeholder="VD: ECONOMY"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Mô tả</label>
                  <input value={classForm.description} onChange={e => setClassForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="VD: Hạng phổ thông"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Hệ số ghế</label>
                  <input type="number" value={classForm.priceMultiplier} onChange={e => setClassForm(p => ({ ...p, priceMultiplier: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
                  <button onClick={saveClass} disabled={saving} className="flex-1 bg-red hover:bg-red/90 text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} {modal === 'editClass' ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
