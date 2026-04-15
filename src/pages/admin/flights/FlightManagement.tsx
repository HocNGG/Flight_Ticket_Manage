import { useState } from 'react';
import { Plane, BarChart3, Building2, DollarSign, Layers, LogOut, Plus, Search, Bell, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { enhanceList } from '../../../data/filghtEnhance';
import { amenities } from '../../../data/flightAmen';
const navigation = [
  { label: 'Airline Management', icon: Building2, path: '/admin/airlines' },
  { label: 'Flight Management', icon: Plane, active: true, path: '/admin/flights' },
  { label: 'Seat Class Management', icon: Layers },
  { label: 'Pricing Management', icon: DollarSign },
  { label: 'Reports', icon: BarChart3 },
];

const flights = [
  {
    id: 'EA-402',
    origin: 'London',
    originCode: 'LHR',
    dest: 'New York',
    destCode: 'JFK',
    departureTime: '08:30 AM',
    arrivalTime: '11:45 AM',
    scheduleType: 'Daily Schedule',
    capacity: 180,
    maxCapacity: 240,
    price: '$849.00',
    status: 'available',
    enhancements: ['wifi', 'utensils'],
    amenities: ['dining', 'wifi']
  },
  {
    id: 'EA-771',
    origin: 'Paris',
    originCode: 'CDG',
    dest: 'Tokyo',
    destCode: 'HND',
    departureTime: '11:15 PM',
    arrivalTime: '07:20 PM (+1)',
    scheduleType: 'Mon, Wed, Fri',
    capacity: 85,
    maxCapacity: 320,
    price: '$1,299.00',
    status: 'available',
    enhancements: ['utensils'],
    amenities: ['comfort']
  },
  {
    id: 'EA-109',
    origin: 'Dubai',
    originCode: 'DXB',
    dest: 'Singapore',
    destCode: 'SIN',
    departureTime: '03:45 AM',
    arrivalTime: '03:00 PM',
    scheduleType: 'Daily Schedule',
    capacity: 320,
    maxCapacity: 320,
    price: '$620.00',
    status: 'sold_out',
    enhancements: ['wifi', 'shield'],
    amenities: ['dining', 'comfort']
  }
];

export const FlightManagement = () => {
  const navigate = useNavigate();
  const [selectedFlight, setSelectedFlight] = useState(flights[0]);

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-8">
            <div>
              <div className="mb-10">
                <div className="text-sm font-semibold uppercase tracking-[0.28em] text-red mb-3">Editorial Aviation</div>
                <h2 className="text-xl font-black tracking-tight text-gray-900">Admin Console</h2>
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
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button type="button" className="w-full flex items-center gap-3 text-gray-600 hover:text-red transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </aside>

          <section className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <h1 className="text-3xl font-bold text-red">Flight Management</h1>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search flights..."
                    className="w-64 rounded-full border-none bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red/20"
                  />
                </div>
                <button className="text-gray-600 hover:text-gray-900"><Bell className="w-5 h-5" /></button>
                <button className="text-gray-600 hover:text-gray-900"><Settings className="w-5 h-5" /></button>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="User" />
                </div>
              </div>
            </div>

            {/* Title & Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-gray-900">Manage Fleet <span className="text-red">&</span> Routes</h2>
                <p className="mt-3 text-sm text-gray-500 max-w-lg">
                  Orchestrate your global flight network with precision. Real-time updates and seat inventory control.
                </p>
              </div>

              <button type="button" className="inline-flex items-center gap-2 rounded-full bg-red px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-reddark transition-colors">
                <Plus className="w-5 h-5" />
                Create Flight
              </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

              {/* Left Column (Table & Summaries) */}
              <div className="space-y-6">
                <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Flight Code</th>
                          <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Route</th>
                          <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Schedule</th>
                          <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Capacity</th>
                          <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Base Price</th>
                          <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Enhance</th>
                          <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Amenity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {flights.map((flight) => (
                          <tr
                            key={flight.id}
                            onClick={() => setSelectedFlight(flight)}
                            className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedFlight.id === flight.id ? 'bg-red/5' : ''}`}
                          >
                            <td className="py-5 font-bold text-red text-base">{flight.id}</td>
                            <td className="py-5">
                              <p className="font-semibold text-gray-900">{flight.origin}</p>
                              <p className="text-xs text-gray-500">({flight.originCode})</p>
                              <p className="text-xs text-gray-500 mt-0.5">{flight.dest} ({flight.destCode})</p>
                            </td>
                            <td className="py-5">
                              <p className="font-semibold text-gray-900">{flight.departureTime}</p>
                              <p className="text-xs text-gray-500">→ {flight.arrivalTime}</p>
                              <p className="text-xs text-gray-400 mt-1">{flight.scheduleType}</p>
                            </td>
                            <td className="py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${flight.status === 'sold_out' ? 'bg-red' : flight.capacity / flight.maxCapacity > 0.8 ? 'bg-[#997950]' : 'bg-red'}`}
                                    style={{ width: `${(flight.capacity / flight.maxCapacity) * 100}%` }}
                                  />
                                </div>
                                {flight.status === 'sold_out' ? (
                                  <span className="text-xs font-bold text-red">Sold Out</span>
                                ) : (
                                  <span className="text-xs font-medium text-gray-900">{flight.capacity}/{flight.maxCapacity}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-5 font-bold text-gray-900 text-base">{flight.price}</td>
                            <td className="py-5 font-bold text-gray-600 text-sm">{flight.enhancements.length}</td>
                            <td className="py-5 font-bold text-gray-600 text-sm">{flight.amenities.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="rounded-[1.5rem] bg-gray-50 p-6 border-l-4 border-red">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Flights</p>
                    <p className="mt-2 text-4xl font-black text-gray-900">142</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-gray-50 p-6 border-l-4 border-[#997950]">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Avg. Load Factor</p>
                    <p className="mt-2 text-4xl font-black text-gray-900">84%</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-gray-50 p-6 border-l-4 border-gray-600">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pending Updates</p>
                    <p className="mt-2 text-4xl font-black text-gray-900">12</p>
                  </div>
                </div>
              </div>

              {/* Right Column (Edit Sidebar) */}
              <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-gray-200 h-fit">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-red text-white flex items-center justify-center">
                    <Plane className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Update Flight<br />Details</h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Flight Code</label>
                    <input type="text" value={selectedFlight.id} readOnly className="w-full rounded-xl border-none bg-gray-50 px-4 py-3 text-sm text-gray-900 font-medium" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Departure</label>
                      <input type="text" value={`${selectedFlight.originCode} (${selectedFlight.origin})`} readOnly className="w-full rounded-xl border-none bg-gray-50 px-4 py-3 text-sm text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Destination</label>
                      <input type="text" value={`${selectedFlight.destCode} (${selectedFlight.dest})`} readOnly className="w-full rounded-xl border-none bg-gray-50 px-4 py-3 text-sm text-gray-900" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Dep. Time</label>
                      <input type="text" value={selectedFlight.departureTime} readOnly className="w-full rounded-xl border-none bg-gray-50 px-4 py-3 text-sm text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Arr. Time</label>
                      <input type="text" value={selectedFlight.arrivalTime} readOnly className="w-full rounded-xl border-none bg-gray-50 px-4 py-3 text-sm text-gray-900" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Seat Capacity</label>
                    <div className="relative">
                      <input type="text" value={selectedFlight.maxCapacity} readOnly className="w-full rounded-xl border-none bg-gray-50 px-4 py-3 text-sm text-gray-900" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">seats</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Base Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-900 font-bold">$</span>
                      <input type="text" value={selectedFlight.price.replace('$', '')} readOnly className="w-full rounded-xl border-none bg-gray-50 pl-8 pr-4 py-3 text-sm text-red font-bold" />
                    </div>
                  </div>



                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">Flight Enhancements</h4>
                    <div className="space-y-4">
                      {enhanceList.map((enhance, idx) => (
                        <div key={idx} className="p-4 border border-gray-200 rounded-2xl bg-gray-50 flex flex-col gap-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Type</label>
                              <input type="text" defaultValue={enhance.type} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase bg-white text-gray-600 outline-none focus:border-red focus:ring-2 focus:ring-red/10" disabled />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Price</label>
                              <input type="text" defaultValue={`$${enhance.price}`} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Title</label>
                            <input type="text" defaultValue={enhance.title} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Description</label>
                            <textarea defaultValue={enhance.description} rows={2} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">Flight Amenities</h4>
                    <div className="space-y-4">
                      {amenities.map((amenity, idx) => (
                        <div key={idx} className="p-4 border border-gray-200 rounded-2xl bg-gray-50 flex flex-col gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Type</label>
                            <input type="text" defaultValue={amenity.type} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase bg-white text-gray-600 outline-none focus:border-red focus:ring-2 focus:ring-red/10" disabled />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Title</label>
                            <input type="text" defaultValue={amenity.title} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Description</label>
                            <textarea defaultValue={amenity.description} rows={2} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:border-red focus:ring-2 focus:ring-red/10" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
                      Discard
                    </button>
                    <button type="button" className="flex-1 rounded-full bg-red px-4 py-3 text-sm font-semibold text-white hover:bg-reddark transition shadow-sm">
                      Save Changes
                    </button>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-600">Real-Time Routing</p>
                      <Settings className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="h-24 w-full rounded-2xl bg-gray-200 overflow-hidden relative">
                      {/* Placeholder for map */}
                      <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80" alt="Map" className="w-full h-full object-cover opacity-60 grayscale" />
                    </div>
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
