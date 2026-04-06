import { Plane, BarChart3, Building2, DollarSign, Layers, LogOut, Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const navigation = [
  { label: 'Airline Management', icon: Building2, active: true },
  { label: 'Flight Management', icon: Plane },
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
                    className={`w-full flex items-center gap-3 rounded-3xl px-4 py-3 text-left transition ${
                      item.active ? 'bg-red/10 text-red font-semibold' : 'text-gray-600 hover:bg-gray-100'
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

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Baggage Policy</label>
                    <textarea rows={4} placeholder="Define weight limits and excess fees..." className="w-full rounded-[1.25rem] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Refund Policy</label>
                    <textarea rows={4} placeholder="Cancellation windows and penalty rates..." className="w-full rounded-[1.25rem] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10" />
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
                              {item.policies.map((policy) => (
                                <span key={policy} className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                                  {policy}
                                </span>
                              ))}
                            </td>
                            <td className="py-4 flex items-center gap-2">
                              <button type="button" className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50">
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
    </div>
  );
};
