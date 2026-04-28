import { Plane, ArrowRight, Check, Search,X, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FlightCard } from '../../../components/customer/search/FlightCard';
import type { FlightDTO, FlightSearchResponse } from '../../../types/flight/flight';
import { useEffect, useState } from 'react';
import flightApi from '../../../api/flightApi';
import airportApi from '../../../api/airportApi';
import PassengerInput from '../../../components/customer/search/PassengerInput';
import AirportDropdown from '../../../components/customer/search/AirportDropdownProp';
import type { AirportGeneral } from '../../../types/flight/airport';
import DateInput from '../../../components/customer/search/DateInput';

export const FlightResults = () => {
  const navigate = useNavigate();
  const [searchParams,setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);

  const [flightData, setFlightData] = useState<FlightSearchResponse | null>(null);
  const [airports, setAirports] = useState<AirportGeneral[]>([]);

  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [loading, setLoading] = useState(true);

  const [currentStep, setCurrentStep] = useState<'outbound' | 'inbound'>('outbound');
  const [selectedOutbound, setSelectedOutbound] = useState<any>(null);
  
  const initialFrom = searchParams.get('from') || '';
  const initialTo = searchParams.get('to') || '';
  const initialDate = searchParams.get('date') || '';
  const initialReturn = searchParams.get('return') || '';
  const initialPax = searchParams.get('passengerCount') || '1';
  const initialRoundTrip = searchParams.get('roundTrip') === 'true';

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [departureDate, setDepartureDate] = useState(initialDate);
  const [returnDate, setReturnDate] = useState(initialReturn);
  const [passengerCount, setPassengerCount] = useState(1);
  const [isRoundTrip, setIsRoundTrip] = useState(initialRoundTrip);
  
  const canSearch = from && to && departureDate && (!isRoundTrip || returnDate);

  const handleUpdateSearch = () => {
    const newParams = new URLSearchParams({
      from: from,
      to: to,
      date: departureDate,
      return: isRoundTrip ? returnDate : '',
      passengerCount: passengerCount.toString(),
      roundTrip: isRoundTrip.toString(),
    });
    setSearchParams(newParams); 
    setIsEditing(false);
    setCurrentStep('outbound'); 
    setSelectedOutbound(null);
  };

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        const [flightResponse, departureResponse,arrivalResponse,airportResponse] = await Promise.all([
          flightApi.searchFlight({
            departure: initialFrom,
            arrival: initialTo,
            departureDate: initialDate,
            passengerCount: parseInt(initialPax), 
            roundTrip: initialRoundTrip,
            returnDate: initialReturn || undefined
          }),
          airportApi.getAirportsByCode(initialFrom),
          airportApi.getAirportsByCode(initialTo),
          airportApi.getAirportsGeneral()
        ]);
        setFlightData(flightResponse.data);
        setDepartureCity(departureResponse.data.city);
        setArrivalCity(arrivalResponse.data.city);
        setAirports(airportResponse.data);
      } catch (error) {
        console.error("Lỗi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    if (initialFrom && initialTo && initialDate) {
      fetchFlights();
    }
  }, [initialFrom, initialTo, initialDate, initialRoundTrip, initialReturn, initialPax]);

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
  const handleSelectFlight = (flight: FlightDTO) => {
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
      origin: currentStep === 'outbound' ? initialFrom : initialTo,
      destination: currentStep === 'outbound' ? initialTo : initialFrom,
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
      <div className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-red" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Origin</p>
                <p className="font-bold text-gray-900">{departureCity}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-3">
              <Plane className="w-5 h-5 text-gold" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</p>
                <p className="font-bold text-gray-900">{arrivalCity}</p>
              </div>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-gray-100 hidden md:block" />
          <div className="hidden md:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Departure Date</p>
            <p className="font-bold  text-gray-700">{formatDate(initialDate)}</p>
          </div>
          <div className="h-8 w-[1px] bg-gray-100 hidden md:block" />
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Passengers</p>
            <p className="font-bold text-gray-900">
              {passengerCount} {'Pax'} 
            </p>
          </div>
          <div className="h-8 w-[1px] bg-gray-100 hidden md:block" />
          {!initialRoundTrip ? (
            <div className="hidden md:block">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Departure Date</p>
              <p className="font-bold  text-gray-700">No return date</p>
            </div>
          ) : (
            <div className="hidden md:block">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Return Date</p>
              <p className="font-bold  text-gray-700">{formatDate(initialReturn)}</p>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setIsEditing(true)} 
          className="w-full md:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
        >
          <Search size={16} /> Modify Search
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
          {/* Vé đã chọn  */}
          {selectedOutbound && currentStep === 'inbound' && (
            <div className="mb-6 animate-slideDown">
              <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-6">Selected Outbound</h1>
              <div className="bg-red/5 border border-red/20 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm font-black text-red text-xs">
                    {selectedOutbound.flightNumber}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{formatDate(selectedOutbound.departureTime)} → {formatDate(selectedOutbound.arrivalTime)}</p>
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
