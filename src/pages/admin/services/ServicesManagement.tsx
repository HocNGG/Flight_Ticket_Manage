import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Wrench, Package, Wifi } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

// GET/POST/PUT/DELETE /api/services
// GET/POST/PUT/DELETE /api/baggages
// GET/POST/DELETE /api/amenities

type Service = { serviceId: number; serviceName: string; type: string; description: string; price: number };
type Baggage = { baggageId: number; baggageName: string; description: string; weight: number; price: number };
type Amenity = { amenityId: number; amenityName: string; description: string };

const MOCK_SERVICES: Service[] = [
  { serviceId: 1, serviceName: 'Bữa ăn tiêu chuẩn', type: 'FOOD', description: 'Bữa ăn trên chuyến bay', price: 200000 },
  { serviceId: 2, serviceName: 'Xe lăn', type: 'ASSISTANCE', description: 'Hỗ trợ xe lăn', price: 0 },
  { serviceId: 3, serviceName: 'Ghế ưu tiên', type: 'SEAT', description: 'Chọn ghế ưu tiên', price: 150000 },
];
const MOCK_BAGGAGES: Baggage[] = [
  { baggageId: 1, baggageName: '7kg Cabin', description: 'Hành lý xách tay 7kg', weight: 7, price: 0 },
  { baggageId: 2, baggageName: '20kg Check-in', description: 'Hành lý ký gửi 20kg', weight: 20, price: 300000 },
  { baggageId: 3, baggageName: '30kg Check-in', description: 'Hành lý ký gửi 30kg', weight: 30, price: 500000 },
];
const MOCK_AMENITIES: Amenity[] = [
  { amenityId: 1, amenityName: 'WiFi', description: 'Dịch vụ WiFi miễn phí' },
  { amenityId: 2, amenityName: 'Entertainment', description: 'Màn hình giải trí cá nhân' },
];

const formatPrice = (p: number) => p === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const token = () => localStorage.getItem('accessToken') ?? '';
const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

export const ServicesManagement = () => {
  const [tab, setTab] = useState<'services' | 'baggages' | 'amenities'>('services');
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [baggages, setBaggages] = useState<Baggage[]>(MOCK_BAGGAGES);
  const [amenities, setAmenities] = useState<Amenity[]>(MOCK_AMENITIES);
  const [modal, setModal] = useState<'service' | 'baggage' | 'amenity' | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [svcForm, setSvcForm] = useState({ serviceName: '', type: 'FOOD', description: '', price: 0 });
  const [bagForm, setBagForm] = useState({ baggageName: '', description: '', weight: 0, price: 0 });
  const [amForm, setAmForm] = useState({ amenityName: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAll = useCallback(async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch('/api/services', { headers: authH() }),
        fetch('/api/baggages', { headers: authH() }),
        fetch('/api/amenities', { headers: authH() }),
      ]);
      const [j1, j2, j3] = await Promise.all([r1.json(), r2.json(), r3.json()]);
      if (j1.success && j1.data) setServices(j1.data);
      if (j2.success && j2.data) setBaggages(j2.data);
      if (j3.success && j3.data) setAmenities(j3.data);
    } catch { /* mock */ }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveService = async () => {
    setSaving(true);
    try {
      const url = editId ? `/api/services/${editId}` : '/api/services';
      const r = await fetch(url, { method: editId ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify(svcForm) });
      const j = await r.json();
      if (j.success) { showToast('Thành công', 'success'); setModal(null); fetchAll(); }
      else showToast(j.message ?? 'Lỗi', 'error');
    } catch {
      if (editId) setServices(p => p.map(s => s.serviceId === editId ? { ...s, ...svcForm } : s));
      else setServices(p => [...p, { ...svcForm, serviceId: Date.now() }]);
      showToast('Thành công', 'success'); setModal(null);
    }
    setSaving(false);
  };

  const saveBaggage = async () => {
    setSaving(true);
    try {
      const url = editId ? `/api/baggages/${editId}` : '/api/baggages';
      const r = await fetch(url, { method: editId ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify(bagForm) });
      const j = await r.json();
      if (j.success) { showToast('Thành công', 'success'); setModal(null); fetchAll(); }
      else showToast(j.message ?? 'Lỗi', 'error');
    } catch {
      if (editId) setBaggages(p => p.map(b => b.baggageId === editId ? { ...b, ...bagForm } : b));
      else setBaggages(p => [...p, { ...bagForm, baggageId: Date.now() }]);
      showToast('Thành công', 'success'); setModal(null);
    }
    setSaving(false);
  };

  const saveAmenity = async () => {
    setSaving(true);
    try {
      const r = await fetch('/api/amenities', { method: 'POST', headers: authH(), body: JSON.stringify(amForm) });
      const j = await r.json();
      if (j.success) { showToast('Thành công', 'success'); setModal(null); fetchAll(); }
      else showToast(j.message ?? 'Lỗi', 'error');
    } catch {
      setAmenities(p => [...p, { ...amForm, amenityId: Date.now() }]);
      showToast('Thành công', 'success'); setModal(null);
    }
    setSaving(false);
  };

  const delService = async (id: number) => {
    if (!confirm('Xóa dịch vụ?')) return;
    try { await fetch(`/api/services/${id}`, { method: 'DELETE', headers: authH() }); } catch { /* ignore */ }
    setServices(p => p.filter(s => s.serviceId !== id)); showToast('Đã xóa', 'success');
  };
  const delBaggage = async (id: number) => {
    if (!confirm('Xóa hành lý?')) return;
    try { await fetch(`/api/baggages/${id}`, { method: 'DELETE', headers: authH() }); } catch { /* ignore */ }
    setBaggages(p => p.filter(b => b.baggageId !== id)); showToast('Đã xóa', 'success');
  };
  const delAmenity = async (id: number) => {
    if (!confirm('Xóa tiện nghi?')) return;
    try { await fetch(`/api/amenities/${id}`, { method: 'DELETE', headers: authH() }); } catch { /* ignore */ }
    setAmenities(p => p.filter(a => a.amenityId !== id)); showToast('Đã xóa', 'success');
  };

  const SERVICE_TYPES = ['FOOD', 'ASSISTANCE', 'SEAT', 'LUGGAGE', 'OTHER'];

  return (
    <AdminLayout>
      <div className="space-y-5">
        {toast && <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-xl text-white text-sm font-bold shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.msg}</div>}

        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Services Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Dịch vụ, hành lý và tiện nghi chuyến bay</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
          {[
            { key: 'services' as const, label: 'Dịch vụ', count: services.length },
            { key: 'baggages' as const, label: 'Hành lý', count: baggages.length },
            { key: 'amenities' as const, label: 'Tiện nghi', count: amenities.length },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-red text-white' : 'bg-gray-200 text-gray-500'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── Services Tab ── */}
        {tab === 'services' && (
          <>
            <div className="flex justify-end">
              <button onClick={() => { setSvcForm({ serviceName: '', type: 'FOOD', description: '', price: 0 }); setEditId(null); setModal('service'); }}
                className="flex items-center gap-2 bg-red hover:bg-red/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> Thêm dịch vụ
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(s => (
                <div key={s.serviceId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{s.type}</span>
                  </div>
                  <p className="font-bold text-gray-900">{s.serviceName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                  <p className={`font-black text-lg mt-2 ${s.price === 0 ? 'text-green-600' : 'text-red'}`}>{formatPrice(s.price)}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setSvcForm({ serviceName: s.serviceName, type: s.type, description: s.description, price: s.price }); setEditId(s.serviceId); setModal('service'); }}
                      className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> Sửa
                    </button>
                    <button onClick={() => delService(s.serviceId)}
                      className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Baggages Tab ── */}
        {tab === 'baggages' && (
          <>
            <div className="flex justify-end">
              <button onClick={() => { setBagForm({ baggageName: '', description: '', weight: 0, price: 0 }); setEditId(null); setModal('baggage'); }}
                className="flex items-center gap-2 bg-red hover:bg-red/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> Thêm gói hành lý
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {baggages.map(b => (
                <div key={b.baggageId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="font-bold text-gray-900">{b.baggageName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{b.description}</p>
                  <p className="text-sm font-bold text-blue-600 mt-2">{b.weight} kg</p>
                  <p className={`font-black text-lg mt-1 ${b.price === 0 ? 'text-green-600' : 'text-red'}`}>{formatPrice(b.price)}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setBagForm({ baggageName: b.baggageName, description: b.description, weight: b.weight, price: b.price }); setEditId(b.baggageId); setModal('baggage'); }}
                      className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> Sửa
                    </button>
                    <button onClick={() => delBaggage(b.baggageId)}
                      className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Amenities Tab ── */}
        {tab === 'amenities' && (
          <>
            <div className="flex justify-end">
              <button onClick={() => { setAmForm({ amenityName: '', description: '' }); setModal('amenity'); }}
                className="flex items-center gap-2 bg-red hover:bg-red/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> Thêm tiện nghi
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {amenities.map(a => (
                <div key={a.amenityId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Wifi className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{a.amenityName}</p>
                      <p className="text-xs text-gray-500">{a.description}</p>
                    </div>
                  </div>
                  <button onClick={() => delAmenity(a.amenityId)}
                    className="text-[10px] font-bold text-red-600 bg-red-50 p-1.5 rounded-lg flex-shrink-0 ml-2">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Modals ── */}
        {modal === 'service' && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">{editId ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}</h3>
                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Tên dịch vụ *</label>
                  <input value={svcForm.serviceName} onChange={e => setSvcForm(p => ({ ...p, serviceName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Loại dịch vụ</label>
                  <select value={svcForm.type} onChange={e => setSvcForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30">
                    {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Mô tả</label>
                  <input value={svcForm.description} onChange={e => setSvcForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Giá (VND, 0 = miễn phí)</label>
                  <input type="number" value={svcForm.price} onChange={e => setSvcForm(p => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
                  <button onClick={saveService} disabled={saving} className="flex-1 bg-red hover:bg-red/90 text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editId ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {modal === 'baggage' && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">{editId ? 'Cập nhật hành lý' : 'Thêm gói hành lý'}</h3>
                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Tên gói *</label>
                  <input value={bagForm.baggageName} onChange={e => setBagForm(p => ({ ...p, baggageName: e.target.value }))}
                    placeholder="VD: 20kg Check-in"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Mô tả</label>
                  <input value={bagForm.description} onChange={e => setBagForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Cân nặng (kg)</label>
                    <input type="number" value={bagForm.weight} onChange={e => setBagForm(p => ({ ...p, weight: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Giá (VND)</label>
                    <input type="number" value={bagForm.price} onChange={e => setBagForm(p => ({ ...p, price: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
                  <button onClick={saveBaggage} disabled={saving} className="flex-1 bg-red hover:bg-red/90 text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editId ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {modal === 'amenity' && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Thêm tiện nghi</h3>
                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Tên tiện nghi *</label>
                  <input value={amForm.amenityName} onChange={e => setAmForm(p => ({ ...p, amenityName: e.target.value }))}
                    placeholder="VD: WiFi"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Mô tả</label>
                  <input value={amForm.description} onChange={e => setAmForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
                  <button onClick={saveAmenity} disabled={saving} className="flex-1 bg-red hover:bg-red/90 text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Thêm mới
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
