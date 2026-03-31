import { PlaneTakeoff, PlaneLanding, CalendarDays, Users, ChevronDown, ArrowRight } from 'lucide-react';

export const FlightSearch = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full max-w-[1280px] mx-auto px-6 py-16 flex flex-col items-center relative">
        {/* Background decorative elements or text could go here */}
        
        <h1 className="text-5xl md:text-[5rem] font-black tracking-tighter uppercase text-center mb-4 leading-none text-[#121212]">
          WHERE TO <span className="text-[#C9111E] italic">NEXT?</span>
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
              <div className="relative">
                <PlaneTakeoff className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C9111E]" />
                <input 
                  type="text" 
                  placeholder="City or Airport" 
                  className="w-full bg-[#f6f6f6] rounded-xl h-14 pl-12 pr-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9111E]/20"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="col-span-1 md:col-span-1 relative">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Destination</label>
              <div className="relative">
                <PlaneLanding className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Where are you heading?" 
                  className="w-full bg-[#f6f6f6] rounded-xl h-14 pl-12 pr-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9111E]/20"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Date</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="mm/dd/yyyy" 
                    className="w-full bg-[#f6f6f6] rounded-xl h-14 pl-4 pr-10 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9111E]/20"
                  />
                  <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-widest block mb-2 px-1 italic">Return</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="mm/dd/yyyy" 
                    className="w-full bg-[#f6f6f6] rounded-xl h-14 pl-4 pr-10 text-sm font-semibold text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9111E]/20"
                  />
                  <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="col-span-1 relative">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Travelers</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select className="w-full bg-[#f6f6f6] rounded-xl h-14 pl-10 pr-10 text-sm font-semibold text-gray-800 focus:outline-none appearance-none cursor-pointer">
                  <option>1 Passenger</option>
                  <option>2 Passengers</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="col-span-1 relative">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Cabin</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 flex items-center justify-center">
                  <span className="text-xs">💺</span>
                </div>
                <select className="w-full bg-[#f6f6f6] rounded-xl h-14 pl-10 pr-10 text-sm font-semibold text-gray-800 focus:outline-none appearance-none cursor-pointer">
                  <option>Economy</option>
                  <option>Premium</option>
                  <option>Business</option>
                  <option>First</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 relative mt-4 md:mt-0">
              <button 
                onClick={() => window.location.href = '/results'} 
                className="w-full bg-[#C9111E] text-white hover:bg-[#A50D17] transition-colors rounded-xl h-14 font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2"
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
      <p className="text-[#C9111E] text-xs font-bold uppercase tracking-wider mt-1">From {price}</p>
    </div>
  </div>
);
