import { ChevronDown } from 'lucide-react';

// API: seatClass values are ECONOMY, BUSINESS, FIRST
type CabinInputProps = {
  value: string;
  onChange: (val: string) => void;
};

const CabinInput = ({ value, onChange }: CabinInputProps) => {
  return (
    <div className="col-span-1 relative">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Cabin Class</label>
      <div className="relative">
        {/* Main Display Box */}
        <div
          onClick={() => !isLoading && setOpen(!isOpen)}
          className={`w-full bg-surface rounded-xl h-14 pl-12 pr-10 flex items-center cursor-pointer transition-all border-2 
            ${isOpen ? 'border-gray-200 bg-white shadow-sm' : 'border-transparent hover:bg-gray-50'}`}
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Armchair className="w-5 h-5" />}
          </div>

          <span className={`text-sm font-semibold ${value ? 'text-gray-800' : 'text-gray-400'}`}>
            {value || "Select Cabin"}
          </span>

          <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 
            ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#f6f6f6] rounded-xl h-14 pl-10 pr-10 text-sm font-semibold text-gray-800 focus:outline-none appearance-none cursor-pointer"
        >
          <option value="ECONOMY">Economy</option>
          <option value="BUSINESS">Business</option>
          <option value="FIRST">First Class</option>
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default CabinInput;