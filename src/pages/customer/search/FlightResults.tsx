import { useState } from 'react';
import { Plane, ArrowRight, Check, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FlightResults = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-6 pb-24">
      
      {/* Search Query Summary / Change Search Pill */}
      <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between mb-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-[#C9111E]" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Origin</p>
              <p className="font-bold text-gray-900">London (LHR)</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</p>
              <p className="font-bold text-gray-900">Tokyo (HND)</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Departure</p>
            <p className="font-bold text-gray-900">Oct 24, 2024</p>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">Available Journeys</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Showing 42 flight options for your selection.</p>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0 text-sm font-semibold text-gray-600">
              <span className="uppercase text-[10px] font-bold text-gray-400 tracking-widest">Sort by:</span>
              <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
                Best Price <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <FlightCard 
              airline="Editorial Air" 
              flightCode="EA 702"
              departure="11:20" 
              arrival="09:05" 
              origin="London (LHR)" 
              destination="Tokyo (HND)"
              duration="13H 45M"
              stops="1 Stop (DXB)"
              price="£842"
              tag="BEST PRICE"
              logo="text-[#C9111E] bg-red-50"
            />
            
            <FlightCard 
              airline="Kinetic Global" 
              flightCode="KG 88"
              departure="14:00" 
              arrival="08:50" 
              origin="London (LHR)" 
              destination="Tokyo (HND)"
              duration="11H 50M"
              stops="NON-STOP"
              price="£1,250"
              tag="PREMIUM DIRECT"
              tagColor="bg-[#e2b868]/20 text-[#9e7622]"
              logo="text-yellow-600 bg-yellow-50"
            />

            {/* Stepper Divider */}
            <div className="flex items-center justify-between w-full relative py-6 my-2">
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200"></div>
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[35%] h-0.5 bg-[#C9111E]"></div>
               
               <div className="w-6 h-6 rounded-full bg-[#C9111E] text-white flex items-center justify-center relative z-10"><Check className="w-3 h-3"/></div>
               <div className="w-6 h-6 rounded-full bg-white border-2 border-[#C9111E] text-[#C9111E] text-[10px] font-bold flex items-center justify-center relative z-10 bg-white">02</div>
               <div className="w-6 h-6 rounded-full bg-white text-gray-400 text-[10px] font-bold flex items-center justify-center relative z-10 border-2 border-gray-200">03</div>
               <div className="w-6 h-6 rounded-full bg-white text-gray-400 text-[10px] font-bold flex items-center justify-center relative z-10 border-2 border-gray-200">04</div>
               
               <span className="relative z-10 bg-[#f6f6f6] pl-4 text-[10px] font-bold uppercase tracking-widest text-[#121212]">Step 2: Selection</span>
            </div>

            <FlightCard 
              airline="Editorial Air" 
              flightCode="EA 705"
              departure="18:45" 
              arrival="17:05" 
              origin="London (LHR)" 
              destination="Tokyo (HND)"
              duration="15H 20M"
              stops="1 Stop (DXB)"
              price="£715"
              tag="ECONOMY SAVER"
              logo="text-[#C9111E] bg-red-50"
            />

            <div className="flex justify-center pt-8">
              <button className="text-[#C9111E] font-bold text-sm tracking-wider flex items-center gap-2 hover:opacity-80 transition-opacity">
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
    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${checked ? 'bg-[#C9111E] border-[#C9111E]' : 'border-gray-300 bg-white'}`}>
      {checked && <Check className="w-3 h-3 text-white" />}
    </div>
    <label htmlFor={id} className={`text-sm cursor-pointer ${checked ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{label}</label>
  </div>
);

const FlightCard = ({ airline, flightCode, departure, arrival, origin, destination, duration, stops, price, tag, tagColor = "text-gray-500", logo }: any) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-shadow border border-transparent hover:border-[#C9111E]/10 flex flex-col md:flex-row items-center relative overflow-hidden group">
      {/* Flight info */}
      <div className="flex items-center flex-1 w-full flex-wrap gap-6 md:gap-0">
        
        {/* Airline Logo & Name */}
        <div className="w-[120px] flex flex-col justify-center items-center text-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${logo}`}>
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <span className="text-xs font-bold text-gray-900 leading-tight block">{airline}</span>
          <span className="text-[10px] text-gray-400 font-medium block">{flightCode}</span>
        </div>

        {/* Departure */}
        <div className="flex-1 min-w-[100px] text-center md:text-left md:pl-8">
          <div className="text-2xl font-black text-gray-900">{departure}</div>
          <div className="text-sm text-gray-500 font-medium">{origin}</div>
        </div>

        {/* Visual Line */}
        <div className="flex-1 min-w-[140px] px-4 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-[#b48721] mb-1">{duration}</span>
          <div className="w-full h-0.5 bg-gray-200 relative flex items-center justify-center">
            {stops !== 'NON-STOP' && <div className="w-1.5 h-1.5 rounded-full bg-[#C9111E] absolute"></div>}
            {stops === 'NON-STOP' && <div className="w-full h-0.5 bg-[#C9111E] absolute"></div>}
          </div>
          <span className={`text-[10px] font-bold mt-1 ${stops === 'NON-STOP' ? 'text-[#C9111E]' : 'text-gray-400'}`}>{stops}</span>
        </div>

        {/* Arrival */}
        <div className="flex-1 min-w-[100px] text-center md:text-left md:pl-4 relative">
          <div className="text-2xl font-black text-gray-900">{arrival} <sup className="text-xs text-[#C9111E] font-bold">+1</sup></div>
          <div className="text-sm text-gray-500 font-medium">{destination}</div>
        </div>
      </div>

      {/* Pricing and Action */}
      <div className="w-full md:w-auto flex items-center justify-between md:flex-col md:items-end md:pl-8 md:border-l border-gray-100 mt-6 md:mt-0 pt-6 md:pt-0">
        <div className="absolute top-4 right-6 text-[10px] font-bold uppercase tracking-widest text-right">
          <span className={tagColor === "text-gray-500" && tag === "BEST PRICE" ? "text-gray-500" : tagColor}>{tag}</span>
        </div>
        
        <div className="text-right mt-2">
          <div className="text-3xl font-black text-gray-900">{price}</div>
        </div>
        
        <div className="flex items-center gap-4 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-4 h-4 rounded border border-gray-300"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Compare</span>
          </label>
          <button onClick={() => navigate('/detail/ea-702')} className="bg-[#C9111E] text-white hover:bg-[#A50D17] transition-colors rounded-full px-6 py-2.5 font-bold text-sm">
            Select Flight
          </button>
        </div>
      </div>
    </div>
  );
};
