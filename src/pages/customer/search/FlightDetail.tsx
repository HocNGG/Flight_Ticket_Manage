import { ArrowLeft, PlaneTakeoff, PlaneLanding, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { policies } from '../../../data/flightPolicies';
import { Policies } from '../../../components/customer/detail/Policies';
import { AmenitiesFeatures } from '../../../components/customer/detail/AmenitiesFeatures';

export const FlightDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-6 pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest mb-8">
        <ArrowLeft className="w-4 h-4 text-red" />
        Back to search results
      </button>

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

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left Column - Flight Details */}
        <div className="flex-1 space-y-6">

          {/* Main Flight Info Card */}
          <div className="bg-[#fcfcfc] rounded-[2rem] p-8 border border-gray-100 flex flex-col md:flex-row shadow-sm">
            <div className="flex-1 flex flex-col relative pb-8 md:pb-0 md:pr-8 md:border-r border-gray-200 border-dashed">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 rounded-2xl bg-red text-white flex items-center justify-center flex-shrink-0">
                  <PlaneTakeoff className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tight">London</h2>
                  <p className="text-gray-500 font-medium">Heathrow International (LHR)</p>
                </div>
              </div>

              {/* Vertical connecting line on mobile, decorative plane mostly */}
              <div className="absolute left-8 top-16 bottom-16 w-0.5 bg-gray-200 hidden md:block">
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-white flex items-center justify-center text-gold">
                  <PlaneTakeoff className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-200 text-gray-500 flex items-center justify-center flex-shrink-0">
                  <PlaneLanding className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tight">New York</h2>
                  <p className="text-gray-500 font-medium">John F. Kennedy (JFK)</p>
                </div>
              </div>
            </div>

            <div className="md:w-64 pt-8 md:pt-0 md:pl-8 flex flex-col justify-center relative justify-between py-4">
              <div className="absolute top-0 right-0 bg-white rounded-full px-3 py-1 text-[10px] font-bold text-gray-900 shadow-sm border border-gray-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold"></div>
                FLIGHT EA-402
              </div>

              <div className="flex justify-between items-end mb-8 mt-6 md:mt-0">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Departure</p>
                  <p className="text-3xl font-black text-gray-900">08:45 <span className="text-sm font-bold text-gray-400">AM</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Arrival</p>
                  <p className="text-2xl font-black text-gray-500">11:55 <span className="text-sm font-bold text-gray-400">AM</span></p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <span className="text-xl">⏱</span> 7h 10m
                </div>
                <div className="bg-[#f0e6d2] text-gold text-[10px] font-bold px-3 py-1 rounded">
                  NON-STOP
                </div>
              </div>
            </div>
          </div>

          <AmenitiesFeatures />
          <Policies policies={policies} />

        </div>

        {/* Right Column - Booking Summary Form */}
        <aside className="w-full lg:w-[400px] flex-shrink-0 space-y-6">

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
            <div className="bg-red p-8 text-white relative overflow-hidden">
              {/* Decorative background shape */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>

              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Total Fare</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-medium tracking-tighter mr-2">$</span>
                <span className="text-6xl font-black tracking-tighter">1,248</span>
                <span className="text-xl font-bold ml-1">.50</span>
              </div>
            </div>

            <div className="p-8 pb-4">
              <div className="space-y-4 text-sm font-medium border-b border-gray-100 pb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Base Fare (1 Adult)</span>
                  <span className="text-gray-900 font-bold">$1,080.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxes and Fees</span>
                  <span className="text-gray-900 font-bold">$168.50</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-6 border-b border-gray-100">
                <span className="text-[11px] font-bold uppercase tracking-widest text-red">Seat Selection</span>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">Free Choice</span>
              </div>

              <button
                onClick={() => navigate('/booking/seat')}
                className="w-full mt-6 bg-red text-white hover:bg-reddark transition-colors rounded-xl h-14 font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-red/30"
              >
                Book This Flight
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="bg-[#fcfcfc] rounded-xl p-4 mt-6 border border-gray-100 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-1">Best Price Guarantee</p>
                  <p className="text-[10px] text-gray-500">Find it cheaper elsewhere and we'll refund the difference.</p>
                </div>
              </div>

              <div className="flex justify-center gap-6 mt-6 pb-2">
                <div className="text-center text-gray-400">
                  <span className="text-lg block mb-1">💳</span>
                  <span className="text-[8px] font-bold">SECURE</span>
                </div>
                <div className="text-center text-gray-400">
                  <span className="text-lg block mb-1">✔️</span>
                  <span className="text-[8px] font-bold">OFFICIAL</span>
                </div>
                <div className="text-center text-gray-400">
                  <span className="text-lg block mb-1">🎧</span>
                  <span className="text-[8px] font-bold">24/7 HELP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] overflow-hidden relative shadow-lg group cursor-pointer border border-transparent hover:border-dark/10 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/90 to-transparent z-10"></div>
            <img src="https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&q=80" alt="Wing" className="w-full h-[200px] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute bottom-6 left-6 right-6 z-20">
              <h3 className="text-2xl font-black text-white leading-tight mb-2">Your gateway to the world.</h3>
              <p className="text-white/80 text-[10px] font-bold tracking-widest uppercase">Fly Editorial Premium</p>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};
