import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X, Loader2, Cpu } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

// GET /api/aircrafts | POST /api/aircrafts | PUT /api/aircrafts/{id} | DELETE /api/aircrafts/{id}
type Aircraft = { aircraftId: number; model: string; manufacturer: string; totalSeats: number };
type Form = Omit<Aircraft, 'aircraftId'>;
const EMPTY: Form = { model: '', manufacturer: '', totalSeats: 180 };

const MOCK: Aircraft[] = [
  { aircraftId: 1, model: 'Boeing 787', manufacturer: 'Boeing', totalSeats: 300 },
  { aircraftId: 2, model: 'Airbus A320', manufacturer: 'Airbus', totalSeats: 180 },
  { aircraftId: 3, model: 'Boeing 737', manufacturer: 'Boeing', totalSeats: 160 },
  { aircraftId: 4, model: 'Airbus A321', manufacturer: 'Airbus', totalSeats: 220 },
];

const token = () => localStorage.getItem('accessToken') ?? '';
const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

export const AircraftManagement = () => {
  const [items, setItems] = useState<Aircraft[]>(MOCK);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editItem, setEditItem] = useState<Aircraft | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/aircrafts', { headers: authH() });
      const j = await r.json();
      if (j.success && j.data) setItems(j.data);
    } catch { /* mock */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setModal('create'); };
  const openEdit = (a: Aircraft) => { setForm({ model: a.model, manufacturer: a.manufacturer, totalSeats: a.totalSeats }); setEditItem(a); setModal('edit'); };

  const save = async () => {
    if (!form.model || !form.manufacturer) { showToast('Vui lòng điền đầy đủ thông tin', 'error'); return; }
    setSaving(true);
    try {
      const url = modal === 'edit' ? `/api/aircrafts/${editItem!.aircraftId}` : '/api/aircrafts';
      const r = await fetch(url, { method: modal === 'edit' ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify(form) });
      const j = await r.json();
      if (j.success) { showToast('Thành công', 'success'); setModal(null); fetchAll(); }
      else showToast(j.message ?? 'Lỗi', 'error');
    } catch {
      if (modal === 'edit') setItems(p => p.map(a => a.aircraftId === editItem!.aircraftId ? { ...editItem!, ...form } : a));
      else setItems(p => [...p, { ...form, aircraftId: Date.now() }]);
      showToast('Thành công', 'success'); setModal(null);
    }
    setSaving(false);
  };

  const del = async (id: number) => {
    if (!confirm('Xóa máy bay này?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/aircrafts/${id}`, { method: 'DELETE', headers: authH() });
    } catch { /* ignore */ }
    setItems(p => p.filter(a => a.aircraftId !== id));
    showToast('Xóa thành công', 'success');
    setDeleting(null);
  };

  const filtered = items.filter(a =>
    a.model.toLowerCase().includes(search.toLowerCase()) ||
    a.manufacturer.toLowerCase().includes(search.toLowerCase())
  );

  const manufacturers = [...new Set(items.map(a => a.manufacturer))];

  return (
    <AdminLayout>
      <div className="space-y-5">
        {toast && <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-xl text-white text-sm font-bold shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.msg}</div>}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Aircraft Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">{items.length} máy bay — {manufacturers.length} hãng sản xuất</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-red hover:bg-red/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Thêm máy bay
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {manufacturers.map(m => {
            const count = items.filter(a => a.manufacturer === m).length;
            const total = items.filter(a => a.manufacturer === m).reduce((s, a) => s + a.totalSeats, 0);
            return (
              <div key={m} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mb-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-lg font-black text-gray-900">{count}</p>
                <p className="text-xs font-bold text-gray-500">{m}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{total.toLocaleString()} ghế tổng</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo model, hãng sản xuất..."
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
                    {['Model', 'Hãng sản xuất', 'Tổng ghế', 'Hành động'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={4} className="text-center py-12 text-gray-400">Không có dữ liệu</td></tr>
                    : filtered.map(a => (
                      <tr key={a.aircraftId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                              <Cpu className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="font-bold text-gray-800">{a.model}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{a.manufacturer}</td>
                        <td className="px-4 py-3">
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{a.totalSeats} ghế</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(a)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100">
                              <Pencil className="w-3 h-3" /> Sửa
                            </button>
                            <button onClick={() => del(a.aircraftId)} disabled={deleting === a.aircraftId}
                              className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-100 disabled:opacity-50">
                              {deleting === a.aircraftId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Xóa
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
                <h3 className="font-bold text-gray-900">{modal === 'edit' ? 'Cập nhật máy bay' : 'Thêm máy bay mới'}</h3>
                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Model *', field: 'model' as keyof Form, placeholder: 'VD: Boeing 787' },
                  { label: 'Hãng sản xuất *', field: 'manufacturer' as keyof Form, placeholder: 'VD: Boeing' },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
                    <input value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Tổng số ghế</label>
                  <input type="number" value={form.totalSeats} onChange={e => setForm(p => ({ ...p, totalSeats: Number(e.target.value) }))}
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
