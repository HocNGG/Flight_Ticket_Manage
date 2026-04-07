import { useState } from "react";
import { PlaneTakeoff } from 'lucide-react';
const airports = [
  "Ho Chi Minh (SGN)",
  "Ha Noi (HAN)",
  "Da Nang (DAD)",
  "Nha Trang (CXR)",
];
export default function DropdownInputOff({ value: extValue, onChange }: { value?: string; onChange?: (val: string) => void }) {
  const [open, setOpen] = useState(false);

  const value = extValue ?? '';
  const setValue = (val: string) => {
    onChange?.(val);
  };

  return (
    <div className="relative">
    <PlaneTakeoff className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red" />
      <input
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(e) => setValue(e.target.value)}
        placeholder="City or Airport"
        className="w-full bg-surface rounded-xl h-14 pl-12 pr-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
      />

      {open && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          {airports
            .filter((item) =>
              item.toLowerCase().includes(value.toLowerCase())
            )
            .map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  setValue(item);
                  setOpen(false);
                }}
                className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {item}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}