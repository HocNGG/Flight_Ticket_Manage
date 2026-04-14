import { ChevronDown, Armchair, Loader2,Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { SeatClass } from '../../../types/flight/seatclass';
interface CabinInputProps {
  value: string;
  onChange: (value: string) => void;
  options: SeatClass[];   
  isLoading?: boolean;    
}
const CabinInput = ({ value, onChange, options, isLoading }: CabinInputProps) => {
  const [isOpen, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="col-span-1 relative group" ref={containerRef}>
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
        Cabin
      </label>

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

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
            {options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.classId}
                  onClick={() => {
                    onChange(option.className);
                    setOpen(false);
                  }}
                  className={`px-4 py-3 cursor-pointer transition-colors text-sm font-semibold text-gray-600`}
                >
                  {option.className}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-gray-400 italic text-center">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CabinInput;