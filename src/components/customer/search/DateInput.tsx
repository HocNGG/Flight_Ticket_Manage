import { CalendarDays} from 'lucide-react';

type DateInputProps = {
  departureDate: string;
  returnDate: string;
  isRoundTrip: boolean;
  onDepartureDateChange: (value: string) => void;
  onReturnDateChange: (value: string) => void;
};

const DateInput = ({ departureDate, returnDate, isRoundTrip, onDepartureDateChange, onReturnDateChange }: DateInputProps) => {
  const today = new Date().toISOString().split('T')[0];
  const handleDepartureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDepartureDate = e.target.value;
    onDepartureDateChange(newDepartureDate);
    if (returnDate && newDepartureDate > returnDate) {
      onReturnDateChange('');
    }
  };
  return (
    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
      {/* Departure */}
      <div>
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Departure</label>
        <div className="relative group">
          <input
            type="date"
            min={today}
            value={departureDate}
            placeholder="Date"
            onChange={handleDepartureChange}
            className="w-full bg-surface rounded-xl h-14 pl-4 pr-10 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
          />
          <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-red" />
        </div>
      </div>

      {/* Return */}
      <div className={`transition-all duration-300 ${!isRoundTrip ? 'opacity-30' : 'opacity-100'}`}>
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Return</label>
        <div className="relative group">
          <input
            type="date"
            disabled={!isRoundTrip}
            min={departureDate || today}
            value={returnDate}
            placeholder='Return'
            onChange={(e) => onReturnDateChange(e.target.value)}
            className={`w-full bg-surface rounded-xl h-14 pl-4 pr-10 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20 ${isRoundTrip ? 'cursor-pointer' : 'cursor-not-allowed'} [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full`}
          />
          <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-red" />
        </div>
      </div>
    </div>
  );
};

export default DateInput;