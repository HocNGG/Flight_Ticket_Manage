import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, TrendingUp, Calendar, Percent, DollarSign } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

// GET/POST/PUT/DELETE /api/dynamic-prices
// GET /api/dynamic-prices/active?startDate=...&endDate=...
// GET /api/seat-classes

type SeatClass = { seatClassId: number; className: string; basePrice: number };
type DynamicPrice = {
  priceId: number;
  seatClassId: number;
  seatClassName: string;
  adjustmentType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  adjustmentValue: number;
  startDate: string;
  endDate: string;
};
type Form = Omit<DynamicPrice, 'priceId' | 'seatClassName'>;

const EMPTY: Form = { seatClassId: 1, adjustmentType: 'PERCENTAGE', adjustmentValue: 10, startDate: '', endDate: '' };

const MOCK_CLASSES: SeatClass[] = [
  { seatClassId: 1, className: 'ECONOMY', basePrice: 2500000 },
  { seatClassId: 2, className: 'BUSINESS', basePrice: 5000000 },
  { seatClassId: 3, className: 'FIRST', basePrice: 10000000 },
];
const MOCK_PRICES: DynamicPrice[] = [
  { priceId: 1, seatClassId: 1, seatClassName: 'ECONOMY', adjustmentType: 'PERCENTAGE', adjustmentValue: 10, startDate: '2024-06-01T00:00:00', endDate: '2024-06-30T23:59:59' },
  { priceId: 2, seatClassId: 2, seatClassName: 'BUSINESS', adjustmentType: 'FIXED_AMOUNT', adjustmentValue: 500000, startDate: '2024-07-01T00:00:00', endDate: '2024-07-15T23:59:59' },
  { priceId: 3, seatClassId: 1, seatClassName: 'ECONOMY', adjustmentType: 'PERCENTAGE', adjustmentValue: -15, startDate: '2024-05-20T00:00:00', endDate: '2024-05-25T23:59:59' },
];

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '---';
const isActive = (s: string, e: string) => { const now = new Date(); return new Date(s) <= now && now <= new Date(e); };
const token = () => localStorage.getItem('accessToken') ?? '';
const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

export const PricingDashboard = () => {
  const [seatClasses, setSeatClasses] = useState<SeatClass[]>(MOCK_CLASSES);
  const [prices, setPrices] = useState<DynamicPrice[]>(MOCK_PRICES);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editItem, setEditItem] = useState<DynamicPrice | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAll = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/seat-classes', { headers: authH() }),
        fetch('/api/dynamic-prices', { headers: authH() }),
      ]);
      const [j1, j2] = await Promise.all([r1.json(), r2.json()]);
      if (j1.success && j1.data) setSeatClasses(j1.data);
      if (j2.success && j2.data) setPrices(j2.data);
    } catch { /* mock */ }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setModal('create'); };
  const openEdit = (p: DynamicPrice) => {
    setForm({ seatClassId: p.seatClassId, adjustmentType: p.adjustmentType, adjustmentValue: p.adjustmentValue, startDate: p.startDate.slice(0, 16), endDate: p.endDate.slice(0, 16) });
    setEditItem(p); setModal('edit');
  };

  const save = async () => {
    if (!form.startDate || !form.endDate) { showToast('Vui lòng chọn thời gian', 'error'); return; }
    setSaving(true);
    try {
      const url = modal === 'edit' ? `/api/dynamic-prices/${editItem!.priceId}` : '/api/dynamic-prices';
      const r = await fetch(url, { method: modal === 'edit' ? 'PUT' : 'POST', headers: authH(), body: JSON.stringify(form) });
      const j = await r.json();
      if (j.success) { showToast('Thành công', 'success'); setModal(null); fetchAll(); }
      else showToast(j.message ?? 'Lỗi', 'error');
    } catch {
      const cls = seatClasses.find(c => c.seatClassId === Number(form.seatClassId));
      const newP: DynamicPrice = { priceId: Date.now(), seatClassName: cls?.className ?? '', ...form, seatClassId: Number(form.seatClassId) };
      if (modal === 'edit') setPrices(p => p.map(x => x.priceId === editItem!.priceId ? newP : x));
      else setPrices(p => [...p, newP]);
      showToast('Thành công', 'success'); setModal(null);
    }
    setSaving(false);
  };

  const del = async (id: number) => {
    if (!confirm('Xóa quy tắc giá này?')) return;
    setDeleting(id);
    try { await fetch(`/api/dynamic-prices/${id}`, { method: 'DELETE', headers: authH() }); } catch { /* ignore */ }
    setPrices(p => p.filter(x => x.priceId !== id));
    showToast('Xóa thành công', 'success');
    setDeleting(null);
  };

  const activeCount = prices.filter(p => isActive(p.startDate, p.endDate)).length;

  return (
    <AdminLayout>
      <div className="space-y-5">
        {toast && <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-xl text-white text-sm font-bold shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.msg}</div>}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pricing Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Giá cơ bản & quy tắc điều chỉnh giá động</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-red hover:bg-red/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Thêm quy tắc giá
          </button>
        </div>

        {/* Base price cards */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Giá cơ bản theo hạng ghế</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {seatClasses.map(c => {
              const activeRules = prices.filter(p => p.seatClassId === c.seatClassId && isActive(p.startDate, p.endDate));
              const totalAdj = activeRules.reduce((sum, r) => {
                if (r.adjustmentType === 'PERCENTAGE') return sum + (c.basePrice * r.adjustmentValue / 100);
                return sum + r.adjustmentValue;
              }, 0);
              const effectivePrice = c.basePrice + totalAdj;
              const colors: Record<string, string> = { ECONOMY: 'bg-green-50 text-green-600', BUSINESS: 'bg-blue-50 text-blue-600', FIRST: 'bg-purple-50 text-purple-600' };
              return (
                <div key={c.seatClassId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[c.className] ?? 'bg-gray-100 text-gray-600'}`}>
                    <Armchair className="w-5 h-5" />
                  </div>
                  <p className="font-black text-gray-900">{c.className}</p>
                  <p className="text-2xl font-black text-red mt-1">{formatPrice(effectivePrice)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Cơ bản: {formatPrice(c.basePrice)}</p>
                  {totalAdj !== 0 && (
                    <p className={`text-xs font-bold mt-1 ${totalAdj > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalAdj > 0 ? '+' : ''}{formatPrice(totalAdj)} (đang áp dụng)
                    </p>
                  )}
                  {activeRules.length > 0 && (
                    <span className="inline-block mt-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {activeRules.length} quy tắc đang hoạt động
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Tổng quy tắc', value: prices.length, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
            { label: 'Đang hoạt động', value: activeCount, icon: Calendar, color: 'bg-green-50 text-green-600' },
            { label: 'Hết hạn', value: prices.length - activeCount, icon: Calendar, color: 'bg-gray-100 text-gray-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rules table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">Quy tắc giá động</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Hạng ghế', 'Loại điều chỉnh', 'Giá trị', 'Thời gian áp dụng', 'Trạng thái', 'Hành động'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prices.length === 0
                  ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chưa có quy tắc giá nào</td></tr>
                  : prices.map(p => {
                    const active = isActive(p.startDate, p.endDate);
                    return (
                      <tr key={p.priceId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-bold text-gray-800 text-xs">{p.seatClassName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {p.adjustmentType === 'PERCENTAGE'
                              ? <Percent className="w-3.5 h-3.5 text-blue-500" />
                              : <DollarSign className="w-3.5 h-3.5 text-green-500" />
                            }
                            <span className="text-xs text-gray-600">{p.adjustmentType === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-black text-sm ${p.adjustmentValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {p.adjustmentValue >= 0 ? '+' : ''}{p.adjustmentType === 'PERCENTAGE' ? `${p.adjustmentValue}%` : formatPrice(p.adjustmentValue)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(p.startDate)} → {formatDate(p.endDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {active ? '● Đang hoạt động' : '○ Hết hạn'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(p)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                              <Pencil className="w-3 h-3" /> Sửa
                            </button>
                            <button onClick={() => del(p.priceId)} disabled={deleting === p.priceId}
                              className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50">
                              {deleting === p.priceId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">{modal === 'edit' ? 'Cập nhật quy tắc giá' : 'Thêm quy tắc giá mới'}</h3>
                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Hạng ghế *</label>
                  <select value={form.seatClassId} onChange={e => setForm(p => ({ ...p, seatClassId: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30">
                    {seatClasses.map(c => <option key={c.seatClassId} value={c.seatClassId}>{c.className}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Loại điều chỉnh *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['PERCENTAGE', 'FIXED_AMOUNT'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setForm(p => ({ ...p, adjustmentType: t }))}
                        className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${form.adjustmentType === t ? 'border-red bg-red/5 text-red' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                        {t === 'PERCENTAGE' ? '% Phần trăm' : '₫ Số tiền'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Giá trị {form.adjustmentType === 'PERCENTAGE' ? '(%, âm = giảm giá)' : '(VND, âm = giảm giá)'}
                  </label>
                  <input type="number" value={form.adjustmentValue} onChange={e => setForm(p => ({ ...p, adjustmentValue: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Ngày bắt đầu *', field: 'startDate' as keyof Form },
                    { label: 'Ngày kết thúc *', field: 'endDate' as keyof Form },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
                      <input type="datetime-local" value={form[field] as string} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" />
                    </div>
                  ))}
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

// Needed for base price card
const Armchair = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" /><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" /><path d="M5 18v2" /><path d="M19 18v2" />
  </svg>
);
