import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DropdownInputOff from '../../../components/customer/search/DropdownInputOff';
import DropdownInputLanding from '../../../components/customer/search/DropdownInputHeading';
import DateInput from '../../../components/customer/search/DateInput';
import PassengerInput from '../../../components/customer/search/PassengerInput';
import CabinInput from '../../../components/customer/search/CabinInput';

export const FlightSearch = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const handleSearch = () => {
    const query = new URLSearchParams({
      from,
      to,
      date: departureDate,
      return: returnDate,
    });
    navigate(`/results?${query.toString()}`);
  };

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Departure */}
            <div className="col-span-1 md:col-span-1 relative">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Departure</label>
              <DropdownInputOff value={from} onChange={setFrom} />
            </div>

            {/* Destination */}
            <div className="col-span-1 md:col-span-1 relative">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Destination</label>
              <DropdownInputLanding value={to} onChange={setTo} />
            </div>

            {/* Dates */}
            <DateInput
              departureDate={departureDate}
              returnDate={returnDate}
              onDepartureDateChange={setDepartureDate}
              onReturnDateChange={setReturnDate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <PassengerInput />

            <CabinInput />

            <div className="col-span-1 md:col-span-2 relative mt-4 md:mt-0">
              <button
                onClick={handleSearch}
                className="w-full bg-red text-white hover:bg-reddark transition-colors rounded-xl h-14 font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2"
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
