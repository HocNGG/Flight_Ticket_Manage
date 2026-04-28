import { Plane, ArrowRight, Check, Search,X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FlightCard } from '../../../components/customer/search/FlightCard';
import type { FlightSearchResponse } from '../../../types/flight/flight';
import { useEffect, useState } from 'react';
import flightApi from '../../../api/flightApi';
import airportApi from '../../../api/airportApi';

export const FlightResults = () => {
  const navigate = useNavigate();
  const [searchParams,setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [flightData, setFlightData] = useState<FlightSearchResponse | null>(null);
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [loading, setLoading] = useState(true);

  const [currentStep, setCurrentStep] = useState<'outbound' | 'inbound'>('outbound');
  const [selectedOutbound, setSelectedOutbound] = useState<any>(null);
  
  const passengerCount = searchParams.get('passengerCount') || '1 Passenger';
  const originResult = searchParams.get('from') || 'London (LHR)';
  const destinationResult = searchParams.get('to') || 'Tokyo (HND)';
  const departureDateParam = searchParams.get('date') || '';
  const isRoundTrip = searchParams.get('isRoundTrip') === 'true';
  const returnDateParam = searchParams.get('return') || '';

  const handleUpdateSearch = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('from', formData.get('from') as string);
    newParams.set('to', formData.get('to') as string);
    setSearchParams(newParams);
    setIsEditing(false);
    setCurrentStep('outbound'); 
  };

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        const [flightResponse, departureResponse,arrivalResponse] = await Promise.all([
          flightApi.searchFlight({
            departure: originResult,
            arrival: destinationResult,
            departureDate: departureDateParam,
            passengerCount: parseInt(passengerCount), 
            isRoundTrip: isRoundTrip,
            returnDate: returnDateParam || undefined
          }),
          airportApi.getAirportsByCode(originResult),
          airportApi.getAirportsByCode(destinationResult)
        ]);
        setFlightData(flightResponse.data);
        setDepartureCity(departureResponse.data.city);
        setArrivalCity(arrivalResponse.data.city);
      } catch (error) {
        console.error("Lỗi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    if (originResult && destinationResult && departureDateParam) {
      fetchFlights();
    }
  }, [originResult, destinationResult, departureDateParam, isRoundTrip, returnDateParam,passengerCount]);

  const formatDate = (value: string) => {
    if (!value) return 'Select date';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Select date';
    return parsed.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  const handleSelectFlight = (flight: any) => {
    if (currentStep === 'outbound') {
      if (isRoundTrip) {
        setSelectedOutbound(flight);
        setCurrentStep('inbound');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Một chiều: Chuyển thẳng tới Detail hoặc Booking
        navigate(`/detail/${flight.flightId}`);
      }
    } else {

      navigate(`/detail/${selectedOutbound.flightId}?returnFlightId=${flight.flightId}&passenger=${passengerCount}`);
    }
  };
  
  const renderFlightList = () => {
    if (!flightData) return [];
    
    // Chọn danh sách theo bước
    const list = currentStep === 'outbound' 
      ? flightData.outboundFlights 
      : flightData.inboundFlights;

    return list.map((f: any) => ({
      airline: f.airline.name || "Airline",
      flightCode: f.flightNumber,
      departure: new Date(f.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      arrival: new Date(f.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      origin: currentStep === 'outbound' ? originResult : destinationResult,
      destination: currentStep === 'outbound' ? destinationResult : originResult,
      duration: f.duration || 'N/A',
      stops: 'NON-STOP',
      price: f.seats?.seatsByClass?.['Economy']?.price || 0,
      tag: 'BEST VALUE',
      logo: 'text-red bg-red-50',
      detailPath: `/detail/${f.flightId}`,
      onSelect: () => handleSelectFlight(f) 
    }));
  };
  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-6 pb-24">

      {/* Search Query Summary / Change Search Pill */}
      <div className="bg-white rounded-2xl p-4 mb-8 shadow-sm transition-all duration-500">
        {!isEditing ? (
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                 <Plane className={`w-5 h-5 ${currentStep === 'outbound' ? 'text-red' : 'text-gray-400'}`} />
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">From</p>
                   <p className="font-bold text-gray-900">{departureCity} ({originResult})</p>
                 </div>
               </div>
               <ArrowRight className="w-4 h-4 text-gray-300" />
               <div className="flex items-center gap-3">
                 <Plane className={`w-5 h-5 ${currentStep === 'inbound' ? 'text-gold' : 'text-gray-400'}`} />
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">To</p>
                   <p className="font-bold text-gray-900">{arrivalCity} ({destinationResult})</p>
                 </div>
               </div>
            </div>
            <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Passengers</p>
                  <p className="font-bold text-gray-900">
                    {passengerCount} {'Pax'} 
                  </p>
                </div>
               <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dates</p>
                 <p className="font-bold text-gray-900 text-sm">
                   {formatDate(departureDateParam)} {isRoundTrip && ` - ${formatDate(returnDateParam)}`}
                 </p>
               </div>
               <button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
               >
                 <Search className="w-3 h-3" /> MODIFY
               </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateSearch} className="flex flex-wrap gap-4 items-end animate-fadeIn">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Origin</label>
              {/* Thêm name="from" để handleUpdateSearch lấy được dữ liệu */}
              <input name="from" defaultValue={originResult} className="w-full bg-gray-50 border-none rounded-lg h-10 px-3 text-sm font-bold" />
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Destination</label>
              {/* Thêm name="to" để handleUpdateSearch lấy được dữ liệu */}
              <input name="to" defaultValue={destinationResult} className="w-full bg-gray-50 border-none rounded-lg h-10 px-3 text-sm font-bold" />
            </div>

            <button type="submit" className="h-10 px-6 bg-red text-white rounded-lg text-xs font-bold uppercase tracking-widest">
              Update Results
            </button>
            
            {/* Nút đóng Form */}
            <button 
              type="button" 
              onClick={() => setIsEditing(false)} 
              className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-lg"
              title="Close edit mode">
              <X className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm sticky top-[100px]">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Filters</h2>

            <div className="mb-8">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Stops</h3>
              <div className="space-y-3">
                <Checkbox label="Non-stop" id="s-0" />
                <Checkbox label="1 Stop" id="s-1" checked />
                <Checkbox label="2+ Stops" id="s-2" />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Airlines</h3>
              <div className="space-y-3">
                <Checkbox label="Editorial Air" id="a-1" checked />
                <Checkbox label="Kinetic Global" id="a-2" />
                <Checkbox label="Horizon Express" id="a-3" />
              </div>
            </div>

            {/* Promo card */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 mt-8 overflow-hidden relative">
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
              <div className="relative z-10">
                <p className="text-[#e2b868] text-[10px] font-bold uppercase tracking-widest mb-1">Exclusive</p>
                <h4 className="text-white font-bold leading-tight">Lounge Access for Gold Members</h4>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Flight List */}
        
        <main className="flex-1">
          {/* Progress Stepper */}
          <div className="flex items-center justify-between w-full relative py-6 mb-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-red transition-all duration-500" 
            ></div>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 text-[10px] font-bold border-2 transition-all ${currentStep === 'outbound' ? 'bg-red border-red text-white' : 'bg-white border-red text-red'}`}>
              {currentStep === 'inbound' ? <Check className="w-4 h-4" /> : '01'}
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 text-[10px] font-bold border-2 transition-all ${currentStep === 'inbound' ? 'bg-red border-red text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
              02
            </div>
            <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 text-[10px] font-bold flex items-center justify-center relative z-10">03</div>
            
            <span className="relative z-10 bg-surface px-4 text-[10px] font-black uppercase tracking-widest text-red">
              {currentStep === 'outbound' ? 'Step 1: Outbound Flight' : 'Step 2: Inbound Flight'}
            </span>
          </div>

          {/* Vé đã chọn (Hiển thị khi đang ở bước chọn vé về) */}
          {selectedOutbound && currentStep === 'inbound' && (
            <div className="mb-6 animate-slideDown">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Selected Outbound</p>
              <div className="bg-red/5 border border-red/20 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm font-black text-red text-xs">
                    {selectedOutbound.flightNumber}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{selectedOutbound.departureTime} → {selectedOutbound.arrivalTime}</p>
                    <p className="text-[10px] font-medium text-gray-500">{departureCity} to {arrivalCity}</p>
                  </div>
                </div>
                <button onClick={() => {setCurrentStep('outbound'); setSelectedOutbound(null);}} className="text-[10px] font-bold text-red hover:underline">CHANGE</button>
              </div>
            </div>
          )}

          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-6">
            {currentStep === 'outbound' ? 'Select Departure' : 'Select Return Flight'}
          </h1>

          <div className="space-y-4">
            {loading ? (
               <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-10 h-10 border-4 border-red/20 border-t-red rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Searching Journeys...</p>
               </div>
            ) : (
              renderFlightList().length > 0 ? (
                renderFlightList().map((f, i) => (
                  <div key={i} onClick={f.onSelect} className="cursor-pointer group">
                    <FlightCard {...f} />
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No flights found for this date</p>
                </div>
              )
            )}
          </div>
        </main>
      </div>

    </div>
  );
};

const Checkbox = ({ id, label, checked = false }: { id: string, label: string, checked?: boolean }) => (
  <div className="flex items-center gap-3">
    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${checked ? 'bg-red border-red' : 'border-gray-300 bg-white'}`}>
      {checked && <Check className="w-3 h-3 text-white" />}
    </div>
    <label htmlFor={id} className={`text-sm cursor-pointer ${checked ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{label}</label>
  </div>
);
