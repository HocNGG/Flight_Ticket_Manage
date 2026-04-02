import { ChevronDown } from 'lucide-react';

const CabinInput = () => {
  return (
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
  );
};

export default CabinInput;
