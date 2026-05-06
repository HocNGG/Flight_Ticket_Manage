import { Plane } from 'lucide-react';
import type { FlightResult } from '../../../api/types';

type FlightCardProps = {
  flight: FlightResult;
  onSelect: () => void;
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatFlightDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export const FlightCard = ({ flight, onSelect }: FlightCardProps) => (
  <div className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-shadow border border-transparent hover:border-red/10 flex flex-col md:flex-row items-center relative overflow-hidden group">
    <div className="flex items-center flex-1 w-full flex-wrap gap-6 md:gap-0">
      <div className="w-[140px] flex flex-col justify-center items-center text-center">
        <div className="w-10 h-10 rounded-full bg-red-50 text-red flex items-center justify-center mb-2 font-black text-xs">
          {flight.airline.airlineCode}
        </div>
        <span className="text-xs font-bold text-gray-900 leading-tight block">{flight.airline.airlineName}</span>
        <span className="text-[10px] text-gray-400 font-medium block">{flight.flightCode}</span>
      </div>

      <div className="flex-1 min-w-[100px] text-center md:text-left md:pl-8">
        <div className="text-2xl font-black text-gray-900">{formatTime(flight.departureTime)}</div>
        <div className="text-sm text-gray-500 font-medium">{flight.departureAirport.code}</div>
        <div className="text-[10px] text-gray-400">{flight.departureAirport.name}</div>
        <div className="text-[10px] text-red font-bold mt-1">Ngày đi: {formatFlightDate(flight.departureTime)}</div>
      </div>

      <div className="flex-1 min-w-[140px] px-4 flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold text-gold mb-3">{flight.duration}</span>
        <div className="w-full h-0.5 bg-red relative flex items-center mt-1">
          <Plane className="w-4 h-4 text-red absolute left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <span className="text-[15px] font-semibold text-gray-400 mt-1">NON-STOP</span>
      </div>

      <div className="flex-1 min-w-[100px] text-center md:text-left md:pl-4">
        <div className="text-2xl font-black text-gray-900">{formatTime(flight.arrivalTime)}</div>
        <div className="text-sm text-gray-500 font-medium">{flight.arrivalAirport.code}</div>
        <div className="text-[10px] text-gray-400">{flight.arrivalAirport.name}</div>
        <div className="text-[10px] text-red font-bold mt-1">Ngày đến: {formatFlightDate(flight.arrivalTime)}</div>
      </div>
    </div>

    <div className="w-full md:w-auto flex items-center justify-between md:flex-col md:items-end md:pl-8 md:border-l border-gray-100 mt-6 md:mt-0 pt-6 md:pt-0">
      <div className="text-right">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Từ</p>
        <div className="text-2xl font-black text-gray-900">{formatPrice(flight.basePrice)}</div>
        <p className="text-[10px] text-gray-400">Còn {flight.availableSeats} chỗ</p>
      </div>
      <button
        onClick={onSelect}
        className="mt-4 bg-red text-white hover:bg-reddark transition-colors rounded-full px-6 py-2.5 font-bold text-sm"
      >
        Chọn
      </button>
    </div>
  </div>
);
