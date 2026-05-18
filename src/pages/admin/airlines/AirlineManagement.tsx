import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Check } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type { Airline } from '../../../api/types';
import { airlineApi, type CreateAirline } from '../../../api/airlineApi';



type AirlineForm = CreateAirline;


// Mock data theo đúng API response structure
const mockAirlines: Airline[] = [
  { airlineId: 1, code: 'VN', name: 'Vietnam Airlines', country: 'Vietnam', establishedYear: 1990 },
  { airlineId: 2, code: 'VJ', name: 'VietJet Air', country: 'Vietnam', establishedYear: 2011 },
  { airlineId: 3, code: 'QH', name: 'Bamboo Airways', country: 'Vietnam', establishedYear: 2019 },
  { airlineId: 4, code: 'BL', name: 'Pacific Airlines', country: 'Vietnam', establishedYear: 1991 },
];

const defaultForm: AirlineForm = {
  code: '',
  name: '',
  country: '',
  establishedYear: 0,
};

export const AirlineManagement = () => {
  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] =useState<number | null>(null);

  const [airlines, setAirlines] = useState<Airline[]>(mockAirlines);
  const [search, setSearch] = useState('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<AirlineForm>(defaultForm);

  // Edit modal
  const [editAirline, setEditAirline] = useState<Airline | null>(null);
  const [editForm, setEditForm] = useState<AirlineForm>(defaultForm);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };
  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => {
      setErrorMsg('');
    }, 3000);
  };
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data } =await airlineApi.getAll();
      if (data.success &&data.data) {setAirlines(data.data);}
    } catch (err) {
      console.error(err);
      showError(
        'Không thể tải danh sách hãng bay'
      );
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {fetchAll();}, [fetchAll]);
  
  const filteredAirlines = airlines.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.country.toLowerCase().includes(search.toLowerCase()),
  );

  // POST /api/airlines
  const handleCreate = async () => {
    if (!createForm.code.trim() ||!createForm.name.trim()) {
      showError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setSaving(true);
    try {
      const { data } = await airlineApi.create({
          ...createForm,
          code : createForm.code.toUpperCase()
        });
      if (data.success) {
        showSuccess(
          `Hãng bay "${createForm.name}" đã được tạo thành công`
        );
        setShowCreateModal(false);
        setCreateForm(defaultForm);
        await fetchAll();
      } else {
        showError(data.message ||'Tạo hãng bay thất bại');
      }
    } catch (err: any) {
      showError(err?.response?.data?.message ||'Không thể kết nối server');
    } finally {
      setSaving(false);
    }
  };

  // PUT /api/airlines/{id}
  const handleEdit = async () => {
    if (!editAirline) return;
    setSaving(true);
    try {
      const { data } =await airlineApi.update(
          editAirline.airlineId,
          {
            ...editForm,
            code :editForm.code.toUpperCase()
          }
        );

      if (data.success) {
        showSuccess(
          `Đã cập nhật hãng bay "${editForm.name}"`
        );
        setEditAirline(null);
        await fetchAll();
      } else {
        showError(data.message ||'Cập nhật thất bại')
      }
    } catch (err: any) {
      showError(err?.response?.data?.message ||'Không thể kết nối server');
    } finally {
      setSaving(false);
    }
  };

  // DELETE /api/airlines/{id}
  const handleDelete = async () => {
    if (deleteId === null) return
    setDeleting(deleteId);
    try {
      const found =airlines.find((a) => a.airlineId === deleteId);
      const { data } = await airlineApi.remove(deleteId);
      if (data.success) {
        setAirlines((prev) => prev.filter((a) => a.airlineId !== deleteId));
        showSuccess(`Đã xóa hãng bay "${found?.name}"`);
        setDeleteId(null);
      } else {
        showError(data.message ||'Xóa thất bại');
      }
    } catch (err: any) {
      console.error(err);
      showError(err?.response?.data?.message ||'Không thể kết nối server');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Success Toast */}
        {successMsg && (
          <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-sm font-semibold animate-pulse">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Error Toast */}
        {errorMsg && (
          <div className="fixed top-6 right-6 z-50 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-sm font-semibold animate-pulse">
            <X className="w-4 h-4" /> {errorMsg}
          </div>
        )}

        {/* Header */}
        <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.27em] text-gray-400">Quản trị viên</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900">Quản lý Hãng Bay</h1>
              <p className="mt-2 text-sm text-gray-500 max-w-xl">
                Thêm, chỉnh sửa và xóa hãng hàng không. 
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setCreateForm(defaultForm); setShowCreateModal(true); }}
              className="inline-flex items-center gap-2 rounded-full bg-red px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-reddark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm hãng bay
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng hãng bay', value: airlines.length, color: 'border-red' },
            { label: 'Việt Nam', value: airlines.filter((a) => a.country === 'Vietnam').length, color: 'border-blue-400' },
            { label: 'Quốc tế', value: airlines.filter((a) => a.country !== 'Vietnam').length, color: 'border-gray-400' },
            { label: 'Mã hãng', value: '2-5 ký tự', color: 'border-gold' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl bg-white p-5 border-l-4 ${color} border border-gray-100 shadow-sm`}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
              <p className="mt-2 text-3xl font-black text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-gray-200">
          {/* Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Danh sách hãng bay</h2>
            <div className="relative max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, mã..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-600">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Mã</th>
                  <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Tên hãng bay</th>
                  <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Quốc gia</th>
                  <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Năm thành lập</th>
                  <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAirlines.map((airline) => (
                  <tr key={airline.airlineId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <span className="inline-block bg-red/10 text-red font-black text-sm px-3 py-1 rounded-full">
                        {airline.code}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-gray-900">{airline.name}</td>
                    <td className="py-4 text-gray-600">{airline.country}</td>
                    <td className="py-4 text-gray-600">{airline.establishedYear}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditAirline(airline);
                            setEditForm({
                              code: airline.code,
                              name: airline.name,
                              country: airline.country,
                              establishedYear: airline.establishedYear,
                            });
                          }}
                          className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(airline.airlineId)}
                          className="rounded-full border border-red/20 bg-red/5 p-2 text-red hover:bg-red/10 transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAirlines.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                      Không tìm thấy hãng bay nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <Modal
          title="Thêm hãng bay mới"
          subtitle={`API: POST /api/airlines`}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreate}
          confirmLabel="Tạo hãng bay"
        >
          <AirlineFormFields form={createForm} onChange={setCreateForm} />
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {editAirline && (
        <Modal
          title={`Chỉnh sửa: ${editAirline.name}`}
          subtitle={`API: PUT /api/airlines/${editAirline.airlineId}`}
          onClose={() => setEditAirline(null)}
          onConfirm={handleEdit}
          confirmLabel="Lưu thay đổi"
        >
          <AirlineFormFields form={editForm} onChange={setEditForm} />
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red" />
            </div>
            <h3 className="text-xl font-black text-gray-900 text-center mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Hành động này không thể hoàn tác. Hãng bay và dữ liệu liên quan sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-full hover:bg-gray-50 transition text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red text-white font-semibold py-3 rounded-full hover:bg-reddark transition text-sm"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

// ── Sub-components ──

const AirlineFormFields = ({
  form,
  onChange,
}: {
  form: AirlineForm;
  onChange: (f: AirlineForm) => void;
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* airlineCode — API field */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
          Mã hãng  <span className="text-red">*</span>
        </label>
        <input
          type="text"
          value={form.code}
          onChange={(e) => onChange({ ...form, code: e.target.value.toUpperCase() })}
          placeholder="VN, VJ, QH..."
          maxLength={3}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10 font-mono"
        />
      </div>

      {/* airlineName — API field */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
          Tên hãng bay  <span className="text-red">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="Vietnam Airlines"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10"
        />
      </div>

      {/* country — API field */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
          Quốc gia 
        </label>
        <input
          type="text"
          value={form.country}
          onChange={(e) => onChange({ ...form, country: e.target.value })}
          placeholder="Vietnam"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10"
        />
      </div>

      {/* foundedYear — API field */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
          Năm thành lập
        </label>
        <input
          type="number"
          value={form.establishedYear}
          onChange={(e) => onChange({ ...form, establishedYear: Number(e.target.value) })}
          min={1900}
          max={new Date().getFullYear()}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10"
        />
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
      <p className="text-xs text-blue-600 font-medium">
        <strong>API request body:</strong>{' '}
        <code className="font-mono">{`{airlineCode, airlineName, country, foundedYear}`}</code>
      </p>
    </div>
  </div>
);

const Modal = ({
  title,
  subtitle,
  onClose,
  onConfirm,
  confirmLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1 font-mono">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {children}

      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-full hover:bg-gray-50 transition text-sm"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-red text-white font-semibold py-3 rounded-full hover:bg-reddark transition text-sm shadow-sm"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);
