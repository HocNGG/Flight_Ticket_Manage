import { Users } from 'lucide-react';

const PassengerInput = () => {
  return (
    <div className="col-span-1 relative">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Travelers</label>
      <div className="relative">
        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
        <input
          type="number"
          min="1"
          placeholder="1 Passenger"
          className="w-full bg-surface rounded-xl h-14 pl-10 pr-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
        />
      </div>
    </div>
  );
};

export default PassengerInput;
