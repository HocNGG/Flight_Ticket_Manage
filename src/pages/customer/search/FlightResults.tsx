import { Plane, ArrowRight, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAllFlights, useSearchFlights } from '../../../hooks/useFlights';
import { useSearchStore } from '../../../store/useSearchStore';
import { FlightCard } from '../../../components/customer/search/FlightCard';

const toAirportCode = (value: string) => {
  const trimmed = value.trim();
  const codeInBracket = trimmed.match(/\(([A-Za-z]{3})\)\s*$/);
  if (codeInBracket) return codeInBracket[1].toUpperCase();
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();
  return trimmed.toUpperCase();
};

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
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md animate-fadeIn" onClick={() => setIsEditing(false)} />
          
          <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] w-full max-w-5xl z-10 overflow-hidden animate-slideUp border border-white/20">
            <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red rounded-2xl flex items-center justify-center shadow-lg shadow-red/20">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Update search</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Change your route</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red hover:rotate-90 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-8">
                
                {/* HÀNG 1: DEPARTURE - DESTINATION - PASSENGERS */}
                <div className="lg:col-span-4 flex flex-col">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">Departure</label>
                  <div className="h-[72px]">
                    <AirportDropdown 
                    value={from} 
                    onChange={setFrom} 
                    options={airports} 
                    icon={<PlaneTakeoff className="text-red" />} />
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">Destination</label>
                  <div className="h-[72px]">
                    <AirportDropdown 
                    value={to} 
                    onChange={setTo} 
                    options={airports} 
                    icon={<PlaneLanding 
                    className="text-gold1" />} />
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">Passengers</label>
                  <div className="h-[72px] ">
                    <PassengerInput value={passengerCount} onChange={setPassengerCount} />
                  </div>
                </div>

                <div className="lg:col-span-3 flex flex-col">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">Type</label>
                  <button
                    type="button"
                    onClick={() => { setIsRoundTrip(!isRoundTrip); if (isRoundTrip) setReturnDate(''); }}
                    className={`w-full h-[56px] rounded-2xl border-2 transition-all flex items-center justify-between px-6 ${
                      isRoundTrip ? 'border-red bg-red/5 text-red shadow-inner' : 'border-gray-100 bg-white text-gray-400'
                    }`}
                  >
                    <span className="text-xs font-black uppercase">RoundTrip</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${isRoundTrip ? 'bg-red' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isRoundTrip ? 'right-1' : 'left-1'}`} />
                    </div>
                  </button>
                </div>

                <div className="lg:col-span-6 flex flex-col">
                  <DateInput 
                    departureDate={departureDate} 
                    returnDate={returnDate} 
                    isRoundTrip={isRoundTrip} 
                    onDepartureDateChange={setDepartureDate} 
                    onReturnDateChange={setReturnDate} 
                  ></DateInput>
                </div>

                <div className="lg:col-span-3 flex flex-col justify-end">
                  <div className="h-[72px]">
                    <button
                      onClick={handleUpdateSearch}
                      disabled={!canSearch}
                      className={`w-full h-full rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3 transition-all ${
                        canSearch 
                          ? 'bg-red text-white hover:bg-red-600 shadow-xl shadow-red/20 active:scale-95' 
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      UPDATE <ArrowRight size={20} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
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
            <div className="space-y-5 items-center justify-center ">
              {filteredFlights.map((flight) => (
                <FlightCard
                  key={flight.flightId}
                  flight={flight}
                  onSelect={() => navigate(`/detail/${flight.flightId}`)}
                />
              ))}
              <div className="flex justify-center mt-6">
              <button
                onClick={handleShowAllFlights}
                disabled={isFetchingAllFlights}
                className={` rounded-full px-6 py-2.5 text-sm font-bold transition-colors ${isFetchingAllFlights
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-red text-white hover:bg-reddark'
                  }`}
              >
                {isFetchingAllFlights ? 'Đang tải toàn bộ chuyến bay...' : 'Hiển thị toàn bộ chuyến bay'}
              </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

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
