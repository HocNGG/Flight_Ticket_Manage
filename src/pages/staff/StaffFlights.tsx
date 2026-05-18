import { useState, useEffect, useCallback } from 'react';
import { Search, Plane, Loader2 } from 'lucide-react';
import { StaffLayout } from '../../layouts/StaffLayout';

// GET /api/flights?departure=...&arrival=...&departureDate=...&passengerCount=...&seatClass=...
// Read only — staff chỉ xem

type Flight = {
  flightId: number;
  flightCode: string;
  departureTime: string;
  arrivalTime: string;
  departureAirport?: { code: string; name: string };
  arrivalAirport?: { code: string; name: string };
  airline?: { airlineName: string; airlineCode: string };
  aircraft?: { model: string };
  basePrice: number;
  availableSeats: number;
  duration?: string;
  status?: string;
};

const MOCK_FLIGHTS: Flight[] = [
  {
    flightId: 1, flightCode: 'VN001',
    departureTime: '2024-04-10T08:00:00', arrivalTime: '2024-04-10T10:10:00',
    departureAirport: { code: 'SGN', name: 'Tân Sơn Nhất' },
    arrivalAirport: { code: 'HAN', name: 'Nội Bài' },
    airline: { airlineName: 'Vietnam Airlines', airlineCode: 'VN' },
    aircraft: { model: 'Boeing 787' },
    basePrice: 2500000, availableSeats: 45, duration: '2 giờ 10 phút', status: 'SCHEDULED',
  },
  {
    flightId: 2, flightCode: 'QH201',
    departureTime: '2024-04-10T10:30:00', arrivalTime: '2024-04-10T11:50:00',
    departureAirport: { code: 'HAN', name: 'Nội Bài' },
    arrivalAirport: { code: 'DAD', name: 'Đà Nẵng' },
    airline: { airlineName: 'Bamboo Airways', airlineCode: 'QH' },
    aircraft: { model: 'Airbus A320' },
    basePrice: 1200000, availableSeats: 12, duration: '1 giờ 20 phút', status: 'SCHEDULED',
  },
  {
    flightId: 3, flightCode: 'VJ303',
    departureTime: '2024-04-10T14:00:00', arrivalTime: '2024-04-10T15:30:00',
    departureAirport: { code: 'SGN', name: 'Tân Sơn Nhất' },
    arrivalAirport: { code: 'DAD', name: 'Đà Nẵng' },
    airline: { airlineName: 'VietJet Air', airlineCode: 'VJ' },
    aircraft: { model: 'Airbus A321' },
    basePrice: 950000, availableSeats: 0, duration: '1 giờ 30 phút', status: 'DEPARTED',
  },
];

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatTime = (d: string) => new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const formatDateShort = (d: string) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

const flightStatusColor: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  DEPARTED: 'bg-purple-100 text-purple-700',
  ARRIVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  DELAYED: 'bg-yellow-100 text-yellow-700',
};

export const StaffFlights = () => {
  const [flights, setFlights] = useState<Flight[]>(MOCK_FLIGHTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/flights?departure=&arrival=&departureDate=&passengerCount=1&seatClass=ECONOMY');
      const j = await r.json();
      if (j.success && j.data?.flights) setFlights(j.data.flights);
    } catch { /* mock */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchFlights(); }, [fetchFlights]);

  const filtered = flights.filter(f =>
    f.flightCode.toLowerCase().includes(search.toLowerCase()) ||
    (f.departureAirport?.code ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (f.arrivalAirport?.code ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (f.airline?.airlineName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StaffLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Flights</h1>
          <p className="text-sm text-gray-500 mt-0.5">Danh sách chuyến bay (chỉ đọc)</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo mã, sân bay, hãng bay..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40" />
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500 mr-2" />
              <span className="text-gray-400">Đang tải...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
              Không tìm thấy chuyến bay nào
            </div>
          ) : filtered.map(f => {
            const statusLabel = f.status ?? 'SCHEDULED';
            const seatColor = f.availableSeats === 0 ? 'text-red-600' : f.availableSeats < 20 ? 'text-orange-600' : 'text-green-600';
            return (
              <div key={f.flightId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-base">{f.flightCode}</p>
                      <p className="text-xs text-gray-500">{f.airline?.airlineName ?? '---'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${flightStatusColor[statusLabel] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Route visualization */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-3xl font-black text-gray-900">{formatTime(f.departureTime)}</p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{f.departureAirport?.code ?? '---'}</p>
                    <p className="text-[10px] text-gray-400">{f.departureAirport?.name ?? ''}</p>
                    <p className="text-[10px] text-gray-400">{formatDateShort(f.departureTime)}</p>
                  </div>
                  <div className="flex-1 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-gray-200" />
                      <div className="text-gray-300 text-sm">✈</div>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    {f.duration && <p className="text-[10px] text-gray-400 text-center mt-1">{f.duration}</p>}
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-gray-900">{formatTime(f.arrivalTime)}</p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{f.arrivalAirport?.code ?? '---'}</p>
                    <p className="text-[10px] text-gray-400">{f.arrivalAirport?.name ?? ''}</p>
                    <p className="text-[10px] text-gray-400">{formatDateShort(f.arrivalTime)}</p>
                  </div>
                </div>

                {/* Footer info */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Máy bay</p>
                      <p className="text-xs font-bold text-gray-700 mt-0.5">{f.aircraft?.model ?? '---'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ghế trống</p>
                      <p className={`text-xs font-black mt-0.5 ${seatColor}`}>{f.availableSeats} ghế</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Giá từ</p>
                    <p className="text-lg font-black text-red mt-0.5">{formatPrice(f.basePrice)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
          ℹ️ Staff chỉ có thể xem thông tin chuyến bay. Quản lý chuyến bay cần quyền Admin.
        </div>
      </div>
    </StaffLayout>
  );
};
