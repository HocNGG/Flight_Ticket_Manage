import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, Loader2, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import type { Policy, PolicyPayload, PolicyRule, PolicyRulePayload } from '../../../api/types';
import { policyApi } from '../../../api/policyApi';

// GET/POST /api/policies | GET /api/policies/{id}/rules | POST /api/policies/{policyId}/rules

type PolicyWithRules = Policy & {
  rules: PolicyRule[];
};
export const PolicyManagement = () => {
  const [policies, setPolicies] = useState<PolicyWithRules[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<'policy' | 'rule' | null>(null);
  const [targetPolicyId, setTargetPolicyId] = useState<number | null>(null);
  const [policyForm, setPolicyForm] = useState<PolicyPayload>({code: '',name: '',description: ''});
  const [ruleForm, setRuleForm] = useState<PolicyRulePayload>({policyId:0,hoursBeforeDeparture: 24,refundPercentage: 100,changeFee: 0,allowed: true});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAll = useCallback(async () => {
    try {
      const res = await policyApi.getAll();

      if (res.success && res.data) {setPolicies(res.data.map(policy => ({...policy,rules: []})));
      }
    } catch (error) {
      console.error(error);
      showToast('Không thể tải chính sách', 'error');
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const loadRules = async (policyId: number) => {
    if (expanded.has(policyId)) {
      setExpanded(prev => {const next = new Set(prev);next.delete(policyId);return next;});
      return;
    }
    try {
      const res = await policyApi.getRules(policyId);

      if (res.success && res.data) {
        setPolicies(prev =>prev.map(policy => policy.policyId === policyId
              ? 
              {
                ...policy,rules: res.data
              }
              : policy
          )
        );
      }
    } catch (error) {
      console.error(error);
      showToast('Không thể tải quy tắc', 'error');
    }

    setExpanded(prev => new Set(prev).add(policyId));
  };

  const savePolicy = async () => {
    if (!policyForm.name || !policyForm.code) {
      showToast('Điền đầy đủ thông tin', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await policyApi.create(policyForm);
      if (res.success) {
        showToast('Tạo chính sách thành công', 'success');
        setModal(null);
        fetchAll();
      }
    } catch (error) {
      console.error(error);
      showToast('Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveRule = async () => {
    if (!targetPolicyId) {
      showToast('Thiếu policy', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await policyApi.createRule(targetPolicyId,ruleForm);
      if (res.success) {
        showToast('Tạo quy tắc thành công', 'success');
        setModal(null);
        await loadRules(targetPolicyId);
      }
    } catch (error) {
      console.error(error);

      showToast('Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  const delPolicy = async (policyId: number) => {
    if (!confirm('Xóa chính sách này?')) return;
    try {
      await policyApi.delete(policyId);
      setPolicies(prev =>prev.filter(p => p.policyId !== policyId));
      showToast('Xóa thành công', 'success');
    } catch (error) {
      console.error(error);
      showToast('Xóa thất bại', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {toast && <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-xl text-white text-sm font-bold shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.msg}</div>}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Policy Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý chính sách và quy tắc hoàn tiền</p>
          </div>
          <button onClick={() => { setPolicyForm({ code: '', name: '', description: '' }); setModal('policy'); }}
            className="flex items-center gap-2 bg-red hover:bg-red/90 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Thêm chính sách
          </button>
        </div>

        {/* Policy list */}
        <div className="space-y-3">
          {policies.map(policy => (
            <div key={policy.policyId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Policy header */}
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => loadRules(policy.policyId)}>
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{policy.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{policy.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={e => { e.stopPropagation(); setTargetPolicyId(policy.policyId); setRuleForm({policyId:policy.policyId,hoursBeforeDeparture: 24,refundPercentage: 100,changeFee: 0,allowed: true});; setModal('rule'); }}
                    className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-green-100">
                    <Plus className="w-3 h-3" /> Thêm quy tắc
                  </button>
                  <button onClick={e => { e.stopPropagation(); delPolicy(policy.policyId); }}
                    className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-100">
                    <Trash2 className="w-3 h-3" /> Xóa
                  </button>
                  {expanded.has(policy.policyId)
                    ? <ChevronDown className="w-4 h-4 text-gray-400" />
                    : <ChevronRight className="w-4 h-4 text-gray-400" />
                  }
                </div>
              </div>

              {/* Rules (expanded) */}
              {expanded.has(policy.policyId) && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  {( policy.rules.length === 0) ? (
                    <p className="text-sm text-gray-400 text-center py-4">Chưa có quy tắc nào</p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quy tắc ({policy.rules.length})</p>
                      {policy.rules.map(rule => (
                        <div key={rule.policyRuleId}
                          className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-gray-800 text-sm">Hoàn {rule.refundPercentage}%</p>
                            <p className="text-xs text-gray-500 mt-0.5">Trước {rule.hoursBeforeDeparture} giờ</p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4 space-y-1">
                            <p className={`text-xs font-bold ${rule.allowed? 'text-green-600': 'text-red-600'}`}>
                              {rule.allowed ? 'Cho phép' : 'Không cho phép'}
                            </p>

                            <p className="text-[10px] text-gray-400">Phí đổi: {rule.changeFee.toLocaleString('vi-VN')}đ</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Policy Modal */}
        {modal === 'policy' && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Thêm chính sách mới</h3>
                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Tên chính sách *</label>
                  <input value={policyForm.name} onChange={e => setPolicyForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="VD: Refund Policy"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Code *</label>
                  <input
                    value={policyForm.code}
                    onChange={e =>setPolicyForm(p => ({...p,code: e.target.value}))}
                    placeholder="VD: REFUND_POLICY"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30"
                  />
                </div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Mô tả</label>
                  <textarea value={policyForm.description} onChange={e => setPolicyForm(p => ({ ...p, description: e.target.value }))} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30 resize-none" /></div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
                  <button onClick={savePolicy} disabled={saving} className="flex-1 bg-red hover:bg-red/90 text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Tạo chính sách
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rule Modal */}
        {modal === 'rule' && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Thêm quy tắc</h3>
                <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Số giờ trước chuyến bay</label>
                  <input type="number" min={0} value={ruleForm.hoursBeforeDeparture}onChange={e =>setRuleForm(p => ({...p,hoursBeforeDeparture: Number(e.target.value)}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold text-gray-600 mb-1"> % hoàn tiền</label>
                    <input type="number" min={0} max={100} value={ruleForm.refundPercentage}onChange={e =>setRuleForm(p => ({...p,refundPercentage: Number(e.target.value)}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30"/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Phí đổi vé</label>
                    <input type="number" min={0} value={ruleForm.changeFee}onChange={e =>setRuleForm(p => ({...p,changeFee: Number(e.target.value)}))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30"/>
                  </div>

                </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={ruleForm.allowed} onChange={e => setRuleForm(p => ({...p,allowed: e.target.checked}))}/>
                    <span className="text-sm text-gray-700">Cho phép áp dụng</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Hủy
                  </button>

                  <button
                    onClick={saveRule}
                    disabled={saving}
                    className="flex-1 bg-red hover:bg-red/90 text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}

                    Thêm quy tắc
                  </button>
                </div>
            </div>
          </div>
          )};
      </div>
    </AdminLayout>
  );
};
