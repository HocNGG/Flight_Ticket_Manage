import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axiosInstance';
import { Plane, Plus, Search, Bell, Settings, X } from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { seatClasses, type SeatClassCode } from '../../../data/flightSeat';

type FlightSeatClassRange = {
  code: SeatClassCode;
  label: string;
  rowStart: number;
  rowEnd: number;
  priceMultiplier: number;  // Hệ số nhân: giá ghế = flight.basePrice × priceMultiplier
};

// API response type: GET /api/flights/all
type FlightRecord = {
  id: string;           // flightId (internal UI key)
  flightCode: string;   // API: flightNumber
  airline: string;      // API: airline.name
  origin: string;       // departureAirport.city
  originCode: string;   // departureAirport.airportCode
  dest: string;         // arrivalAirport.city
  destCode: string;     // arrivalAirport.airportCode
  departureTime: string;
  arrivalTime: string;
  duration: string;     // API: duration
  scheduleType: string;
  capacity: number;     // seats.availableSeats
  maxCapacity: number;  // seats.totalSeats
  basePrice: number;    // Min price from seatsByClass
  status: 'available' | 'sold_out'; // API: status
  seatsByClass: Record<string, { availableSeats: number; price: number }>; // seats.seatsByClass
  seatClassRanges: FlightSeatClassRange[];
};

const buildDefaultSeatRanges = (): FlightSeatClassRange[] =>
  seatClasses.map((item) => ({
    code: item.code,
    label: item.label,
    rowStart: item.rowStart,
    rowEnd: item.rowEnd,
    priceMultiplier: item.priceMultiplier,
  }));

const normalizeSeatClassRanges = (ranges: FlightSeatClassRange[], maxCapacity?: number): FlightSeatClassRange[] => {
  const totalRows = maxCapacity ? Math.ceil(maxCapacity / 6) : 0;
  return ranges.reduce<FlightSeatClassRange[]>((acc, current, index) => {
    const safeStart = index === 0 ? Math.max(1, current.rowStart) : acc[index - 1].rowEnd + 1;
    let safeEnd = Math.max(safeStart, current.rowEnd);
    
    // Ép hạng ghế cuối cùng phải lấy hết số hàng còn lại
    if (index === ranges.length - 1 && totalRows > 0) {
      safeEnd = Math.max(safeStart, totalRows);
    }
    
    acc.push({ ...current, rowStart: safeStart, rowEnd: safeEnd });
    return acc;
  }, []);
};

export interface SeatPayload {
  aircraftId: number;
  seatClassId: number;
  seatNumber: string;
}

export function generateSeatsPayload(
  aircraftId: number, 
  totalSeats: number, 
  ranges: FlightSeatClassRange[]
): SeatPayload[] {
  // Mặc định luôn là tối đa 6 ghế 1 hàng
  const letters = ['A', 'B', 'C', 'D', 'E', 'F']; 
  const payloads: SeatPayload[] = [];
  
  let currentGeneratedSeats = 0;
  const totalRows = Math.ceil(totalSeats / 6); // Làm tròn lên số hàng

  // Quét từ hàng số 1 đến hàng cuối cùng
  for (let row = 1; row <= totalRows; row++) {
    // Tìm hạng ghế (Class) tương ứng với số hàng hiện tại
    const activeRange = ranges.find(r => row >= r.rowStart && row <= r.rowEnd);
    
    // Map internal code to Backend seatClassId
    let classId = 1; // Default to Economy
    if (activeRange?.code === 'business') classId = 2;
    if (activeRange?.code === 'first') classId = 3;

    // Mỗi hàng lặp qua 6 cột A,B,C,D,E,F
    for (let col = 0; col < 6; col++) {
      // LOGIC CHẶN CHÍNH: Nếu tổng số ghế sinh ra đã ĐỦ BẰNG tổng số ghế quy định thì DỪNG
      // Giúp xử lý tốt trường hợp hàng cuối cùng bị lẻ (Ví dụ có 5 ghế thay vì 6)
      if (currentGeneratedSeats >= totalSeats) break;
      
      const seatNumber = `${row}${letters[col]}`; 
      
      payloads.push({
        aircraftId: aircraftId,
        seatClassId: classId,
        seatNumber: seatNumber
      });
      
      currentGeneratedSeats++;
    }
  }
  
  return payloads;
}

// Removed initialFlights

export const FlightManagement = () => {
  const { data: rawFlights, refetch: refetchFlights } = useQuery({ 
    queryKey: ['adminFlights'], 
    queryFn: async () => {
      try {
        const res = await api.get('/api/flights/all');
        return res.data.data.content || res.data.data;
      } catch (e) {
        console.error('Lỗi khi fetch flights:', e);
        return [];
      }
    } 
  });

  const flights: FlightRecord[] = useMemo(() => {
    if (!rawFlights || !Array.isArray(rawFlights)) return [];
    return rawFlights.map((f: any) => {
      // seatsByClass có thể rỗng {} — chỉ dùng để hiển thị giá theo hạng nếu có
      const seatsByClass: Record<string, { availableSeats: number; price: number }> = f.seats?.seatsByClass ?? {};

      // basePrice lấy trực tiếp từ root (f.basePrice từ DB)
      // Fallback: nếu không có thì thử lấy từ seatsByClass
      const seatPrices = Object.values(seatsByClass).map((s: any) => s.price).filter(Boolean);
      const basePrice: number = f.basePrice ?? (seatPrices.length > 0 ? Math.min(...seatPrices) : 0);

      return {
        id: String(f.flightId),
        flightCode: f.flightNumber ?? f.flightCode ?? '',
        airline: f.airline?.name ?? '',
        origin: f.departureAirport?.city ?? f.departureAirport?.airportName ?? '',
        originCode: f.departureAirport?.airportCode ?? '',
        dest: f.arrivalAirport?.city ?? f.arrivalAirport?.airportName ?? '',
        destCode: f.arrivalAirport?.airportCode ?? '',
        departureTime: f.departureTime ?? '',
        arrivalTime: f.arrivalTime ?? '',
        duration: f.duration ?? '',
        scheduleType: f.scheduleType ?? 'Hàng ngày',
        capacity: f.seats?.availableSeats ?? 0,
        maxCapacity: f.seats?.totalSeats ?? 0,
        basePrice,
        status: (f.seats?.availableSeats === 0) ? 'sold_out' : 'available',
        seatsByClass,
        seatClassRanges: buildDefaultSeatRanges(),
      };
    });
  }, [rawFlights]);

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedFlightId, setSelectedFlightId] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Lọc theo search query, giới hạn 5 nếu không có keyword
  const displayedFlights = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return flights.slice(0, 5); // Chỉ 5 flights đầu khi không search
    return flights.filter((f) =>
      f.flightCode.toLowerCase().includes(q) ||
      f.origin.toLowerCase().includes(q) ||
      f.dest.toLowerCase().includes(q) ||
      f.originCode.toLowerCase().includes(q) ||
      f.destCode.toLowerCase().includes(q) ||
      f.airline.toLowerCase().includes(q)
    );
  }, [flights, searchQuery]);

  const selectedFlight = useMemo(
    () => flights.find((flight) => flight.id === selectedFlightId) || (displayedFlights.length > 0 ? displayedFlights[0] : null),
    [flights, selectedFlightId, displayedFlights],
  );

  const [editForm, setEditForm] = useState<FlightRecord | null>(null);
  const [createForm, setCreateForm] = useState<FlightRecord & { airlineId?: number, routeId?: number, aircraftId?: number }>({
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
    maxCapacity: 0,
    basePrice: 0,
    status: 'available',
    seatClassRanges: normalizeSeatClassRanges(buildDefaultSeatRanges(), 0),
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
      maxCapacity: 0,
      basePrice: 0,
      status: 'available',
      seatClassRanges: normalizeSeatClassRanges(buildDefaultSeatRanges(), 0),
      airlineId: undefined,
      routeId: undefined,
      aircraftId: undefined,
    });
  };

  const { data: airlines } = useQuery({ queryKey: ['airlines'], queryFn: async () => (await api.get('/api/airlines')).data.data });
  const { data: aircrafts } = useQuery({ queryKey: ['aircrafts'], queryFn: async () => (await api.get('/api/aircrafts')).data.data });
  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: async () => (await api.get('/api/routes')).data.data });

  const setFlightAndForm = (flightId: string) => {
    setSelectedFlightId(flightId);
    const picked = flights.find((item) => item.id === flightId);
    if (picked) setEditForm({ ...picked, seatClassRanges: normalizeSeatClassRanges(picked.seatClassRanges, picked.maxCapacity) });
  };

  useMemo(() => {
    if (selectedFlight && !editForm) {
      setEditForm(selectedFlight);
      setSelectedFlightId(selectedFlight.id);
    }
  }, [selectedFlight, editForm]);

  const updateEditField = (field: keyof FlightRecord, value: string | number) => {
    setEditForm((prev) => prev ? ({ ...prev, [field]: value } as FlightRecord) : null);
  };

  const updateCreateField = (field: string, value: string | number) => {
    setCreateForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'maxCapacity') {
        updated.seatClassRanges = normalizeSeatClassRanges(updated.seatClassRanges, Number(value));
      }
      return updated;
    });
  };

  const updateSeatRange = (
    target: 'edit' | 'create',
    code: SeatClassCode,
    field: 'rowStart' | 'rowEnd' | 'priceMultiplier',
    value: number,
  ) => {
    if (target === 'edit') {
      setEditForm((prev: any) => prev ? ({
        ...prev,
        seatClassRanges: normalizeSeatClassRanges(
          prev.seatClassRanges.map((item: any, index: number) => {
            if (item.code !== code) return item;
            if (field === 'rowStart' && index > 0) return item;
            const nextValue = field === 'priceMultiplier' ? Math.max(0.1, value) : Math.max(1, value);
            return { ...item, [field]: nextValue };
          }),
          prev.maxCapacity
        ),
      }) : null);
    } else {
      setCreateForm((prev: any) => ({
        ...prev,
        seatClassRanges: normalizeSeatClassRanges(
          prev.seatClassRanges.map((item: any, index: number) => {
            if (item.code !== code) return item;
            if (field === 'rowStart' && index > 0) return item;
            const nextValue = field === 'priceMultiplier' ? Math.max(0.1, value) : Math.max(1, value);
            return { ...item, [field]: nextValue };
          }),
          prev.maxCapacity
        ),
      }));
    }
  };

  const saveFlightChanges = () => {
    if (!editForm) return;
    const normalizedForm = { ...editForm, seatClassRanges: normalizeSeatClassRanges(editForm.seatClassRanges, editForm.maxCapacity) };
    setEditForm(normalizedForm);
    // setFlights((prev) => prev.map((flight) => (flight.id === selectedFlightId ? normalizedForm : flight)));
    // Ghi chú: Cần bắn API PUT /api/flights/{id} ở đây
  };

  const createFlight = async () => {
    if (!createForm.flightCode || !createForm.airlineId || !createForm.routeId || !createForm.aircraftId) {
      alert("Vui lòng điền đủ thông tin bắt buộc!");
      return;
    }
    const id = String(Date.now());
    const normalizedForm = { ...createForm, id, seatClassRanges: normalizeSeatClassRanges(createForm.seatClassRanges, createForm.maxCapacity) };
    
    // DEMO LOGIC BULK CREATE & FLIGHT CREATE:
    
    // 1. Dữ liệu chuyến bay (Payload cho POST /api/flights)
    const flightPayload = {
      flightNumber: normalizedForm.flightCode,
      airlineId: normalizedForm.airlineId,
      routeId: normalizedForm.routeId,
      aircraftId: normalizedForm.aircraftId,
      basePrice: normalizedForm.basePrice,
      departureTime: normalizedForm.departureTime, // Format: YYYY-MM-DDTHH:mm:ss
      arrivalTime: normalizedForm.arrivalTime,     // Format: YYYY-MM-DDTHH:mm:ss
      status: "SCHEDULED"
    };

    // 2. Dữ liệu cấu hình sơ đồ ghế (Payload cho POST /api/seats/bulk)
    const seatPayloads = generateSeatsPayload(
      flightPayload.aircraftId!, 
      normalizedForm.maxCapacity, 
      normalizedForm.seatClassRanges
    );
    
    // console.log("=== THÔNG TIN GỌI API THÊM CHUYẾN BAY ===");
    // console.log("[1] Request POST /api/flights :", flightPayload);
    // console.log(`[2] Request POST /api/seats/bulk : Đã sinh ra mảng ${seatPayloads.length} ghế!`);
    
    try {
      await api.post('/api/seats/bulk', seatPayloads); 
      await api.post('/api/flights', flightPayload); 
      alert('Lưu chuyến bay và sơ đồ ghế thành công!');
      refetchFlights();
    } catch (e: any) {
      alert('Lỗi khi gọi API: ' + e.message);
      console.error(e);
      return;
    }

    setIsCreateModalOpen(false);
    resetCreateForm();
  };

  const seatsPerRow = 6;
  const seatClassSummary = editForm ? editForm.seatClassRanges.map((item) => {
    const totalRows = Math.max(item.rowEnd - item.rowStart + 1, 0);
    return { ...item, totalSeats: totalRows * seatsPerRow };
  }) : [];

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
                placeholder="Tìm theo mã, hãng, sân bay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 rounded-full border-none bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red/20"
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
              {/* Hiển thị label tổng số / đang lọc */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500">
                  {searchQuery
                    ? <><span className="font-semibold text-gray-900">{displayedFlights.length}</span> kết quả cho <span className="font-semibold text-red">"{searchQuery}"</span></>
                    : <>Hiển thị <span className="font-semibold text-gray-900">5</span> / <span className="font-semibold">{flights.length}</span> chuyến bay. Dùng ô tìm kiếm để lọc.</>}
                </p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-red transition-colors">✕ Xóa tìm kiếm</button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Flight</th>
                      <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Route</th>
                      <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Schedule</th>
                      <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Seats</th>
                      <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Giá theo hạng</th>
                      <th className="pb-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {displayedFlights.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                          {searchQuery ? `Không tìm thấy chuyến bay phù hợp với "${searchQuery}"` : 'Chưa có dữ liệu chuyến bay.'}
                        </td>
                      </tr>
                    ) : (
                      displayedFlights.map((flight) => (
                        <tr
                          key={flight.id}
                          onClick={() => setFlightAndForm(flight.id)}
                          className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedFlightId === flight.id ? 'bg-red/5' : ''}`}
                        >
                          <td className="py-5">
                            <p className="font-bold text-red text-base">{flight.flightCode}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{flight.airline}</p>
                          </td>
                          <td className="py-5">
                            <p className="font-semibold text-gray-900">{flight.originCode} → {flight.destCode}</p>
                            <p className="text-xs text-gray-500">{flight.origin}</p>
                            <p className="text-xs text-gray-500">{flight.dest}</p>
                          </td>
                          <td className="py-5">
                            <p className="font-semibold text-gray-900 text-xs">{new Date(flight.departureTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                            <p className="text-xs text-gray-500">→ {new Date(flight.arrivalTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                            {flight.duration && <p className="text-xs text-gray-400 mt-1">⏱ {flight.duration}</p>}
                          </td>
                          <td className="py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${flight.status === 'sold_out' ? 'bg-red' : 'bg-emerald-500'}`}
                                  style={{ width: flight.maxCapacity > 0 ? `${((flight.maxCapacity - flight.capacity) / flight.maxCapacity) * 100}%` : '0%' }}
                                />
                              </div>
                              {flight.status === 'sold_out' ? (
                                <span className="text-xs font-bold text-red">Sold Out</span>
                              ) : (
                                <span className="text-xs font-medium text-gray-900">{flight.capacity}/{flight.maxCapacity} trống</span>
                              )}
                            </div>
                          </td>
                          <td className="py-5">
                            <div className="space-y-1">
                              {Object.keys(flight.seatsByClass).length === 0 ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red/10 text-red">BASE</span>
                                  <span className="text-xs text-gray-700 font-medium">{new Intl.NumberFormat('vi-VN').format(flight.basePrice)}đ</span>
                                </div>
                              ) : (
                                Object.entries(flight.seatsByClass).map(([cls, info]) => (
                                  <div key={cls} className="flex items-center gap-1.5">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      cls === 'FIRST' ? 'bg-amber-100 text-amber-700' :
                                      cls === 'BUSINESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                    }`}>{cls}</span>
                                    <span className="text-xs text-gray-700 font-medium">{new Intl.NumberFormat('vi-VN').format(info.price)}đ</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="py-5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              flight.status === 'sold_out' ? 'bg-red/10 text-red' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {flight.status === 'sold_out' ? 'Hết chỗ' : 'Còn chỗ'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
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
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            editForm.basePrice * item.priceMultiplier,
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">×{item.priceMultiplier}</div>
                      </div>
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
          {editForm && editForm.id && (
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
                            className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none ${range.code !== editForm.seatClassRanges[0].code ? 'bg-gray-100 cursor-not-allowed' : 'bg-white focus:border-red'
                              }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">To Row</label>
                          <input
                            type="number"
                            value={range.rowEnd}
                            onChange={(event) => updateSeatRange('edit', range.code, 'rowEnd', Number(event.target.value))}
                            disabled={range.code === editForm.seatClassRanges[editForm.seatClassRanges.length - 1].code}
                            className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none ${range.code === editForm.seatClassRanges[editForm.seatClassRanges.length - 1].code ? 'bg-gray-100 cursor-not-allowed' : 'bg-white focus:border-red'}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                            Multiplier
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={range.priceMultiplier}
                            onChange={(event) => updateSeatRange('edit', range.code, 'priceMultiplier', Number(event.target.value))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:border-red"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2">
                        Giá dự kiến:{ }
                        <span className="font-semibold text-red">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            editForm.basePrice * range.priceMultiplier,
                          )}
                        </span>
                        { }/ ghế
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditForm(selectedFlight as FlightRecord)}
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
          )}
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
              
              <select value={createForm.airlineId || ''} onChange={(e) => updateCreateField('airlineId', Number(e.target.value))} className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red text-gray-900">
                <option value="" disabled>Chọn Hãng bay</option>
                {airlines?.map((a: any) => <option key={a.airlineId} value={a.airlineId}>{a.name}</option>)}
              </select>
              
              <select value={createForm.routeId || ''} onChange={(e) => updateCreateField('routeId', Number(e.target.value))} className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red">
                <option value="" disabled>Chọn Tuyến bay</option>
                {routes?.map((r: any) => <option key={r.routeId} value={r.routeId}>{r.departureAirportCode} ➔ {r.arrivalAirportCode}</option>)}
              </select>
              
              <select value={createForm.aircraftId || ''} onChange={(e) => {
                const id = Number(e.target.value);
                updateCreateField('aircraftId', id);
                const ac = aircrafts?.find((x: any) => x.aircraftId === id);
                if (ac) updateCreateField('maxCapacity', ac.totalSeats);
              }} className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red">
                <option value="" disabled>Chọn Máy bay</option>
                {aircrafts?.map((a: any) => <option key={a.aircraftId} value={a.aircraftId}>{a.model} ({a.totalSeats} seats)</option>)}
              </select>

              <input type="datetime-local" value={createForm.departureTime} onChange={(e) => updateCreateField('departureTime', e.target.value)} placeholder="Giờ khởi hành" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
              <input type="datetime-local" value={createForm.arrivalTime} onChange={(e) => updateCreateField('arrivalTime', e.target.value)} placeholder="Giờ đến" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
              
              <div className="relative">
                <input type="number" disabled value={createForm.maxCapacity || ''} placeholder="Tổng số ghế (Tự động)" className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-100 outline-none" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">Tự động điền theo máy bay</span>
              </div>
              <input type="number" value={createForm.basePrice || ''} onChange={(e) => updateCreateField('basePrice', Number(e.target.value))} placeholder="Giá cơ bản (VND)" className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-red" />
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
                    placeholder="From row"
                    className={`rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ${range.code !== createForm.seatClassRanges[0].code ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-red'
                      }`}
                  />
                  <input type="number" value={range.rowEnd} 
                    onChange={(e) => updateSeatRange('create', range.code, 'rowEnd', Number(e.target.value))} 
                    placeholder="To row" 
                    disabled={range.code === createForm.seatClassRanges[createForm.seatClassRanges.length - 1].code}
                    className={`rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ${range.code === createForm.seatClassRanges[createForm.seatClassRanges.length - 1].code ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-red'}`} 
                  />
                  <div>
                    <input
                      type="number" step="0.1"
                      value={range.priceMultiplier}
                      onChange={(e) => updateSeatRange('create', range.code, 'priceMultiplier', Number(e.target.value))}
                      placeholder="Hệ số (1.0)"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">
                      ≈ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                        createForm.basePrice * range.priceMultiplier,
                      )}
                    </p>
                  </div>
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
