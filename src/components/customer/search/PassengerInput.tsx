import { Users } from 'lucide-react';

const PassengerInput = () => {
  return (
    <div className="col-span-1 relative">
      <div className="relative">
        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold1" />
        <input
          type="number"
          min="1"
          placeholder="1 Passenger"
          className="w-full bg-surface rounded-xl h-14 pl-12 pr-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
        />
      </div>
    </div>
  );
};

export default PassengerInput;
