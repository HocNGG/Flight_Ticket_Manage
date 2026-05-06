import {
  ArrowLeft,
  PlaneTakeoff,
  PlaneLanding,
  ShieldCheck,
  ArrowRight,
  Check,
  Clock,
  Users,
  Plane,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { policies } from '../../../data/flightPolicies';
import { Policies } from '../../../components/customer/detail/Policies';
import { AmenitiesFeatures } from '../../../components/customer/detail/AmenitiesFeatures';
import { amenities } from '../../../data/flightAmen';
import { useFlightDetail } from '../../../hooks/useFlights';
import type { FlightResult } from '../../../api/types';

type SeatClassOption = {
  seatClassId: number;
  className: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  description: string;
  multiplier: number;
};

const seatClassOptions: SeatClassOption[] = [
  { seatClassId: 1, className: 'ECONOMY', description: 'Hạng phổ thông', multiplier: 1 },
  { seatClassId: 2, className: 'BUSINESS', description: 'Hạng thương gia', multiplier: 2 },
  { seatClassId: 3, className: 'FIRST', description: 'Hạng nhất', multiplier: 3.6 },
];

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export const FlightDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedClass, setSelectedClass] = useState<SeatClassOption>(seatClassOptions[0]);
  const { data: flight, isLoading, isError } = useFlightDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !flight) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-700 font-bold">Không thể tải thông tin chuyến bay</p>
      </div>
    );
  }

  const totalPrice = flight.basePrice * selectedClass.multiplier;

  const handleBook = () => {
    // Navigate sang SeatSelection với state đúng API: flightId + seatClass
    navigate('/booking/seat', {
      state: {
        flightId: id || flight.flightId,
        seatClass: selectedClass.className,
        flightCode: flight.flightCode,
        departureAirport: flight.departureAirport,
        arrivalAirport: flight.arrivalAirport,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        basePrice: totalPrice,
      },
    });
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-6 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest mb-8"
      >
        <ArrowLeft className="w-4 h-4 text-red" />
        Quay lại kết quả
      </button>

      {/* Stepper */}
      <div className="flex items-center justify-between w-full relative py-6 my-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[55%] h-0.5 bg-red"></div>
        <StepDot done /><StepDot done /><StepDot active label="03" /><StepDot label="04" />
        <span className="relative z-10 bg-surface pl-4 text-[10px] font-bold uppercase tracking-widest text-dark">
          Bước 3: Chi tiết chuyến bay
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left — Flight Info */}
        <div className="flex-1 space-y-6">

          {/* Flight Route Card */}
          <div className="bg-[#fcfcfc] rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            {/* Flight code badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red text-white flex items-center justify-center font-black text-sm">
                  {flight.airline.airlineName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-gray-900">{flight.airline.airlineName}</p>
                  <p className="text-xs text-gray-500">{flight.aircraft.model}</p>
                </div>
              </div>
              <div className="bg-white rounded-full px-3 py-1 text-[10px] font-bold text-gray-900 shadow-sm border border-gray-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold"></div>
                {flight.flightCode}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Departure */}
              <div className="flex-1 flex flex-col items-center md:items-start gap-1">
                <div className="w-12 h-12 rounded-2xl bg-red text-white flex items-center justify-center mb-2">
                  <PlaneTakeoff className="w-6 h-6" />
                </div>
                <p className="text-4xl font-black text-gray-900">{formatTime(flight.departureTime)}</p>
                <p className="text-lg font-bold text-gray-700">{flight.departureAirport.code}</p>
                <p className="text-sm text-gray-500">{flight.departureAirport.name}</p>
                <p className="text-xs text-gray-400">{formatDate(flight.departureTime)}</p>
              </div>

              {/* Duration */}
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest">{flight.duration}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <div className="w-16 md:w-24 h-0.5 bg-gray-200 relative">
                    <Plane className="w-4 h-4 text-red absolute left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                </div>
                <span className="text-[10px] font-bold text-red uppercase">Bay thẳng</span>
              </div>

              {/* Arrival */}
              <div className="flex-1 flex flex-col items-center md:items-end gap-1">
                <div className="w-12 h-12 rounded-2xl bg-gray-200 text-gray-500 flex items-center justify-center mb-2">
                  <PlaneLanding className="w-6 h-6" />
                </div>
                <p className="text-4xl font-black text-gray-900">{formatTime(flight.arrivalTime)}</p>
                <p className="text-lg font-bold text-gray-700">{flight.arrivalAirport.code}</p>
                <p className="text-sm text-gray-500">{flight.arrivalAirport.name}</p>
                <p className="text-xs text-gray-400">{formatDate(flight.arrivalTime)}</p>
              </div>
            </div>

            {/* Info row */}
            <div className="flex gap-6 mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{flight.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>Còn {flight.availableSeats} chỗ</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Plane className="w-4 h-4 text-gray-400" />
                <span>{flight.aircraft.model}</span>
              </div>
            </div>
          </div>

          <AmenitiesFeatures amenitiesList={amenities} />
          <Policies policies={policies} />
        </div>

        {/* Right — Booking Form */}
        <aside className="w-full lg:w-[400px] flex-shrink-0 space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">

            {/* Price Header */}
            <div className="bg-red p-8 text-white relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Tổng giá vé</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tighter">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <p className="text-white/70 text-xs mt-2">/ người · đã bao gồm thuế phí</p>
            </div>

            <div className="p-8 pb-4">
              {/* Seat Class Selection */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                Chọn hạng ghế
              </p>
              <div className="space-y-2 mb-6">
                {seatClassOptions.map((cls) => (
                  <button
                    key={cls.seatClassId}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                      selectedClass.seatClassId === cls.seatClassId
                        ? 'border-red bg-red/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-900">{cls.description}</span>
                      <span className="text-xs font-bold text-red">{formatPrice(flight.basePrice * cls.multiplier)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{cls.className}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleBook}
                className="w-full bg-red text-white hover:bg-reddark transition-colors rounded-xl h-14 font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-red/30"
              >
                Đặt chuyến bay này
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="bg-[#fcfcfc] rounded-xl p-4 mt-6 border border-gray-100 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-1">Cam kết giá tốt nhất</p>
                  <p className="text-[10px] text-gray-500">Tìm thấy giá rẻ hơn? Chúng tôi hoàn lại phần chênh lệch.</p>
                </div>
              </div>

              <div className="flex justify-center gap-6 mt-6 pb-2">
                <div className="text-center text-gray-400">
                  <span className="text-lg block mb-1">💳</span>
                  <span className="text-[8px] font-bold">BẢO MẬT</span>
                </div>
                <div className="text-center text-gray-400">
                  <span className="text-lg block mb-1">✔️</span>
                  <span className="text-[8px] font-bold">CHÍNH THỨC</span>
                </div>
                <div className="text-center text-gray-400">
                  <span className="text-lg block mb-1">🎧</span>
                  <span className="text-[8px] font-bold">HỖ TRỢ 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const StepDot = ({ done, active, label }: { done?: boolean; active?: boolean; label?: string }) => (
  <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center relative z-10 ${
    done ? 'bg-red text-white' : active ? 'bg-white border-2 border-red text-red' : 'bg-white border-2 border-gray-200 text-gray-400'
  }`}>
    {done ? <Check className="w-3 h-3" /> : label}
  </div>
);
