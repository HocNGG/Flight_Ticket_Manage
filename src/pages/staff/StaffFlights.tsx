import { useState, useEffect, useCallback } from 'react';
import { Search, Plane, Loader2 } from 'lucide-react';
import { StaffLayout } from '../../layouts/StaffLayout';
import api from '../../api/axiosInstance';

type Flight = {
  flightId: number;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  route?: {
    routeId: number;
    departureAirport?: { airportCode: string; airportName: string; city: string };
    arrivalAirport?: { airportCode: string; airportName: string; city: string };
    duration: string;
  };
  aircraft?: {
    aircraftId: number;
    model: string;
    totalSeats: number;
  };
  basePrice: number;
  status?: string;
};

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const formatTime = (d: string) => {
  try {
    return new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return d;
  }
};
const formatDateShort = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  } catch {
    return d;
  }
};

const flightStatusColor: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  DEPARTED: 'bg-purple-100 text-purple-700',
  ARRIVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  DELAYED: 'bg-yellow-100 text-yellow-700',
};

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Đã lên lịch',
  DEPARTED: 'Đã cất cánh',
  ARRIVED: 'Đã hạ cánh',
  CANCELLED: 'Đã hủy',
  DELAYED: 'Trễ giờ',
};

export const StaffFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/flights/all');
      if (res.data.success && res.data.data) {
        const list = res.data.data.content || res.data.data;
        if (Array.isArray(list)) {
          setFlights(list);
        }
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const filtered = flights.filter(f =>
    f.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
    (f.route?.departureAirport?.airportCode ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (f.route?.arrivalAirport?.airportCode ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (f.route?.departureAirport?.city ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (f.route?.arrivalAirport?.city ?? '').toLowerCase().includes(search.toLowerCase())
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
              placeholder="Tìm theo số hiệu, thành phố, sân bay..."
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
            const statusVal = f.status ?? 'SCHEDULED';
            return (
              <div key={f.flightId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-gray-200 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-base">{f.flightNumber}</p>
                      <p className="text-xs text-gray-500">Mẫu tàu bay: {f.aircraft?.model ?? '---'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${flightStatusColor[statusVal] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[statusVal] ?? statusVal}
                    </span>
                  </div>
                </div>

                {/* Route visualization */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center w-28">
                    <p className="text-3xl font-black text-gray-900">{formatTime(f.departureTime)}</p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{f.route?.departureAirport?.airportCode ?? '---'}</p>
                    <p className="text-[10px] text-gray-400 truncate" title={f.route?.departureAirport?.airportName}>{f.route?.departureAirport?.city ?? ''}</p>
                    <p className="text-[10px] text-gray-400">{formatDateShort(f.departureTime)}</p>
                  </div>
                  
                  <div className="flex-1 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-gray-200" />
                      <div className="text-gray-300 text-sm">✈</div>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    {f.route?.duration && (
                      <p className="text-[10px] text-gray-400 text-center mt-1">Thời gian bay: {f.route.duration}</p>
                    )}
                  </div>

                  <div className="text-center w-28">
                    <p className="text-3xl font-black text-gray-900">{formatTime(f.arrivalTime)}</p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{f.route?.arrivalAirport?.airportCode ?? '---'}</p>
                    <p className="text-[10px] text-gray-400 truncate" title={f.route?.arrivalAirport?.airportName}>{f.route?.arrivalAirport?.city ?? ''}</p>
                    <p className="text-[10px] text-gray-400">{formatDateShort(f.arrivalTime)}</p>
                  </div>
                </div>

                {/* Footer info */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tổng số ghế</p>
                      <p className="text-xs font-bold text-gray-700 mt-0.5">{f.aircraft?.totalSeats ?? '---'} ghế</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Giá vé cơ bản</p>
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
