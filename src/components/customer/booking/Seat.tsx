import type { SeatDetailDTO } from "../../../types/flight/seat";

export type SeatStatus = 'available' | 'booked' | 'occupied';


type SeatProps = {
  seat: SeatDetailDTO | null;
  isSelected: boolean;
  onSelect: (seat: SeatDetailDTO | null) => void;
};

export const SeatButton = ({ seat, isSelected, onSelect }: SeatProps) => {
  if (!seat) {
    return <div className="w-10 h-10" />;
  }
  const isOccupied = seat.status.toUpperCase() !== 'AVAILABLE';
  const buttonClasses = isOccupied
    ? 'w-10 h-10 rounded-lg bg-gray-300 text-gray-500 flex items-center justify-center text-xs select-none cursor-not-allowed'
    : isSelected
    ? 'w-10 h-10 rounded-lg bg-red text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-red/20 scale-110 transition-transform'
    : 'w-10 h-10 rounded-lg bg-gray-100 hover:bg-red/10 transition-colors text-xs text-gray-700 flex items-center justify-center cursor-pointer border border-transparent hover:border-red/20';

  const seatLetter = seat.seatNumber.replace(/[0-9]/g, '');
  const displayValue = isSelected ? '✓' : seatLetter;

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={() => !isOccupied && onSelect(seat)}
      disabled={isOccupied}
      title={`${seat.seatNumber} • ${isOccupied ? 'Occupied' : `Available: ${seat.price.toLocaleString()} VND`}`}
    >
      {displayValue}
    </button>
  );
};
