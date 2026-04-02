import { CalendarDays } from 'lucide-react';

const DateInput = () => {
  return (
    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
      <div>
        <label className="text-[11px] font-bold text-dark uppercase tracking-widest block mb-2 px-1">Date</label>
        <div className="relative">
          <input
            type="date"
            className="w-full bg-[#f6f6f6] rounded-xl h-14 pl-4 pr-10 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9111E]/20 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
          />
          <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800 pointer-events-none" />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-bold text-dark uppercase tracking-widest block mb-2 px-1 italic">Return</label>
        <div className="relative">
          <input
            type="date"
            className="w-full bg-[#f6f6f6] rounded-xl h-14 pl-4 pr-10 text-sm font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-[#C9111E]/20 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
          />
          <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default DateInput;
