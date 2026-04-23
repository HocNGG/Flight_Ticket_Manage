import { ArrowLeft, PlaneTakeoff, PlaneLanding, ShieldCheck, ArrowRight, Check, Plane } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { policies } from '../../../data/flightPolicies';
import { Policies } from '../../../components/customer/detail/Policies';
import { AmenitiesFeatures } from '../../../components/customer/detail/AmenitiesFeatures';
import { useEffect, useState } from 'react';
import flightApi from '../../../api/flightApi';
import type { FlightDTO } from '../../../types/flight/flight';
import amenityApi from '../../../api/amenityApi';
export interface AmenityItem {
  type: string;
  title: string;
  description: string;
}
export const FlightDetail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const flightId = Number(id);
  const [flight, setFlight] = useState<FlightDTO|null>(null);
  const [amenities, setAmenities] = useState<AmenityItem[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flightResponse,amenityResponse] = await Promise.all([
          flightApi.getFlightDetail(flightId),
          amenityApi.getAllService()
        ]);
        const mappedData = amenityResponse.data.map((item: any) => ({
          type: item.code.toUpperCase(), 
          title: item.name,
          description: item.description
        }));
        setFlight(flightResponse.data);
        setAmenities(mappedData)
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [flightId]);
  
  const formatFlightTime = (dateInput?: string | Date) => {
    if (!dateInput) return { time: '--:--', period: '', date: '' };
    const date = new Date(dateInput);
    
    if (isNaN(date.getTime())) return { time: '--:--', period: '', date: '' };

    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).split(' ')[0];
    
    const period = date.getHours() >= 12 ? 'PM' : 'AM';
    
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return { time, period, date: formattedDate };
  };
  /**
 * Định dạng số thành chuỗi tiền tệ
 * @param amount - Số tiền cần định dạng
 * @param currency - Mã tiền tệ (VND, USD, v.v.) - Mặc định là VND
 * @param locale - Ngôn ngữ hiển thị (vi-VN, en-US, v.v.) - Mặc định là vi-VN
 */
  const formatCurrency = (
    amount: number | string | undefined,
    currency: string = 'VND',
    locale: string = 'vi-VN'
  ): string => {
    if (amount === undefined || amount === null) return '0 ₫';

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return '0 ₫';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(numericAmount);
  };
  const dep = formatFlightTime(flight?.departureTime);
  const arr = formatFlightTime(flight?.arrivalTime);
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center bg-[#f9fafb]">
        {/* Vòng xoay Spinner */}
        <div className="w-16 h-16 border-4 border-gray-200 border-t-red rounded-full animate-spin mb-4"></div>
        {/* Chữ nhấp nháy */}
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">
          Đang tải thông tin chuyến bay
        </p>
      </div>
    );
  }
  const firstClass = Object.values(flight?.seats?.seatsByClass || {})[0];
  const firstPrice = firstClass?.price ? firstClass.price : 0;
  const tax = firstPrice*0.1 || 0;
  const sumPrice = firstPrice + tax || 0;
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
          <div className="bg-[#fcfcfc] rounded-[2rem] p-10 border border-gray-100 flex flex-col md:flex-row shadow-sm gap-10">
            <div className="flex-1 flex flex-col relative pb-8 md:pb-0 md:pr-8 md:border-r border-gray-200 border-dashed">
              {/* HEADER: Flight Number & Airline */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
                    <Plane className="w-6 h-6 text-red" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                    <h3 className="text-xl font-bold text-gray-900 leading-none">
                      {flight?.airline.name}
                    </h3>
                    {/* Thanh ngăn cách giữa tên hãng và mã chuyến bay */}
                    <div className="hidden md:block w-px h-4 bg-black"></div>
                    <span className="text-sm font-bold text-red tracking-widest uppercase">
                      Flight {flight?.flightNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Điểm đi */}
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 rounded-2xl bg-red text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-red/20">
                  <PlaneTakeoff className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tight">{flight?.departureAirport.airportCode}</h2>
                  <p className="text-gray-500 font-medium">{flight?.departureAirport.city}</p>
                </div>
              </div>

              <div className="absolute left-8 top-[150px] bottom-[64px] w-0.5 bg-red hidden lg:block z-0">
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center text-gold shadow-sm">
                  <Plane className="w-3 h-3 rotate-90" />
                </div>
              </div>
              
              {/* Điểm đến */}
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-200 text-gray-500 flex items-center justify-center flex-shrink-0">
                  <PlaneLanding className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tight">{flight?.arrivalAirport.airportCode}</h2>
                  <p className="text-gray-500 font-medium">{flight?.arrivalAirport.city}</p>
                </div>
              </div>
            </div>

            <div className="md:w-96 pt-8 md:pt-0 md:pl-4 flex flex-col justify-between relative py-4">
              <div className="flex justify-between items-start mb-8 mt-6 md:mt-0">
                {/* Departure */}
                <div className="flex flex-col items-start">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Departure</p>
                  <p className="text-5xl font-black text-gray-950 leading-none tracking-tight">
                    {dep.time || '08:00'} 
                    <span className="text-lg font-bold text-gray-400 align-super">{dep.period || 'AM'}</span>
                  </p>
                  <p className="text-sm font-bold text-red tracking-tight">{dep.date || '19 Apr 2026'}</p>
                </div>

                {/* Arrival */}
                <div className="flex flex-col items-end text-right">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Arrival</p>
                  <p className="text-5xl font-black text-gray-950 leading-none tracking-tight">
                    {arr.time || '10:05'} <span className="text-lg font-bold text-gray-400 align-super">{arr.period || 'AM'}</span>
                  </p>
                  <p className="text-sm font-bold text-gray-500 tracking-tight">{arr.date || '19 Apr 2026'}</p>
                </div>
              </div>

              {/* Duration & Stops */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <span className="text-xl">⏱</span> {flight?.duration || '7h 10m'}
                </div>
                <div className="bg-[#f0e6d2] text-gold text-[10px] font-bold px-3 py-1 rounded">
                  NON-STOP
                </div>
              </div>
            </div>
          </div>

          <AmenitiesFeatures amenitiesList={amenities} />
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
                <span className="text-6xl font-black tracking-tighter">{formatCurrency(sumPrice)}</span>
              </div>
            </div>

            <div className="p-8 pb-4">
              <div className="space-y-4 text-sm font-medium border-b border-gray-100 pb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Base Fare (1 Adult)</span>
                  <span className="text-gray-900 font-bold">{formatCurrency(firstPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxes and Fees</span>
                  <span className="text-gray-900 font-bold">{formatCurrency(tax)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-6 border-b border-gray-100">
                <span className="text-[11px] font-bold uppercase tracking-widest text-red">Seat Selection</span>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">Free Choice</span>
              </div>

              <button
                onClick={() => navigate('/booking/seat', { state: { flightId: flightId } })}
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
