import { useState } from 'react';
import { Plane, BarChart3, Building2, DollarSign, Layers, LogOut, Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { policies } from '../../../data/flightPolicies';
const navigation = [
  { label: 'Airline Management', icon: Building2, active: true, path: '/admin/airlines' },
  { label: 'Flight Management', icon: Plane, path: '/admin/flights' },
  { label: 'Seat Class Management', icon: Layers },
  { label: 'Pricing Management', icon: DollarSign },
  { label: 'Reports', icon: BarChart3 },
];

const airlines = [
  {
    id: 'ATR-4982',
    name: 'Skyward Premium',
    country: 'United Kingdom',
    policies: ['FLEX', '30KG'],
  },
  {
    id: 'AIR-8811',
    name: 'Desert Wings',
    country: 'United Arab Emirates',
    policies: ['ELITE', '40KG'],
  },
  {
    id: 'AIR-1029',
    name: 'Nordic Horizon',
    country: 'Norway',
    policies: ['STANDARD'],
  },
];

export const AirlineManagement = () => {
  const navigate = useNavigate();
  const [policyType, setPolicyType] = useState<'baggage' | 'refund' | ''>('');
  const [policyTitle, setPolicyTitle] = useState('');
  const [policyDescription, setPolicyDescription] = useState('');
  const [policiesState, setPoliciesState] = useState<Array<{ type: 'baggage' | 'refund'; title: string; description: string }>>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditingAirline, setCurrentEditingAirline] = useState<any>(null);

  const addPolicy = () => {
    if (!policyType || !policyTitle.trim() || !policyDescription.trim()) return;

    setPoliciesState((prev) => [
      ...prev,
      {
        type: policyType as 'baggage' | 'refund',
        title: policyTitle.trim(),
        description: policyDescription.trim(),
      },
    ]);

    setPolicyType('');
    setPolicyTitle('');
    setPolicyDescription('');
  };

  const removePolicy = (index: number) => {
    setPoliciesState((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 overflow-hidden">
            <div className="mb-10">
              <div className="text-sm font-semibold uppercase tracking-[0.28em] text-red mb-3">Editorial Aviation</div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900">Admin Console</h2>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => item.path && navigate(item.path)}
                    className={`w-full flex items-center gap-3 rounded-3xl px-4 py-3 text-left transition ${item.active ? 'bg-red/10 text-red font-semibold' : 'text-gray-600 hover:bg-gray-100'
                      }`}>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

            </nav>

            <div className="mt-10 pt-6 border-t border-gray-200">
              <button type="button" className="w-full flex items-center gap-3 text-gray-600 hover:text-red transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
              <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.27em] text-gray-400">Airline Management</p>
                    <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900">Manage the Skies</h1>
                    <p className="mt-3 text-sm text-gray-500 max-w-2xl">
                      Register new carriers, update existing policies, and oversee the global network of airline partners in real-time.
                    </p>
                  </div>

                  <button type="button" className="inline-flex items-center gap-2 rounded-full bg-red px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-reddark transition-colors">
                    <Plus className="w-4 h-4" />
                    Create New Airline
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] bg-[#FFFAF7] border border-[#F0E2D9] p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.27em] text-gray-500">Active Carriers</p>
                  <p className="mt-6 text-5xl font-black text-gray-900">124</p>
                </div>
                <p className="mt-6 text-sm font-medium text-gray-600">+5 new this month</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
              <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Airline Details</h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Airline Name</label>
                    <input type="text" placeholder="e.g. Skyline Airways" className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Origin Country</label>
                    <select className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10">
                      <option>Select Country</option>
                      <option>United Kingdom</option>
                      <option>United Arab Emirates</option>
                      <option>Norway</option>
                      <option>United States</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Logo</label>
                    <button type="button" className="w-full rounded-3xl border-dashed border border-gray-300 bg-gray-50 px-4 py-10 text-sm text-gray-500 hover:border-gray-400 transition">
                      <Upload className="mx-auto mb-3 h-5 w-5 text-gray-400" />
                      Drop SVG or PNG here
                    </button>
                  </div>

                  <div className="grid gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Policy Type</label>
                      <select
                        value={policyType}
                        onChange={(event) => setPolicyType(event.target.value as 'baggage' | 'refund' | '')}
                        className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10"
                      >
                        <option value="">Select policy type</option>
                        <option value="baggage">Baggage</option>
                        <option value="refund">Refund</option>
                      </select>
                    </div>

                    {policyType && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Policy Title</label>
                          <input
                            value={policyTitle}
                            onChange={(event) => setPolicyTitle(event.target.value)}
                            type="text"
                            placeholder="e.g. Checked Baggage"
                            className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          <textarea
                            value={policyDescription}
                            onChange={(event) => setPolicyDescription(event.target.value)}
                            rows={4}
                            placeholder="e.g. 2 pieces x 23kg each..."
                            className="w-full rounded-[1.25rem] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={addPolicy}
                          className="inline-flex items-center justify-center rounded-full bg-red px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-reddark transition-colors"
                        >
                          Add Policy
                        </button>
                      </>
                    )}

                    {policiesState.length > 0 && (
                      <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Added Policies</h3>
                        <div className="space-y-3">
                          {policiesState.map((policy, index) => (
                            <div key={`${policy.title}-${index}`} className="rounded-3xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{policy.title}</p>
                                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{policy.type}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removePolicy(index)}
                                  className="text-red text-sm font-semibold hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                              <p className="text-sm text-gray-600">{policy.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button type="button" className="inline-flex items-center justify-center rounded-full bg-red px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-reddark transition-colors">
                    Save Changes
                  </button>
                  <button type="button" className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    Reset
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Airline Directory</h2>
                      <p className="text-sm text-gray-500">A quick view of partner carriers and policy tiers.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50">
                        ⋮
                      </button>
                      <button type="button" className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50">
                        ⬇️
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-600">
                      <thead>
                        <tr>
                          <th className="pb-4 font-semibold text-gray-500">ID</th>
                          <th className="pb-4 font-semibold text-gray-500">Airline</th>
                          <th className="pb-4 font-semibold text-gray-500">Country</th>
                          <th className="pb-4 font-semibold text-gray-500">Policies</th>
                          <th className="pb-4 font-semibold text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {airlines.map((item) => (
                          <tr key={item.id} className="odd:bg-white even:bg-surface">
                            <td className="py-4 font-semibold text-gray-900">{item.id}</td>
                            <td className="py-4 text-gray-900">{item.name}</td>
                            <td className="py-4 text-gray-600">{item.country}</td>
                            <td className="py-4 space-x-2">
                              {item.policies.length}
                            </td>
                            <td className="py-4 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentEditingAirline(item);
                                  setIsEditModalOpen(true);
                                }}
                                className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button type="button" className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 text-right">
                    <Link to="#" className="text-red text-sm font-semibold hover:underline">View Full Directory →</Link>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#F4D7BC] via-[#F1B07D] to-[#DE7A4E] p-8 text-white shadow-sm">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1526676032969-09f0a197bd17?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                  <div className="relative z-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.27em] text-white/80">Expanded Networks</p>
                    <h3 className="mt-4 text-3xl font-black">Editorial Aviation is adding 15 new partner airlines this quarter to streamline European transit routes.</h3>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Edit Airline</h3>
                <p className="text-sm text-gray-500 mt-1">Editing details and policies for {currentEditingAirline?.name}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-3 hover:bg-gray-100 rounded-full text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-6">
              {/* Airline Details Section */}
              <div className="p-5 border border-gray-200 rounded-3xl bg-gray-50 flex gap-4 flex-col mb-8">
                <h4 className="text-lg font-bold text-gray-900">Airline Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ID</label>
                    <input
                      type="text"
                      defaultValue={currentEditingAirline?.id}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm bg-white text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      defaultValue={currentEditingAirline?.name}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm bg-white text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                    <select
                      defaultValue={currentEditingAirline?.country}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm bg-white text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10"
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Norway">Norway</option>
                      <option value="United States">United States</option>
                    </select>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-bold text-gray-900">Policies</h4>
              <div className="space-y-6">
                {policies.map((policy, idx) => (
                  <div key={idx} className="p-5 border border-gray-200 rounded-3xl bg-gray-50 flex gap-4 flex-col">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                        <input
                          type="text"
                          defaultValue={policy.type}
                          className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm uppercase bg-white text-gray-600 outline-none focus:border-red focus:ring-2 focus:ring-red/10"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          defaultValue={policy.title}
                          className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm bg-white text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        defaultValue={policy.description}
                        rows={2}
                        className="w-full rounded-[1.25rem] border border-gray-300 px-4 py-3 text-sm bg-white text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="button" className="px-6 py-3 rounded-full bg-red text-white font-semibold hover:bg-reddark transition shadow-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
