import { useMemo, useState } from 'react';
import { Plane, Plus, Search, Bell, Settings, X } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { seatClasses, type SeatClassCode } from '../../../data/flightSeat';

type FlightSeatClassRange = {
  code: SeatClassCode;
  label: string;
  rowStart: number;
  rowEnd: number;
  basePrice: number;
};

// API response type: GET /api/flights
type FlightRecord = {
  id: string;           // flightId (internal UI key)
  flightCode: string;   // API: flightCode
  origin: string;       // departureAirport.name
  originCode: string;   // departureAirport.code
  dest: string;         // arrivalAirport.name
  destCode: string;     // arrivalAirport.code
  departureTime: string;
  arrivalTime: string;
  scheduleType: string;
  capacity: number;     // availableSeats
  maxCapacity: number;  // aircraft.totalSeats
  basePrice: number;    // API: basePrice (VND)
  status: 'available' | 'sold_out';
  seatClassRanges: FlightSeatClassRange[];
};

const buildDefaultSeatRanges = (): FlightSeatClassRange[] =>
  seatClasses.map((item) => ({
    code: item.code,
    label: item.label,
    rowStart: item.rowStart,
    rowEnd: item.rowEnd,
    basePrice: item.basePrice,
  }));

const normalizeSeatClassRanges = (ranges: FlightSeatClassRange[]): FlightSeatClassRange[] => {
  return ranges.reduce<FlightSeatClassRange[]>((acc, current, index) => {
    const safeStart = index === 0 ? Math.max(1, current.rowStart) : acc[index - 1].rowEnd + 1;
    const safeEnd = Math.max(safeStart, current.rowEnd);
    acc.push({ ...current, rowStart: safeStart, rowEnd: safeEnd });
    return acc;
  }, []);
};

// Mock data theo API response (VN flights)
const initialFlights: FlightRecord[] = [
  {
    id: '1',
    flightCode: 'VN001',
    origin: 'TP. Hồ Chí Minh',
    originCode: 'SGN',
    dest: 'Hà Nội',
    destCode: 'HAN',
    departureTime: '08:00',
    arrivalTime: '10:00',
    scheduleType: 'Hàng ngày',
    capacity: 45,
    maxCapacity: 300,
    basePrice: 2500000,
    status: 'available',
    seatClassRanges: buildDefaultSeatRanges(),
  },
  {
    id: '2',
    flightCode: 'VJ202',
    origin: 'Hà Nội',
    originCode: 'HAN',
    dest: 'Đà Nẵng',
    destCode: 'DAD',
    departureTime: '14:30',
    arrivalTime: '16:00',
    scheduleType: 'T2, T4, T6',
    capacity: 12,
    maxCapacity: 180,
    basePrice: 1890000,
    status: 'available',
    seatClassRanges: buildDefaultSeatRanges(),
  },
  {
    id: '3',
    flightCode: 'QH305',
    origin: 'Đà Nẵng',
    originCode: 'DAD',
    dest: 'Phú Quốc',
    destCode: 'PQC',
    departureTime: '18:00',
    arrivalTime: '19:30',
    scheduleType: 'Hàng ngày',
    capacity: 100,
    maxCapacity: 100,
    basePrice: 3200000,
    status: 'sold_out',
    seatClassRanges: buildDefaultSeatRanges(),
  },
];

export const FlightManagement = () => {
  const [flights, setFlights] = useState<FlightRecord[]>(initialFlights);
  const [selectedFlightId, setSelectedFlightId] = useState(initialFlights[0].id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedFlight = useMemo(
    () => flights.find((flight) => flight.id === selectedFlightId) ?? flights[0],
    [flights, selectedFlightId],
  );

  const [editForm, setEditForm] = useState<FlightRecord>(selectedFlight);
  const [createForm, setCreateForm] = useState<FlightRecord>({
    id: '',
    flightCode: '',
    origin: '',
    originCode: '',
    dest: '',
    destCode: '',
    departureTime: '',
    arrivalTime: '',
    scheduleType: 'Hàng ngày',
    capacity: 0,
    maxCapacity: 180,
    basePrice: 0,
    status: 'available',
    seatClassRanges: normalizeSeatClassRanges(buildDefaultSeatRanges()),
  });

  const resetCreateForm = () => {
    setCreateForm({
      id: '',
      flightCode: '',
      origin: '',
      originCode: '',
      dest: '',
      destCode: '',
      departureTime: '',
      arrivalTime: '',
      scheduleType: 'Hàng ngày',
      capacity: 0,
      maxCapacity: 180,
      basePrice: 0,
      status: 'available',
      seatClassRanges: normalizeSeatClassRanges(buildDefaultSeatRanges()),
    });
  };

  const setFlightAndForm = (flightId: string) => {
    setSelectedFlightId(flightId);
    const picked = flights.find((item) => item.id === flightId);
    if (picked) setEditForm({ ...picked, seatClassRanges: normalizeSeatClassRanges(picked.seatClassRanges) });
  };

  const updateEditField = (field: keyof FlightRecord, value: string | number) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateCreateField = (field: keyof FlightRecord, value: string | number) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateSeatRange = (
    target: 'edit' | 'create',
    code: SeatClassCode,
    field: 'rowStart' | 'rowEnd' | 'basePrice',
    value: number,
  ) => {
    const setter = target === 'edit' ? setEditForm : setCreateForm;
    setter((prev) => ({
      ...prev,
      seatClassRanges: normalizeSeatClassRanges(
        prev.seatClassRanges.map((item, index) => {
          if (item.code !== code) return item;
          if (field === 'rowStart' && index > 0) return item;
          const nextValue = field === 'basePrice' ? Math.max(0, value) : Math.max(1, value);
          return { ...item, [field]: nextValue };
        }),
      ),
    }));
  };

  const saveFlightChanges = () => {
    const normalizedForm = { ...editForm, seatClassRanges: normalizeSeatClassRanges(editForm.seatClassRanges) };
    setEditForm(normalizedForm);
    setFlights((prev) => prev.map((flight) => (flight.id === selectedFlightId ? normalizedForm : flight)));
    if (selectedFlightId !== normalizedForm.id) {
      setSelectedFlightId(normalizedForm.id);
    }
  };

  const createFlight = () => {
    if (!createForm.flightCode || !createForm.origin || !createForm.dest) return;
    if (flights.some((flight) => flight.flightCode === createForm.flightCode)) return;
    const id = String(Date.now());
    const normalizedForm = { ...createForm, id, seatClassRanges: normalizeSeatClassRanges(createForm.seatClassRanges) };
    setFlights((prev) => [...prev, normalizedForm]);
    setSelectedFlightId(id);
    setEditForm(normalizedForm);
    setIsCreateModalOpen(false);
    resetCreateForm();
  };

  const seatsPerRow = 6;
  const seatClassSummary = editForm.seatClassRanges.map((item) => {
    const totalRows = Math.max(item.rowEnd - item.rowStart + 1, 0);
    return { ...item, totalSeats: totalRows * seatsPerRow };
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
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

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-red px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-reddark transition-colors"
              >
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
                            onClick={() => setFlightAndForm(flight.id)}
                            className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedFlightId === flight.id ? 'bg-red/5' : ''}`}
                          >
                            <td className="py-5 font-bold text-red text-base">{flight.flightCode}</td>
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
                            <td className="py-5 font-bold text-gray-900 text-sm">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(flight.basePrice)}
                            </td>
                            <td className="py-5 font-bold text-gray-600 text-sm">{Math.round((flight.capacity / flight.maxCapacity) * 3)}</td>
                            <td className="py-5 font-bold text-gray-600 text-sm">{flight.seatClassRanges.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Seat Class Mapping</h3>
                      <p className="text-sm text-gray-500">Quan ly dãy ghế theo hạng cho flight đang chỉnh bên phải.</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-red">Aircraft template</span>
                  </div>

                  <div className="space-y-4">
                    {seatClassSummary.map((item) => (
                      <div key={item.code} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-[0.18em]">
                              Rows {item.rowStart} - {item.rowEnd} • {item.totalSeats} seats
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-red">Base from ${item.basePrice}</div>
                        </div>
                      </div>
                    ))}
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
                    <input
                      type="text"
                      value={editForm.flightCode}
                      onChange={(event) => updateEditField('flightCode', event.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 font-medium outline-none focus:border-red"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Departure</label>
                      <input
                        type="text"
                        value={editForm.origin}
                        onChange={(event) => updateEditField('origin', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Destination</label>
                      <input
                        type="text"
                        value={editForm.dest}
                        onChange={(event) => updateEditField('dest', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Dep. Time</label>
                      <input
                        type="text"
                        value={editForm.departureTime}
                        onChange={(event) => updateEditField('departureTime', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Arr. Time</label>
                      <input
                        type="text"
                        value={editForm.arrivalTime}
                        onChange={(event) => updateEditField('arrivalTime', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Seat Capacity</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editForm.maxCapacity}
                        onChange={(event) => updateEditField('maxCapacity', Number(event.target.value))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">seats</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Base Price (VND)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-900 font-bold">₫</span>
                      <input
                        type="number"
                        value={editForm.basePrice}
                        onChange={(event) => updateEditField('basePrice', Number(event.target.value))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-4 py-3 text-sm text-red font-bold outline-none focus:border-red"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Seat Class By Row Ranges</h4>
                    <p className="text-[11px] text-gray-500 mb-4">Rule: hạng sau tự bắt đầu từ hàng kết thúc của hạng trước + 1.</p>
                    <div className="space-y-4">
                      {editForm.seatClassRanges.map((range) => (
                        <div key={range.code} className="p-4 border border-gray-200 rounded-2xl bg-gray-50">
                          <p className="text-sm font-bold text-gray-900 mb-3">{range.label}</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">From Row</label>
                              <input
                                type="number"
                                value={range.rowStart}
                                onChange={(event) => updateSeatRange('edit', range.code, 'rowStart', Number(event.target.value))}
                                readOnly={range.code !== editForm.seatClassRanges[0].code}
                                className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none ${
                                  range.code !== editForm.seatClassRanges[0].code ? 'bg-gray-100 cursor-not-allowed' : 'bg-white focus:border-red'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">To Row</label>
                              <input
                                type="number"
                                value={range.rowEnd}
                                onChange={(event) => updateSeatRange('edit', range.code, 'rowEnd', Number(event.target.value))}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:border-red"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Base Price</label>
                              <input
                                type="number"
                                value={range.basePrice}
                                onChange={(event) => updateSeatRange('edit', range.code, 'basePrice', Number(event.target.value))}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:border-red"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditForm(selectedFlight)}
                      className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={saveFlightChanges}
                      className="flex-1 rounded-full bg-red px-4 py-3 text-sm font-semibold text-white hover:bg-reddark transition shadow-sm"
                    >
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
      </div>
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl rounded-[2rem] bg-white p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Create Flight</h3>
                <p className="text-sm text-gray-500">Them chuyen bay moi va cau hinh day ghe theo hang.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetCreateForm();
                }}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={createForm.flightCode} onChange={(e) => updateCreateField('flightCode', e.target.value.toUpperCase())} placeholder="Mã chuyến bay (VN001)" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
              <input value={createForm.scheduleType} onChange={(e) => updateCreateField('scheduleType', e.target.value)} placeholder="Lịch bay (Hàng ngày, T2 T4 T6)" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
              <input value={createForm.origin} onChange={(e) => updateCreateField('origin', e.target.value)} placeholder="Thành phố khởi hành" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
              <input value={createForm.originCode} onChange={(e) => updateCreateField('originCode', e.target.value.toUpperCase())} placeholder="Mã sân bay khởi hành (SGN)" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
              <input value={createForm.dest} onChange={(e) => updateCreateField('dest', e.target.value)} placeholder="Thành phố đến" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
              <input value={createForm.destCode} onChange={(e) => updateCreateField('destCode', e.target.value.toUpperCase())} placeholder="Mã sân bay đến (HAN)" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
              <input value={createForm.departureTime} onChange={(e) => updateCreateField('departureTime', e.target.value)} placeholder="Giờ khởi hành (08:00)" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
              <input value={createForm.arrivalTime} onChange={(e) => updateCreateField('arrivalTime', e.target.value)} placeholder="Giờ đến (10:00)" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
              <input type="number" value={createForm.maxCapacity} onChange={(e) => updateCreateField('maxCapacity', Number(e.target.value))} placeholder="Tổng số ghế" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
              <input type="number" value={createForm.basePrice} onChange={(e) => updateCreateField('basePrice', Number(e.target.value))} placeholder="Giá cơ bản (VND)" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Seat class ranges</p>
              <p className="text-[11px] text-gray-500">Rule: class tiếp theo luôn bắt đầu từ hàng trước đó + 1 để tránh overlap.</p>
              {createForm.seatClassRanges.map((range) => (
                <div key={range.code} className="grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="font-semibold text-gray-900 text-sm self-center">{range.label}</div>
                  <input
                    type="number"
                    value={range.rowStart}
                    onChange={(e) => updateSeatRange('create', range.code, 'rowStart', Number(e.target.value))}
                    readOnly={range.code !== createForm.seatClassRanges[0].code}
                    className={`rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ${
                      range.code !== createForm.seatClassRanges[0].code ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-red'
                    }`}
                  />
                  <input type="number" value={range.rowEnd} onChange={(e) => updateSeatRange('create', range.code, 'rowEnd', Number(e.target.value))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red" />
                  <input type="number" value={range.basePrice} onChange={(e) => updateSeatRange('create', range.code, 'basePrice', Number(e.target.value))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red" />
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetCreateForm();
                }}
                className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="button" onClick={createFlight} className="rounded-full bg-red px-6 py-3 text-sm font-semibold text-white hover:bg-reddark">
                Create Flight
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
