  import { useState, useEffect, useCallback } from 'react';
  import { Plus, Pencil, Trash2, Search, X, Loader2, Route as RouteIcon } from 'lucide-react';
  import { AdminLayout } from '../../../layouts/AdminLayout';
  import type {CreateRoutePayload, FlightRoute} from '../../../api/types';
import { routeApi } from '../../../api/routeApi';
import { airportApi } from '../../../api/airportApi';

  // GET /api/routes | POST /api/routes | PUT /api/routes/{id} | DELETE /api/routes/{id}
  type Airport = { airportId: number; airportCode: string; airportName: string };
  type Form = CreateRoutePayload;
  const EMPTY: Form = {departureAirportId: 0,arrivalAirportId: 0,distance: 0,duration: '',};
  const formatDuration = (value: string): string => {
    if (!value) {return '';}
    const [hour, minute] = value.split(':').map(Number);
    const parts: string[] = [];

    if (hour > 0) {parts.push(`${hour} giờ`);}
    if (minute > 0) {parts.push(`${minute} phút`);}

    return parts.join(' ');
  };
  export const RouteManagement = () => {
    const [routes, setRoutes] = useState<FlightRoute[]>([]);
    const [airports, setAirports] = useState<Airport[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<'create' | 'edit' | null>(null);
    const [editItem, setEditItem] = useState<FlightRoute | null>(null);
    const [form, setForm] = useState<Form>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    const fetchAll = useCallback(async () => {
      setLoading(true);
      try {
        const [routeRes, airportRes] =await Promise.all([routeApi.getAll(),airportApi.getAll(),]);
        if (routeRes.data.success) {
          setRoutes(routeRes.data.data);
        }
        if (airportRes.data.success) {
          setAirports(airportRes.data.data);
        }
      } catch (err) {
        console.error(err);
        showToast(
          'Không thể tải dữ liệu',
          'error'
        );
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const openCreate = () => { setForm(EMPTY); setEditItem(null); setModal('create'); };

    const save = async () => {
      if (!form.departureAirportId ||!form.arrivalAirportId ||!form.duration) {
        showToast('Vui lòng điền đầy đủ thông tin','error');
        return;
      }
      if (
        form.departureAirportId ===
        form.arrivalAirportId
      ) {
        showToast(
          'Sân bay đi và đến không được trùng nhau',
          'error'
        );
        return;
      }
      const durationRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (!durationRegex.test(form.duration)) {
        showToast(
          'Thời gian bay phải đúng định dạng HH:mm',
          'error'
        );
        return;
      }
      setSaving(true);

      try {
        let response;
        if (modal === 'edit') {
          response = await routeApi.update(
            editItem!.routeId,
            form
          );
        } else {
          response = await routeApi.create(
            form
          );
        }

        const { data } = response;
        if (data.success) {
          showToast(modal === 'edit'? 'Cập nhật thành công': 'Tạo thành công','success');
          setModal(null);
          await fetchAll();

        } else {
          showToast(
            data.message || 'Có lỗi xảy ra',
            'error'
          );
        }
      } catch (err: any) {
        console.error(err);
        showToast(err?.response?.data?.message ||'Không thể kết nối server','error');
      } finally {
        setSaving(false);
      }
    };

    const del = async (id: number) => {
      if (!confirm('Xóa tuyến bay này?')) {return;}
      setDeleting(id);
      try {
        const { data } =await routeApi.remove(id);
        if (data.success) {
          setRoutes(prev =>prev.filter(r => r.routeId !== id));
          showToast('Xóa thành công','success');
        } else {
          showToast(data.message || 'Xóa thất bại','error');
        }
      } catch (err: any) {
        console.error(err);
        showToast(err?.response?.data?.message ||'Không thể kết nối server','error');
      } finally {
        setDeleting(null);
      }
    };

    const filtered = routes.filter(r =>
      r.departureAirportCode
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      r.arrivalAirportCode
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    return (
      <AdminLayout>
        <div className="space-y-5">
          {toast && <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-xl text-white text-sm font-bold shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.msg}</div>}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Route Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">{routes.length} tuyến bay đang hoạt động</p>
            </div>
            <button onClick={openCreate} className="flex items-center gap-2 bg-red hover:bg-red/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Thêm tuyến bay
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo mã sân bay..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red/30" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading
              ? <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mr-2" />Đang tải...</div>
              : <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Tuyến bay', 'Khoảng cách', 'Thời gian bay', 'Hành động'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0
                      ? <tr><td colSpan={4} className="text-center py-12 text-gray-400">Không có dữ liệu</td></tr>
                      : filtered.map(r => (
                        <tr key={r.routeId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                                <RouteIcon className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-black text-gray-800">
                                  <span className="text-teal-700">{r.departureAirportCode}</span>
                                  <span className="text-gray-400 mx-2">→</span>
                                  <span className="text-teal-700">{r.arrivalAirportCode}</span>
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{r.distance > 0 ? `${r.distance} km` : '---'}</td>
                          <td className="px-4 py-3">
                            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full">{formatDuration(r.duration)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setEditItem(r); setForm({ departureAirportId: r.departureAirportId, arrivalAirportId: r.arrivalAirportId, distance: r.distance, duration: r.duration }); setModal('edit'); }}
                                className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100">
                                <Pencil className="w-3 h-3" /> Sửa
                              </button>
                              <button onClick={() => del(r.routeId)} disabled={deleting === r.routeId}
                                className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-100 disabled:opacity-50">
                                {deleting === r.routeId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          {modal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">{modal === 'edit' ? 'Cập nhật tuyến bay' : 'Thêm tuyến bay mới'}</h3>
                  <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: 'Sân bay khởi hành *', field: 'departureAirportId' as keyof Form },
                    { label: 'Sân bay đến *', field: 'arrivalAirportId' as keyof Form },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
                      <select value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: Number(e.target.value) }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30">
                        <option value="">-- Chọn sân bay --</option>
                        {airports.map(a => <option key={a.airportId} value={a.airportId}>{a.airportCode} — {a.airportName}</option>)}
                      </select>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Khoảng cách (km)</label>
                    <input type="number" value={form.distance} onChange={e => setForm(p => ({ ...p, distance: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Thời gian bay *</label>
                    <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                      placeholder="VD: 02:10"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
                    <button onClick={save} disabled={saving} className="flex-1 bg-red hover:bg-red/90 text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} {modal === 'edit' ? 'Cập nhật' : 'Thêm mới'}
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

