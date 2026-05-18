import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, Loader2, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

// GET/POST /api/policies | GET /api/policies/{id}/rules | POST /api/policies/{policyId}/rules

type PolicyRule = { ruleId: number; ruleName: string; description: string; refundPercentage: number; daysBefore: number };
type Policy = { policyId: number; policyName: string; description: string; rules?: PolicyRule[] };

const MOCK: Policy[] = [
  {
    policyId: 1, policyName: 'Refund Policy', description: 'Chính sách hoàn tiền vé máy bay',
    rules: [
      { ruleId: 1, ruleName: 'Full Refund', description: 'Hoàn tiền 100%', refundPercentage: 100, daysBefore: 24 },
      { ruleId: 2, ruleName: 'Partial Refund', description: 'Hoàn tiền 50%', refundPercentage: 50, daysBefore: 12 },
    ],
  },
  { policyId: 2, policyName: 'Baggage Policy', description: 'Chính sách hành lý', rules: [] },
  { policyId: 3, policyName: 'Change Policy', description: 'Chính sách đổi vé', rules: [] },
];

const token = () => localStorage.getItem('accessToken') ?? '';
const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

export const PolicyManagement = () => {
  const [policies, setPolicies] = useState<Policy[]>(MOCK);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<'policy' | 'rule' | null>(null);
  const [targetPolicyId, setTargetPolicyId] = useState<number | null>(null);
  const [policyForm, setPolicyForm] = useState({ policyName: '', description: '', content: '' });
  const [ruleForm, setRuleForm] = useState({ ruleName: '', description: '', refundPercentage: 100, daysBefore: 24 });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAll = useCallback(async () => {
    try {
      const r = await fetch('/api/policies', { headers: authH() });
      const j = await r.json();
      if (j.success && j.data) setPolicies(j.data);
    } catch { /* mock */ }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const loadRules = async (policyId: number) => {
    if (expanded.has(policyId)) {
      setExpanded(prev => { const next = new Set(prev); next.delete(policyId); return next; });
      return;
    }
    try {
      const r = await fetch(`/api/policies/${policyId}/rules`, { headers: authH() });
      const j = await r.json();
      if (j.success && j.data) {
        setPolicies(prev => prev.map(p => p.policyId === policyId ? { ...p, rules: j.data } : p));
      }
    } catch { /* mock rules already set */ }
    setExpanded(prev => new Set(prev).add(policyId));
  };

  const savePolicy = async () => {
    if (!policyForm.policyName) { showToast('Điền tên chính sách', 'error'); return; }
    setSaving(true);
    try {
      const r = await fetch('/api/policies', { method: 'POST', headers: authH(), body: JSON.stringify(policyForm) });
      const j = await r.json();
      if (j.success) { showToast('Tạo chính sách thành công', 'success'); setModal(null); fetchAll(); }
      else showToast(j.message ?? 'Lỗi', 'error');
    } catch {
      setPolicies(p => [...p, { policyId: Date.now(), policyName: policyForm.policyName, description: policyForm.description, rules: [] }]);
      showToast('Tạo chính sách thành công', 'success'); setModal(null);
    }
    setSaving(false);
  };

  const saveRule = async () => {
    if (!ruleForm.ruleName || !targetPolicyId) { showToast('Điền đầy đủ thông tin', 'error'); return; }
    setSaving(true);
    try {
      const r = await fetch(`/api/policies/${targetPolicyId}/rules`, { method: 'POST', headers: authH(), body: JSON.stringify(ruleForm) });
      const j = await r.json();
      if (j.success) { showToast('Thêm quy tắc thành công', 'success'); setModal(null); loadRules(targetPolicyId); }
      else showToast(j.message ?? 'Lỗi', 'error');
    } catch {
      const newRule: PolicyRule = { ruleId: Date.now(), ...ruleForm };
      setPolicies(prev => prev.map(p => p.policyId === targetPolicyId
        ? { ...p, rules: [...(p.rules ?? []), newRule] } : p));
      showToast('Thêm quy tắc thành công', 'success'); setModal(null);
    }
    setSaving(false);
  };

  const delPolicy = async (id: number) => {
    if (!confirm('Xóa chính sách này?')) return;
    setPolicies(p => p.filter(x => x.policyId !== id));
    showToast('Đã xóa', 'success');
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
          <button onClick={() => { setPolicyForm({ policyName: '', description: '', content: '' }); setModal('policy'); }}
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
                  <p className="font-bold text-gray-900">{policy.policyName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{policy.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={e => { e.stopPropagation(); setTargetPolicyId(policy.policyId); setRuleForm({ ruleName: '', description: '', refundPercentage: 100, daysBefore: 24 }); setModal('rule'); }}
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
                  {(!policy.rules || policy.rules.length === 0) ? (
                    <p className="text-sm text-gray-400 text-center py-4">Chưa có quy tắc nào</p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quy tắc ({policy.rules.length})</p>
                      {policy.rules.map(rule => (
                        <div key={rule.ruleId} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{rule.ruleName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{rule.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4 space-y-1">
                            <p className="text-xs font-bold text-green-600">Hoàn {rule.refundPercentage}%</p>
                            <p className="text-[10px] text-gray-400">Trước {rule.daysBefore} giờ</p>
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
                  <input value={policyForm.policyName} onChange={e => setPolicyForm(p => ({ ...p, policyName: e.target.value }))}
                    placeholder="VD: Refund Policy"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Mô tả</label>
                  <input value={policyForm.description} onChange={e => setPolicyForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Nội dung</label>
                  <textarea value={policyForm.content} onChange={e => setPolicyForm(p => ({ ...p, content: e.target.value }))} rows={3}
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
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Tên quy tắc *</label>
                  <input value={ruleForm.ruleName} onChange={e => setRuleForm(p => ({ ...p, ruleName: e.target.value }))}
                    placeholder="VD: Full Refund"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Mô tả</label>
                  <input value={ruleForm.description} onChange={e => setRuleForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">% Hoàn tiền</label>
                    <input type="number" min={0} max={100} value={ruleForm.refundPercentage}
                      onChange={e => setRuleForm(p => ({ ...p, refundPercentage: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Số giờ trước</label>
                    <input type="number" min={0} value={ruleForm.daysBefore}
                      onChange={e => setRuleForm(p => ({ ...p, daysBefore: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red/30" /></div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                  <strong>Preview:</strong> Khách hàng hủy vé trước {ruleForm.daysBefore} giờ sẽ được hoàn {ruleForm.refundPercentage}% tiền vé.
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
                  <button onClick={saveRule} disabled={saving} className="flex-1 bg-red hover:bg-red/90 text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Thêm quy tắc
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
