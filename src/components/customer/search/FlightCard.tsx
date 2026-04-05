import { Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type FlightCardProps = {
  airline: string;
  flightCode: string;
  departure: string;
  arrival: string;
  origin: string;
  destination: string;
  duration: string;
  stops: string;
  price: string;
  tag: string;
  tagColor?: string;
  logo: string;
  detailPath: string;
};

export const FlightCard = ({
  airline,
  flightCode,
  departure,
  arrival,
  origin,
  destination,
  duration,
  stops,
  price,
  tag,
  tagColor = 'text-gray-500',
  logo,
  detailPath,
}: FlightCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-shadow border border-transparent hover:border-red/10 flex flex-col md:flex-row items-center relative overflow-hidden group">
      <div className="flex items-center flex-1 w-full flex-wrap gap-6 md:gap-0">
        <div className="w-[120px] flex flex-col justify-center items-center text-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${logo}`}>
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <span className="text-xs font-bold text-gray-900 leading-tight block">{airline}</span>
          <span className="text-[10px] text-gray-400 font-medium block">{flightCode}</span>
        </div>

        <div className="flex-1 min-w-[100px] text-center md:text-left md:pl-8">
          <div className="text-2xl font-black text-gray-900">{departure}</div>
          <div className="text-sm text-gray-500 font-medium">{origin}</div>
        </div>

        <div className="flex-1 min-w-[140px] px-4 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-gold mb-1">{duration}</span>
          <div className="w-full h-0.5 bg-gray-200 relative flex items-center justify-center">
            {stops !== 'NON-STOP' && <div className="w-1.5 h-1.5 rounded-full bg-red absolute" />}
            {stops === 'NON-STOP' && <div className="w-full h-0.5 bg-red absolute" />}
          </div>
          <span className={`text-[10px] font-bold mt-1 ${stops === 'NON-STOP' ? 'text-red' : 'text-gray-400'}`}>{stops}</span>
        </div>

        <div className="flex-1 min-w-[100px] text-center md:text-left md:pl-4 relative">
          <div className="text-2xl font-black text-gray-900">
            {arrival} <sup className="text-xs text-red font-bold">+1</sup>
          </div>
          <div className="text-sm text-gray-500 font-medium">{destination}</div>
        </div>
      </div>

      <div className="w-full md:w-auto flex items-center justify-between md:flex-col md:items-end md:pl-8 md:border-l border-gray-100 mt-6 md:mt-0 pt-6 md:pt-0">
        <div className="absolute top-4 right-6 text-[10px] font-bold uppercase tracking-widest text-right">
          <span className={tagColor}>{tag}</span>
        </div>

        <div className="text-right mt-2">
          <div className="text-3xl font-black text-gray-900">{price}</div>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-4 h-4 rounded border border-gray-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Compare</span>
          </label>
          <button
            onClick={() => navigate(detailPath)}
            className="bg-red text-white hover:bg-reddark transition-colors rounded-full px-6 py-2.5 font-bold text-sm"
          >
            Select Flight
          </button>
        </div>
      </div>
    </div>
  );
};
