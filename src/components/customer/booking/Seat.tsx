export type SeatStatus = 'available' | 'booked' | 'occupied';
export type SeatClassCode = string;

export type Seat = {
  id: string;
  status: SeatStatus;
  price: number;
  seatClass: SeatClassCode;
  occupied: boolean;
  flightSeatId?: number;   // ID thực từ API — dùng khi POST /api/bookings
};

type SeatProps = {
  seat: Seat | null;
  isSelected: boolean;
  disabledByClass?: boolean;
  onSelect: (seat: Seat) => void;
};

export const SeatButton = ({ seat, isSelected, disabledByClass = false, onSelect }: SeatProps) => {
  if (!seat) {
    return <div className="w-10 h-10" />;
  }

  const isDisabled = seat.occupied || disabledByClass;
  const buttonClasses = isDisabled
    ? 'w-10 h-10 rounded-lg bg-gray-300 text-gray-500 flex items-center justify-center text-xs select-none cursor-not-allowed opacity-80'
    : isSelected
    ? 'w-10 h-10 rounded-lg bg-red text-white flex items-center justify-center text-xs font-bold'
    : 'w-10 h-10 rounded-lg bg-gray-100 hover:bg-red/10 transition-colors text-xs text-gray-700 flex items-center justify-center cursor-pointer';

  const displayValue = isDisabled
    ? seat.id.replace(/^\d+/, '')
    : isSelected
    ? '/'
    : seat.id.replace(/^\d+/, '');

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={() => !isDisabled && onSelect(seat)}
      disabled={isDisabled}
      title={`${seat.id} • ${disabledByClass ? 'different class' : seat.occupied ? 'occupied' : `available from $${seat.price}`}`}
    >
      {displayValue}
    </button>
  );
};
