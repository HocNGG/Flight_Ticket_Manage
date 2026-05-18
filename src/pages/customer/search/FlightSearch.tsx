import { ArrowRight, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DateInput from '../../../components/customer/search/DateInput';
import PassengerInput from '../../../components/customer/search/PassengerInput';
import CabinInput from '../../../components/customer/search/CabinInput';
import { useAirports } from '../../../hooks/useFlights';
import { useSearchStore } from '../../../store/useSearchStore';

const toAirportCode = (value: string) => {
  const trimmed = value.trim();
  const codeInBracket = trimmed.match(/\(([A-Za-z]{3})\)\s*$/);
  if (codeInBracket) return codeInBracket[1].toUpperCase();
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();
  return '';
};

const getTodayDate = () => new Date().toISOString().slice(0, 10);

export const FlightSearch = () => {
  const navigate = useNavigate();
  const { setSearchParams } = useSearchStore();

  // Local form state — chỉ dùng trong trang này
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [seatClass, setSeatClass] = useState<'ECONOMY' | 'BUSINESS' | 'FIRST'>('ECONOMY');

  // React Query: gọi 1 lần khi mount, cache 30 phút
  const { isLoading: loadingAirports } = useAirports();

  // airports & airportOptions sẽ dùng khi DropdownInputOff được nâng cấp nhận prop options

  // canSearch: không cho search khi airports chưa tải hoặc form chưa điền đủ
  const departureCode = toAirportCode(departure);
  const arrivalCode = toAirportCode(arrival);
  const isValidDate = departureDate !== '' && departureDate >= getTodayDate();
  const canSearch = !loadingAirports
    && departureCode !== ''
    && arrivalCode !== ''
    && departureCode !== arrivalCode
    && isValidDate;

  const handleSearch = () => {
    if (!canSearch) return;
    const params = { departure: departureCode, arrival: arrivalCode, departureDate, passengerCount, seatClass };

    // Lưu vào Zustand để FlightResults + FlightDetail dùng lại
    setSearchParams(params);

    // Navigate với URL params — user có thể F5 hoặc copy link
    const query = new URLSearchParams({
      departure: departureCode,
      arrival: arrivalCode,
      departureDate,
      passengerCount: String(passengerCount),
      seatClass,
    });
    navigate(`/results?${query.toString()}`);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full max-w-[1280px] mx-auto px-6 py-16 flex flex-col items-center relative">

        <h1 className="text-5xl md:text-[5rem] font-black tracking-tighter uppercase text-center mb-4 leading-none text-dark">
          WHERE TO <span className="text-red italic">NEXT?</span>
        </h1>
        <p className="text-gray-500 font-medium text-lg text-center max-w-lg mb-12">
          Experience the kinetic horizon. Redefining the velocity of your journey with editorial precision.
        </p>

        {/* Search Form */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-black/5 p-6 w-full max-w-5xl z-10 border border-gray-100">
          {/* Row 1: Departure, Arrival, Dates */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="col-span-1 md:col-span-1 relative">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Departure</label>
              <DropdownInputOff value={departure} onChange={setDeparture} />
            </div>

            <div className="col-span-1 md:col-span-1 relative">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Destination</label>
              <DropdownInputLanding value={arrival} onChange={setArrival} />
            </div>

            <DateInput
              departureDate={departureDate}
              returnDate={''}
              onDepartureDateChange={setDepartureDate}
              onReturnDateChange={() => { }}
            />
          </div>

          {/* Row 2: Passengers, Cabin, Search button */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <PassengerInput value={passengerCount} onChange={setPassengerCount} />
            <CabinInput value={seatClass} onChange={(val) => setSeatClass(val as 'ECONOMY' | 'BUSINESS' | 'FIRST')} />

            <div className="col-span-1 md:col-span-2 relative mt-4 md:mt-0">
              <button
                onClick={handleSearch}
                disabled={!canSearch}
                className={`w-full rounded-xl h-14 font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-colors ${canSearch
                    ? 'bg-red text-white hover:bg-reddark'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Search Flights
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mt-16 pb-20">
          <DestinationCard city="Hà Nội" code="HAN" price="1,200,000 ₫" imgBg="bg-blue-200" />
          <DestinationCard city="Đà Nẵng" code="DAD" price="890,000 ₫" imgBg="bg-indigo-950" />
          <DestinationCard city="Phú Quốc" code="PQC" price="1,450,000 ₫" imgBg="bg-red-100" />
          <DestinationCard city="TP. HCM" code="SGN" price="750,000 ₫" imgBg="bg-amber-100" />
        </div>
      </div>
    </div>
  );
};

const DestinationCard = ({
  city,
  code,
  price,
  imgBg,
}: {
  city: string;
  code: string;
  price: string;
  imgBg: string;
}) => (
  <div className="bg-white rounded-[2rem] p-4 shadow-md shadow-black/5 hover:shadow-xl transition-shadow cursor-pointer flex flex-col group border border-transparent hover:border-gray-100">
    <div className={`w-full aspect-[4/5] rounded-[1.5rem] ${imgBg} mb-4 overflow-hidden relative`}>
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-700">
        {code}
      </div>
    </div>
    <div className="px-2 pb-2">
      <h3 className="font-black text-lg text-gray-900 leading-tight">{city}</h3>
      <p className="text-red text-xs font-bold uppercase tracking-wider mt-1">Từ {price}</p>
    </div>
  </div>
);
