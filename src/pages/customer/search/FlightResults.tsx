import { Plane, ArrowRight, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAllFlights, useSearchFlights } from '../../../hooks/useFlights';
import { useSearchStore } from '../../../store/useSearchStore';
import type { FlightResult } from '../../../api/types';

const toAirportCode = (value: string) => {
  const trimmed = value.trim();
  const codeInBracket = trimmed.match(/\(([A-Za-z]{3})\)\s*$/);
  if (codeInBracket) return codeInBracket[1].toUpperCase();
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();
  return trimmed.toUpperCase();
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatFlightDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export const FlightResults = () => {
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();
  const { searchParams: storedParams } = useSearchStore();

  // Local UI state — chỉ dùng trong trang này
  const [sortBy, setSortBy] = useState<'price' | 'departure'>('departure');
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [isShowingAllFlights, setIsShowingAllFlights] = useState(false);

  // useMemo: ưu tiên URL params (F5 vẫn chạy), fallback về Zustand store
  const queryParams = useMemo(() => {
    const dep = urlParams.get('departure');
    const arr = urlParams.get('arrival');
    const date = urlParams.get('departureDate');
    if (dep && arr && date) {
      return {
        departure: toAirportCode(dep),
        arrival: toAirportCode(arr),
        departureDate: date,
        passengerCount: Number(urlParams.get('passengerCount')) || 1,
        seatClass: (urlParams.get('seatClass') || 'ECONOMY') as 'ECONOMY' | 'BUSINESS' | 'FIRST',
      };
    }
    return storedParams
      ? {
        ...storedParams,
        departure: toAirportCode(storedParams.departure),
        arrival: toAirportCode(storedParams.arrival),
      }
      : null;
  }, [urlParams, storedParams]);

  // React Query: gọi API, cache riêng theo từng bộ queryParams
  const { data: flights = [], isLoading, isError } = useSearchFlights(queryParams);
  const {
    data: allFlights = [],
    refetch: refetchAllFlights,
    isFetching: isFetchingAllFlights,
  } = useAllFlights();

  const sourceFlights = isShowingAllFlights ? allFlights : flights;

  // useMemo: extract danh sách hãng bay duy nhất từ kết quả thực
  const airlineOptions = useMemo(
    () => [...new Map(sourceFlights.map((f) => [f.airline.airlineId, f.airline])).values()],
    [sourceFlights]
  );

  // useMemo: filter + sort client-side — không gọi thêm API
  const filteredFlights = useMemo(() => {
    let result = [...sourceFlights];
    if (selectedAirlines.length > 0) {
      result = result.filter((f) => selectedAirlines.includes(String(f.airline.airlineId)));
    }
    result.sort((a, b) => {
      if (sortBy === 'price') return a.basePrice - b.basePrice;
      if (sortBy === 'departure') return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      return 0;
    });
    return result;
  }, [sourceFlights, selectedAirlines, sortBy]);

  const toggleAirline = (id: string) =>
    setSelectedAirlines((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleShowAllFlights = async () => {
    const result = await refetchAllFlights();
    if ((result.data ?? []).length > 0) {
      setSelectedAirlines([]);
      setIsShowingAllFlights(true);
    }
  };

  // Đọc URL params để hiển thị Search Summary Bar
  const departure = queryParams?.departure || '';
  const arrival = queryParams?.arrival || '';
  const departureDateParam = urlParams.get('departureDate') || queryParams?.departureDate || '';
  const passengerCount = urlParams.get('passengerCount') || String(queryParams?.passengerCount || 1);
  const seatClass = urlParams.get('seatClass') || queryParams?.seatClass || 'ECONOMY';

  const formatDate = (value: string) => {
    if (!value) return 'Chọn ngày';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Chọn ngày';
    return parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const seatClassLabel: Record<string, string> = {
    ECONOMY: 'Economy',
    BUSINESS: 'Business',
    FIRST: 'First Class',
  };

  if (isLoading) return (
    <div className="w-full flex items-center justify-center py-32">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Đang tìm chuyến bay...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="w-full flex items-center justify-center py-32">
      <div className="text-center">
        <p className="text-2xl mb-2">✈️</p>
        <p className="text-gray-700 font-bold">Không thể tải chuyến bay</p>
        <p className="text-gray-400 text-sm mt-1">Vui lòng thử lại sau.</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-6 pb-24">

      {/* Search Summary Bar */}
      <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between mb-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-red" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Khởi hành</p>
              <p className="font-bold text-gray-900">{departure}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-gold rotate-45" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Điểm đến</p>
              <p className="font-bold text-gray-900">{arrival}</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-gray-200" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ngày bay</p>
            <p className="font-bold text-gray-900">{formatDate(departureDateParam)}</p>
          </div>
          <div className="hidden md:block w-px h-8 bg-gray-200" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hành khách</p>
            <p className="font-bold text-gray-900">{passengerCount} người</p>
          </div>
          <div className="hidden md:block w-px h-8 bg-gray-200" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hạng ghế</p>
            <p className="font-bold text-gray-900">{seatClassLabel[seatClass] || seatClass}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/search')}
          className="mt-4 md:mt-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <span className="text-gray-600 text-sm">✎</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm sticky top-[100px]">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Bộ lọc</h2>

            <div className="mb-8">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Điểm dừng</h3>
              <div className="space-y-3">
                <Checkbox label="Bay thẳng" id="s-0" defaultChecked />
                <Checkbox label="1 điểm dừng" id="s-1" />
                <Checkbox label="2+ điểm dừng" id="s-2" />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Hãng bay</h3>
              <div className="space-y-3">
                {/* Dynamic từ dữ liệu API thực — không hardcode */}
                {airlineOptions.map((airline) => (
                  <div key={airline.airlineId} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`a-${airline.airlineId}`}
                      checked={selectedAirlines.length === 0 || selectedAirlines.includes(String(airline.airlineId))}
                      onChange={() => toggleAirline(String(airline.airlineId))}
                      className="w-4 h-4 accent-red-600"
                    />
                    <label htmlFor={`a-${airline.airlineId}`} className="text-sm cursor-pointer font-medium text-gray-600">
                      {airline.airlineName}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo card */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 mt-8 overflow-hidden relative">
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
              <div className="relative z-10">
                <p className="text-[#e2b868] text-[10px] font-bold uppercase tracking-widest mb-1">Ưu đãi</p>
                <h4 className="text-white font-bold leading-tight">Đặt sớm, giá tốt hơn!</h4>
              </div>
            </div>
          </div>
        </aside>

        {/* Flight List */}
        <main className="flex-1">
          {/* Stepper */}
          <div className="flex items-center justify-between w-full relative py-6 my-2">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[35%] h-0.5 bg-red"></div>
            <StepDot done label="01" />
            <StepDot active label="02" />
            <StepDot label="03" />
            <StepDot label="04" />
            <span className="relative z-10 bg-surface pl-4 text-[10px] font-bold uppercase tracking-widest text-dark">
              Bước 2: Chọn chuyến bay
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">Chuyến bay có sẵn</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {isShowingAllFlights
                  ? `Hiển thị toàn bộ ${filteredFlights.length} chuyến bay khả dụng.`
                  : `Tìm thấy ${filteredFlights.length} chuyến bay phù hợp.`}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0 text-sm font-semibold text-gray-600">
              <span className="uppercase text-[10px] font-bold text-gray-400 tracking-widest">Sắp xếp:</span>
              <button
                onClick={() => setSortBy('price')}
                className={`flex items-center gap-1 cursor-pointer hover:text-gray-900 ${sortBy === 'price' ? 'text-red font-bold' : ''}`}
              >
                Giá thấp nhất <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSortBy('departure')}
                className={`flex items-center gap-1 cursor-pointer hover:text-gray-900 ${sortBy === 'departure' ? 'text-red font-bold' : ''}`}
              >
                Giờ bay <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredFlights.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-gray-700 font-bold">Không tìm thấy chuyến bay</p>
              <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm lại.</p>
              <button
                onClick={handleShowAllFlights}
                disabled={isFetchingAllFlights}
                className={`mt-5 rounded-full px-6 py-2.5 text-sm font-bold transition-colors ${isFetchingAllFlights
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-red text-white hover:bg-reddark'
                  }`}
              >
                {isFetchingAllFlights ? 'Đang tải toàn bộ chuyến bay...' : 'Hiển thị toàn bộ chuyến bay'}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredFlights.map((flight) => (
                <FlightResultCard
                  key={flight.flightId}
                  flight={flight}
                  onSelect={() => navigate(`/detail/${flight.flightId}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Flight card dùng đúng cấu trúc API response
const FlightResultCard = ({
  flight,
  onSelect,
}: {
  flight: FlightResult;
  onSelect: () => void;
}) => (
  <div className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-shadow border border-transparent hover:border-red/10 flex flex-col md:flex-row items-center relative overflow-hidden group">
    <div className="flex items-center flex-1 w-full flex-wrap gap-6 md:gap-0">

      {/* Airline */}
      <div className="w-[140px] flex flex-col justify-center items-center text-center">
        <div className="w-10 h-10 rounded-full bg-red-50 text-red flex items-center justify-center mb-2 font-black text-xs">
          {flight.airline.airlineCode}
        </div>
        <span className="text-xs font-bold text-gray-900 leading-tight block">{flight.airline.airlineName}</span>
        <span className="text-[10px] text-gray-400 font-medium block">{flight.flightCode}</span>
      </div>

      {/* Departure */}
      <div className="flex-1 min-w-[100px] text-center md:text-left md:pl-8">
        <div className="text-2xl font-black text-gray-900">{formatTime(flight.departureTime)}</div>
        <div className="text-sm text-gray-500 font-medium">{flight.departureAirport.code}</div>
        <div className="text-[10px] text-gray-400">{flight.departureAirport.name}</div>
        <div className="text-[10px] text-red font-bold mt-1">
          Ngày đi: {formatFlightDate(flight.departureTime)}
        </div>
      </div>

      {/* Duration */}
      <div className="flex-1 min-w-[140px] px-4 flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold text-gold mb-3">{flight.duration}</span>
        <div className="w-full h-0.5 bg-red relative flex items-center mt-1">
          <Plane className="w-4 h-4 text-red absolute left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <span className="text-[15px] font-semibold text-gray-400 mt-1">NON-STOP</span>
      </div>

      {/* Arrival */}
      <div className="flex-1 min-w-[100px] text-center md:text-left md:pl-4">
        <div className="text-2xl font-black text-gray-900">{formatTime(flight.arrivalTime)}</div>
        <div className="text-sm text-gray-500 font-medium">{flight.arrivalAirport.code}</div>
        <div className="text-[10px] text-gray-400">{flight.arrivalAirport.name}</div>
        <div className="text-[10px] text-red font-bold mt-1">
          Ngày đến: {formatFlightDate(flight.arrivalTime)}
        </div>
      </div>
    </div>

    {/* Price + Action */}
    <div className="w-full md:w-auto flex items-center justify-between md:flex-col md:items-end md:pl-8 md:border-l border-gray-100 mt-6 md:mt-0 pt-6 md:pt-0">
      <div className="text-right">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Từ</p>
        <div className="text-2xl font-black text-gray-900">{formatPrice(flight.basePrice)}</div>
        <p className="text-[10px] text-gray-400">Còn {flight.availableSeats} chỗ</p>
      </div>
      <button
        onClick={onSelect}
        className="mt-4 bg-red text-white hover:bg-reddark transition-colors rounded-full px-6 py-2.5 font-bold text-sm"
      >
        Chọn
      </button>
    </div>
  </div>
);

const Checkbox = ({ id, label, defaultChecked = false }: { id: string; label: string; defaultChecked?: boolean }) => (
  <div className="flex items-center gap-3">
    <input type="checkbox" id={id} defaultChecked={defaultChecked} className="w-4 h-4 accent-red-600" />
    <label htmlFor={id} className="text-sm cursor-pointer font-medium text-gray-600">{label}</label>
  </div>
);

const StepDot = ({ done, active, label }: { done?: boolean; active?: boolean; label: string }) => (
  <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center relative z-10 ${done ? 'bg-red text-white' : active ? 'bg-white border-2 border-red text-red' : 'bg-white border-2 border-gray-200 text-gray-400'
    }`}>
    {done ? '✓' : label}
  </div>
);
