import { Plane, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FlightCard, type FlightCardProps } from '../../../components/customer/search/FlightCard';
import type { FlightSearchResponse } from '../../../types/flight/flight';
import { useEffect, useState } from 'react';
import flightApi from '../../../api/flightApi';

export const FlightResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [flightData, setFlightData] = useState<FlightSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // const passengers = searchParams.get('passengers') || '1 Passenger';
  // const seatClass = searchParams.get('class') || 'Economy';
  const originResult = searchParams.get('from') || 'London (LHR)';
  const destinationResult = searchParams.get('to') || 'Tokyo (HND)';
  const departureDateParam = searchParams.get('date') || '';
  const isRoundTrip = searchParams.get('roundTrip') === 'true';
  const returnDateParam = searchParams.get('return') || '';

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        const response = await flightApi.searchFlight({
          departure: originResult,
          arrival: destinationResult,
          departureDate: departureDateParam,
          passengerCount: 1,
          isRoundTrip: isRoundTrip,
          returnDate: returnDateParam || undefined
        });
        setFlightData(response.data);
      } catch (error) {
        console.error("Lỗi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    if (originResult && destinationResult && departureDateParam) {
      fetchFlights();
    }
  }, [originResult, destinationResult, departureDateParam, isRoundTrip, returnDateParam]);

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

  const departureDate = formatDate(departureDateParam);

  const flights: FlightCardProps[] = flightData ? flightData.results.flatMap((group) => 
    group.outboundFlights.map((f) => ({
      airline: group.airlineName,
      flightCode: f.flightNumber,
      departure: new Date(f.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      arrival: new Date(f.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      origin: originResult,
      destination: destinationResult,
      duration: f.duration || 'N/A',
      stops: 'NON-STOP', 
      price: f.seats?.seatsByClass?.['Economy'] 
        ? `₫${f.seats.seatsByClass['Economy'].price.toLocaleString()}` 
        : 'Contact',
      tag: 'BEST PRICE',
      logo: 'text-red bg-red-50',
      detailPath: `/detail/${f.flightId}`,
    }))
  ) : [];
  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-6 pb-24">

      {/* Search Query Summary / Change Search Pill */}
      <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between mb-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-red" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Origin</p>
              <p className="font-bold text-gray-900">{originResult}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-gold" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</p>
              <p className="font-bold text-gray-900">{destinationResult}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Departure From</p>
            <p className="font-bold text-gray-900">{departureDate}</p>
          </div>
          <button onClick={() => navigate('/search')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <span className="text-gray-600 text-sm">✎</span>
          </button>
        </div>
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
           {/* Stepper Divider */}
            <div className="flex items-center justify-between w-full relative py-6 my-2">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[35%] h-0.5 bg-red"></div>

              <div className="w-6 h-6 rounded-full bg-red text-white flex items-center justify-center relative z-10"><Check className="w-3 h-3" /></div>
              <div className="w-6 h-6 rounded-full bg-white border-2 border-red text-red text-[10px] font-bold flex items-center justify-center relative z-10 bg-white">02</div>
              <div className="w-6 h-6 rounded-full bg-white text-gray-400 text-[10px] font-bold flex items-center justify-center relative z-10 border-2 border-gray-200">03</div>
              <div className="w-6 h-6 rounded-full bg-white text-gray-400 text-[10px] font-bold flex items-center justify-center relative z-10 border-2 border-gray-200">04</div>

              <span className="relative z-10 bg-surface pl-4 text-[10px] font-bold uppercase tracking-widest text-dark">Step 2: Selection</span>
            </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">Available Journeys</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Showing {flightData?.totalResults} flight options for your selection.</p>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0 text-sm font-semibold text-gray-600">
              <span className="uppercase text-[10px] font-bold text-gray-400 tracking-widest">Sort by:</span>
              <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
                Best Price <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-5">
           {loading ? (
            // Hiển thị Spinner hoặc Skeleton tại đây
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-12 h-12 border-4 border-red/20 border-t-red rounded-full animate-spin mb-4" />
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Đang tìm chuyến bay tốt nhất...</p>
            </div>
          ) : (
            // Khi hết loading mới hiển thị danh sách flights.map(...)
            <div className="space-y-5">
              {flights.map(f => <FlightCard {...f} />)}
            </div>
          )}

            <div className="flex justify-center pt-8">
              <button className="text-red font-bold text-sm tracking-wider flex items-center gap-2 hover:opacity-80 transition-opacity">
                View More Flights <ChevronDown className="w-4 h-4" />
              </button>
            </div>
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
