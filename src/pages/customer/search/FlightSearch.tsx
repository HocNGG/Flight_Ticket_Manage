import { ArrowRight, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DateInput from '../../../components/customer/search/DateInput';
import PassengerInput from '../../../components/customer/search/PassengerInput';
import type { AirportGeneral } from '../../../types/flight/airport';
import airportApi from '../../../api/airportApi';
import flightApi from '../../../api/flightApi';
import AirportDropdown from '../../../components/customer/search/AirportDropdownProp';
import type { FlightSearchRequest } from '../../../types/flight/flight';

export const FlightSearch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [passengerCount,setPassengerCount]=useState(1);
  const [airports, setAirports] = useState<AirportGeneral[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const airportRes = await airportApi.getAirportsGeneral();
        setAirports(airportRes.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally
      {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    const searchData: FlightSearchRequest = {
      departure: from,
      arrival: to,
      departureDate: departureDate, 
      passengerCount: passengerCount, 
      isRoundTrip: isRoundTrip,
      returnDate: isRoundTrip ? returnDate : undefined
    };

    const response = await flightApi.searchFlight(searchData);
    if (response.data) {
      const query = new URLSearchParams({
        from,
        to,
        date: departureDate,
        passengerCount:passengerCount.toString()
      });
      if (isRoundTrip && returnDate) query.append('return', returnDate);
      navigate(`/results?${query.toString()}`);
    }
  };
  
  const canSearch = from !== '' && to !== '' && departureDate !== '';
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center bg-[#f9fafb]">
        {/* Vòng xoay Spinner */}
        <div className="w-16 h-16 border-4 border-gray-200 border-t-red rounded-full animate-spin mb-4"></div>
        {/* Chữ nhấp nháy */}
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">
          Đang chuẩn bị chuyến bay...
        </p>
      </div>
    );
  }
  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full max-w-[1280px] mx-auto px-6 py-16 flex flex-col items-center relative">
        {/* Background decorative elements or text could go here */}

        <h1 className="text-5xl md:text-[5rem] font-black tracking-tighter uppercase text-center mb-4 leading-none text-dark">
          WHERE TO <span className="text-red italic">NEXT?</span>
        </h1>
        <p className="text-gray-500 font-medium text-lg text-center max-w-lg mb-12">
          Experience the kinetic horizon. Redefining the velocity of your journey with editorial precision.
        </p>

        {/* Search Form Pill */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-black/5 p-6 w-full max-w-5xl z-10 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            {/* Departure */}
            <div className="relative ">
              <label className="text-[11px] uppercase font-bold tracking-widest block mb-2 px-1">Departure</label>
              <AirportDropdown 
                value={from} 
                onChange={setFrom} 
                options={airports}
                placeholder="City or Airport"
                icon={<PlaneTakeoff className="w-5 h-5 text-red" />} 
              />
            </div>

            {/* Destination */}
            <div className="relative">
              <label className="text-[11px] uppercase font-bold tracking-widest block mb-2 px-1">Destination</label>
              <AirportDropdown 
                value={to} 
                onChange={setTo} 
                options={airports}
                placeholder="Where are you heading"
                icon={<PlaneLanding className="w-5 h-5 text-gold1" />} 
              />
            </div>
            <div className="relative flex flex-col justify-end ">
              <label className="text-[11px] uppercase font-bold tracking-widest block mb-2 px-1 text-gray-400">Travelers</label>
              <PassengerInput 
                value={passengerCount} 
                onChange={setPassengerCount} 
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="w-full md:w-32 shrink-0">
              <label className="text-[11px] uppercase font-bold tracking-widest block mb-2 px-1 text-gray-400 text-left">Type</label>
              <button
                type="button"
                onClick={() => {
                  const nextState = !isRoundTrip;
                  setIsRoundTrip(nextState);
                  if (!nextState) setReturnDate('');
                }}
                className={`w-full h-14 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                  isRoundTrip ? 'border-red bg-red/5 text-red' : 'border-gray-100 bg-surface text-gray-400 hover:border-gray-200'
                }`}
              >
                <span className="text-[9px] font-black uppercase leading-none">Round Trip</span>
                <div className={`w-7 h-3.5 rounded-full relative transition-colors ${isRoundTrip ? 'bg-red' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all ${isRoundTrip ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </button>
            </div>
            {/* Dates */}
            <DateInput
              departureDate={departureDate}
              returnDate={returnDate}
              isRoundTrip={isRoundTrip}
              onDepartureDateChange={setDepartureDate}
              onReturnDateChange={setReturnDate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="col-span-1 md:col-span-3 relative mt-4 md:mt-0">
              <button
                onClick={handleSearch}
                disabled={!canSearch}
                className={`w-full rounded-xl h-14 font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
                  canSearch
                    ? 'bg-red text-white hover:bg-red-700 shadow-lg shadow-red/20'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Search Flights
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Destinations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mt-16 pb-20">
          <DestinationCard city="London" price="$499" imgBg="bg-blue-200" />
          <DestinationCard city="Sydney" price="$820" imgBg="bg-indigo-950" />
          <DestinationCard city="Tokyo" price="$675" imgBg="bg-red-100" />
          <DestinationCard city="Dubai" price="$540" imgBg="bg-amber-100" />
        </div>
      </div>
    </div>
  );
};

const DestinationCard = ({ city, price, imgBg }: { city: string, price: string, imgBg: string }) => (
  <div className="bg-white rounded-[2rem] p-4 shadow-md shadow-black/5 hover:shadow-xl transition-shadow cursor-pointer flex flex-col group border border-transparent hover:border-gray-100">
    <div className={`w-full aspect-[4/5] rounded-[1.5rem] ${imgBg} mb-4 overflow-hidden relative`}>
      {/* Real app would have actual images */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
    </div>
    <div className="px-2 pb-2">
      <h3 className="font-black text-lg text-gray-900 leading-tight">{city}</h3>
      <p className="text-red text-xs font-bold uppercase tracking-wider mt-1">From {price}</p>
    </div>
  </div>
);
