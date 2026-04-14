import { useState,useMemo,useRef,useEffect } from "react";
import type { AirportGeneral } from "../../../types/flight/airport";
import { ChevronDown } from "lucide-react";
interface AirportDropdownProps {
  options?: AirportGeneral[];       
  value?: string;                   
  onChange?: (val: string) => void;  
  placeholder?: string; 
  icon?: React.ReactNode;
}
export default function AirportDropdown({
  options = [],  
  value = '', 
  onChange,
  placeholder = "City or Airport",
  icon }:AirportDropdownProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // CLICK OUTSIDE: Tự động đóng Dropdown khi click ra ngoài
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
      const cleanSearch = searchTerm.trim().toLowerCase();
      if (!cleanSearch) return options;
      const isSelectedValue = cleanSearch.includes('(') && cleanSearch.includes(')');
      if (isSelectedValue) return options;

      // 3. Logic tìm kiếm bình thường khi người dùng gõ
      return options.filter((item) => {
        const city = item.city.toLowerCase();
        const code = item.airportCode.toLowerCase();
        return city.includes(cleanSearch) || code.includes(cleanSearch);
      });
    }, [options, searchTerm]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 ">
        {icon}
      </div>
      <input
        value={searchTerm}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setOpen(true);
          if (value) onChange?.(""); 
        }}
        placeholder={placeholder}
        className="w-full bg-surface rounded-xl h-14 pl-12 pr-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20 transition-all"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown className="w-4 h-4" />
      </div>
      {/* DROPDOWN MENU */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((item) => (
              <div
                key={item.airportCode} 
                onClick={() => {
                  setSearchTerm(`${item.city} (${item.airportCode})`);
                  onChange?.(item.airportCode);
                  setOpen(false);
                }}
                className="px-4 py-3 hover:bg-red/5 cursor-pointer text-sm transition-colors border-b border-gray-50 last:border-0"
              >
                <span className="font-semibold text-gray-800">{item.city}</span>
                <span className="ml-2 text-gray-400 font-medium">({item.airportCode})</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-4 text-sm text-gray-500 text-center">
              No airports found
            </div>
          )}
        </div>
      )}
    </div>
  );
}