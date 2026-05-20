import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X, Loader2, Armchair } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type { Aircraft, CreateSeatClassPayload, CreateSeatPayload, SeatClass } from '../../../api/types';
import { seatClassApi } from '../../../api/seatClassApi';
import { seatApi } from '../../../api/seatApi';
import { aircraftApi } from '../../../api/aircraftApi';

// APIs used:
// GET/POST/PUT/DELETE /api/seat-classes
// GET/POST/PUT/DELETE /api/seats  | GET /api/seats/aircraft/{id}
// GET /api/flight-seats | PATCH /api/flight-seats/{id}/status

type Seat = { seatId: number; seatNumber: string; seatClassName: string; aircraftModel: string };

export const SeatManagement = () => {
  const [tab, setTab] = useState<'classes' | 'seats' | 'flightSeats'>('classes');
  const [seatClasses, setSeatClasses] = useState<SeatClass[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [aircrafts, setAircrafts] =useState<Aircraft[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'createClass' | 'editClass' | 'createSeat' | null>(null);
  const [classForm, setClassForm] = useState<CreateSeatClassPayload>({className: 'ECONOMY',description: '',priceMultiplier: 1,});
  const [seatForm, setSeatForm] =useState<CreateSeatPayload>({seatNumber: '',aircraftId: 0,seatClassId: 0,});
  const [editClass, setEditClass] = useState<SeatClass | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAll = useCallback(async () => {
    try {
      const [seatClassRes,seatRes,aircraftRes] = await Promise.all([seatClassApi.getAll(),seatApi.getAll(), aircraftApi.getAll()]);

      if (seatClassRes.data.success) {
        setSeatClasses(seatClassRes.data.data);
      }
      if (seatRes.data.success) {
        setSeats(seatRes.data.data);
      }
      if (aircraftRes.data.success) {
        setAircrafts(aircraftRes.data.data );
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
  const saveSeat = async () => {
    setSaving(true);
    try {
      const response =await seatApi.create(seatForm);
      const { data } = response;
      if (data.success) {
        setSeats(prev => [...prev,data.data]);
        showToast('Tạo ghế thành công','success');
        setModal(null);
        setSeatForm({seatNumber: '',aircraftId: 0,seatClassId: 0,});
      }

    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.message ||'Tạo ghế thất bại','error');
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

  const delSeat = async (seatId: number) => {
    if (!confirm('Xóa ghế này?')) return;

    try {
      const { data } = await seatApi.remove(seatId);

      if (data.success) {setSeats(prev =>prev.filter(s => s.seatId !== seatId));
        showToast('Xóa ghế thành công', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Xóa thất bại', 'error');
    }
  };
  const tabs = [
    { key: 'classes' as const, label: 'Hạng ghế', count: seatClasses.length },
    { key: 'seats' as const, label: 'Ghế (theo máy bay)', count: seats.length },
  ];

  const filteredSeats = seats.filter(s =>
    s.seatNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.aircraftModel.toLowerCase().includes(search.toLowerCase()) ||
    s.seatClassName.toLowerCase().includes(search.toLowerCase())
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
              <div className="flex items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo số ghế, máy bay..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red/30"/>
                </div>

                {/* Add seat button */}
                <button type="button" onClick={() => { setSeatForm({ seatNumber: '',aircraftId: 0,seatClassId: 0,});setModal('createSeat');}}
                  className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition-colors">
                  <Plus className="w-4 h-4" /> Thêm ghế
                </button>
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
                            <button
                              onClick={() => delSeat(s.seatId)}
                              className="flex items-center gap-1 bg-red hover:bg-red/90 text-white text-xs font-bold px-3 py-2 rounded-lg"
                            >
                              <Trash2 className="w-3 h-3" />
                              Xóa
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
        {modal === 'createSeat' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

              <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h3 className="font-bold text-gray-900">
                    Thêm ghế
                  </h3>
                  <button onClick={() => setModal(null)}>
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4 p-6">

                  {/* Seat number */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-600">Số ghế</label>
                    <input
                      value={seatForm.seatNumber}
                      onChange={e =>
                        setSeatForm(prev => ({
                          ...prev,
                          seatNumber: e.target.value
                        }))
                      }
                      placeholder="VD: A01"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30"
                    />
                  </div>

                  {/* Aircraft */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-600">
                      Máy bay
                    </label>

                    <select
                      value={seatForm.aircraftId}
                      onChange={e =>
                        setSeatForm(prev => ({
                          ...prev,
                          aircraftId: Number(
                            e.target.value
                          )
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30"
                    >
                      <option value={0}>
                        Chọn máy bay
                      </option>

                      {aircrafts.map(aircraft => (
                        <option
                          key={aircraft.aircraftId}
                          value={aircraft.aircraftId}
                        >
                          {aircraft.model}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seat class */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-600">
                      Hạng ghế
                    </label>

                    <select
                      value={seatForm.seatClassId}
                      onChange={e =>
                        setSeatForm(prev => ({
                          ...prev,
                          seatClassId: Number(
                            e.target.value
                          )
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30"
                    >
                      <option value={0}>
                        Chọn hạng ghế
                      </option>

                      {seatClasses.map(sc => (
                        <option
                          key={sc.seatClassId}
                          value={sc.seatClassId}
                        >
                          {sc.className}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">

                    <button
                      onClick={() => setModal(null)}
                      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
                    >
                      Hủy
                    </button>

                    <button
                      onClick={saveSeat}
                      disabled={saving}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}

                      Thêm ghế
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
