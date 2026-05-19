import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Wrench, Package, Wifi } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type { Baggage, CreateBaggagePayload, CreateServicePayload, Service } from '../../../api/types';
import { serviceApi } from '../../../api/serviceApi';
import { baggageApi } from '../../../api/baggageApi';

// GET/POST/PUT/DELETE /api/services
// GET/POST/PUT/DELETE /api/baggages
// GET/POST/DELETE /api/amenities

type Amenity = { amenityId: number; amenityName: string; description: string };
const formatPrice = (p: number) => p === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);


export const ServicesManagement = () => {
  const [tab, setTab] = useState<'services' | 'baggages' | 'amenities'>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [baggages, setBaggages] = useState<Baggage[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [modal, setModal] = useState<'service' | 'baggage' | 'amenity' | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [svcForm, setSvcForm] = useState<CreateServicePayload>({serviceName: '',type: 'FOOD',description: '',price: 0,});
  const [bagForm, setBagForm] =useState<CreateBaggagePayload>({baggageType: '',description: '',weightLimit: 0,price: 0,});
  const [amForm, setAmForm] = useState({ amenityName: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAll = useCallback(async () => {
    try {
      const [serviceRes, baggageRes] =await Promise.all([serviceApi.getAll(),baggageApi.getAll()]);

      if (serviceRes.data.success) {
        setServices(serviceRes.data.data);
      }

      if (baggageRes.data.success) {
        setBaggages(baggageRes.data.data);
      }

    } catch (err) {
      console.error(err);
      showToast('Không thể tải dữ liệu ', 'error');
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveService = async () => {
    if (!svcForm.serviceName.trim()) { showToast('Tên dịch vụ không được để trống', 'error'); return;}
    setSaving(true);
    try {
      let response;
      if (editId) {
        response = await serviceApi.update(editId, svcForm);
      } else {
        response = await serviceApi.create(svcForm);
      }
      const { data } = response;

      if (data.success) {
        showToast( editId? 'Cập nhật dịch vụ thành công': 'Tạo dịch vụ thành công','success');
        setModal(null);
        setSvcForm({serviceName: '',type: 'FOOD',description: '',price: 0,});
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

  const saveBaggage = async () => {
    if (!bagForm.baggageType.trim()) {showToast('Tên loại hành lý không được để trống','error');return;}
    setSaving(true);
    try {
      let response;
      if (editId) {
        response = await baggageApi.update(editId,bagForm);
      } else {
        response = await baggageApi.create(bagForm);
      }

      const { data } = response;

      if (data.success) {
        showToast(editId ? 'Cập nhật hành lý thành công': 'Tạo hành lý thành công','success');
        setModal(null);
        setBagForm({baggageType: '',description: '',weightLimit: 0,price: 0,});
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
    if (!confirm('Xóa dịch vụ này?')) {return;}
    try {
      const { data } = await serviceApi.remove(id);

      if (data.success) {setServices(prev =>prev.filter(s => s.serviceId !== id));
        showToast('Xóa dịch vụ thành công', 'success'); 
      } else {
        showToast(data.message || 'Xóa thất bại', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.message ||'Không thể kết nối server','error');
    }
  };
  const delBaggage = async (id: number) => {
    if (!confirm('Xóa hành lý này?')) {return;}
    try {
      const { data } =await baggageApi.remove(id);
      if (data.success) 
        {setBaggages(prev =>prev.filter(b => b.baggageOptionId !== id));
        showToast('Xóa hành lý thành công','success');
      } else {
        showToast(data.message || 'Xóa thất bại','error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.message ||'Không thể kết nối server','error');
    }
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
              <button onClick={() => { setBagForm({ baggageType: '', description: '', weight: 0, price: 0 }); setEditId(null); setModal('baggage'); }}
                className="flex items-center gap-2 bg-red hover:bg-red/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> Thêm gói hành lý
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {baggages.map(b => (
                <div key={b.baggageOptionId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="font-bold text-gray-900">{b.baggageType}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{b.description}</p>
                  <p className="text-sm font-bold text-blue-600 mt-2">{b.weightLimit} kg</p>
                  <p className={`font-black text-lg mt-1 ${b.price === 0 ? 'text-green-600' : 'text-red'}`}>{formatPrice(b.price)}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setBagForm({ baggageType: b.baggageType, description: b.description, weightLimit: b.weightLimit, price: b.price }); setEditId(b.baggageOptionId); setModal('baggage'); }}
                      className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> Sửa
                    </button>
                    <button onClick={() => delBaggage(b.baggageOptionId)}
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
                  <input value={bagForm.baggageType} onChange={e => setBagForm(p => ({ ...p, baggageType: e.target.value }))}
                    placeholder="VD: 20kg Check-in"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Mô tả</label>
                  <input value={bagForm.description} onChange={e => setBagForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Cân nặng (kg)</label>
                    <input type="number" value={bagForm.weightLimit} onChange={e => setBagForm(p => ({ ...p, weight: Number(e.target.value) }))}
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
