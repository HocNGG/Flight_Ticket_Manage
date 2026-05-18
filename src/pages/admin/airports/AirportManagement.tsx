import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X, Loader2, MapPin } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { airportApi } from '../../../api/airportApi';
import type { Airport } from '../../../api/types';

type FieldProps = {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}
const Field = ({ label,value,placeholder,onChange}: FieldProps) => {
    return (
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
        <input
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30"
        />
      </div>
    )
  }
type Form = Omit<Airport, 'airportId'>;
const EMPTY: Form = { airportCode: '', airportName: '', city: '', country: 'Vietnam' };

const MOCK: Airport[] = [
  { airportId: 1, airportCode: 'SGN', airportName: 'Sân bay Tân Sơn Nhất', city: 'Hồ Chí Minh', country: 'Vietnam' },
  { airportId: 2, airportCode: 'HAN', airportName: 'Sân bay Nội Bài', city: 'Hà Nội', country: 'Vietnam' },
  { airportId: 3, airportCode: 'DAD', airportName: 'Sân bay Đà Nẵng', city: 'Đà Nẵng', country: 'Vietnam' },
  { airportId: 4, airportCode: 'CXR', airportName: 'Sân bay Cam Ranh', city: 'Khánh Hòa', country: 'Vietnam' },
];


export const AirportManagement = () => {
  const [airports, setAirports] = useState<Airport[]>(MOCK);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editItem, setEditItem] = useState<Airport | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await airportApi.getAll();

      if (data.success && data.data) {
        setAirports(data.data);
      }

    } catch (err) {
      console.error(err);

      showToast(
        'Không thể tải danh sách sân bay',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setModal('create'); };
  const openEdit = (a: Airport) => { setForm({ airportCode: a.airportCode, airportName: a.airportName, city: a.city, country: a.country }); setEditItem(a); setModal('edit'); };

  const save = async () => {
    if (!form.airportCode || !form.airportName || !form.city) { showToast('Vui lòng điền đầy đủ thông tin', 'error'); return; }
    setSaving(true);
    try {
      let response;
      if (modal === 'edit') {
        response = await airportApi.update(
          editItem!.airportId,
          form
        );
      } else {
        response = await airportApi.create(form);
      }

      const { data } = response;

      if (data.success) {
        showToast(
          modal === 'edit'
            ? 'Cập nhật thành công'
            : 'Tạo thành công',
          'success'
        );

        setModal(null);

        await fetchAll();

      } else {
        showToast(
          data.message ?? 'Có lỗi xảy ra',
          'error'
        );
      }

    } catch (err: any) {
      console.error(err);

      showToast(
        err?.response?.data?.message ||
        'Không thể kết nối server',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa sân bay này?')) return;
    setDeleting(id);
    try {
      const { data } = await airportApi.remove(id);

      if (data.success) {
        setAirports(prev =>
          prev.filter(a => a.airportId !== id)
        );

        showToast(
          'Xóa thành công',
          'success'
        );

      } else {
        showToast(
          data.message ?? 'Xóa thất bại',
          'error'
        );
      }

    } catch (err: any) {
      console.error(err);

      showToast(
        err?.response?.data?.message ||
        'Không thể kết nối server',
        'error'
      );
    } finally {
      setDeleting(null);
    }
  };

  const filtered = airports.filter(a =>
    a.airportCode.toLowerCase().includes(search.toLowerCase()) ||
    a.airportName.toLowerCase().includes(search.toLowerCase()) ||
    a.city.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <AdminLayout>
      <div className="space-y-5">
        {toast && <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-xl text-white text-sm font-bold shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.msg}</div>}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Airport Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý danh sách sân bay — {airports.length} sân bay</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-red hover:bg-red/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Thêm sân bay
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo mã, tên, thành phố..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red/30" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mr-2" />Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Mã', 'Tên sân bay', 'Thành phố', 'Quốc gia', 'Hành động'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">Không có dữ liệu</td></tr>
                    : filtered.map(a => (
                      <tr key={a.airportId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center"><MapPin className="w-3.5 h-3.5 text-cyan-600" /></div>
                            <span className="font-black text-gray-800 text-xs tracking-wider">{a.airportCode}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{a.airportName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{a.city}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{a.country}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(a)} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                              <Pencil className="w-3 h-3" /> Sửa
                            </button>
                            <button onClick={() => del(a.airportId)} disabled={deleting === a.airportId}
                              className="text-[10px] font-bold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50">
                              {deleting === a.airportId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>

          {modal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">{modal === 'edit' ? 'Cập nhật sân bay' : 'Thêm sân bay mới'}</h3>
                  <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <Field
                    label="Mã sân bay *"
                    value={form.airportCode}
                    onChange={(value) =>
                      setForm((p) => ({
                        ...p,
                        airportCode: value
                      }))
                    }
                    placeholder="VD: SGN"
                  />
                  <Field
                    label="Tên sân bay *"
                    value={form.airportName}
                    onChange={(value) =>
                      setForm((p) => ({
                        ...p,
                        airportName: value
                      }))
                    }
                    placeholder="VD: Sân bay Tân Sơn Nhất"
                  />
                  <Field
                    label="Thành phố *"
                    value={form.city}
                    onChange={(value) =>
                      setForm((p) => ({
                        ...p,
                        city: value
                      }))
                    }
                    placeholder="VD: Hồ Chí Minh"
                  />
                  <Field
                    label="Quốc gia"
                    value={form.country}
                    onChange={(value) =>
                      setForm((p) => ({
                        ...p,
                        country: value
                      }))
                    }
                    placeholder="VD: Vietnam"
                  />
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Hủy</button>
                    <button onClick={save} disabled={saving} className="flex-1 bg-red hover:bg-red/90 text-white rounded-xl py-2.5 text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
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
