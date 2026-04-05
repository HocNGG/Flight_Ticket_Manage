export type SeatStatus = 'available' | 'booked' | 'occupied';

export type Seat = {
  id: string;
  status: SeatStatus;
  price: number;
  occupied: boolean;
};

type SeatProps = {
  seat: Seat | null;
  isSelected: boolean;
  onSelect: (seat: Seat) => void;
};

export const SeatButton = ({ seat, isSelected, onSelect }: SeatProps) => {
  if (!seat) {
    return <div className="w-10 h-10" />;
  }

  const isDisabled = seat.occupied;
  const buttonClasses = isDisabled
    ? 'w-10 h-10 rounded-lg bg-gray-300 text-gray-500 flex items-center justify-center text-xs select-none cursor-not-allowed'
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
      title={`${seat.id} • ${seat.occupied ? 'occupied' : `available from $${seat.price}`}`}
    >
      {displayValue}
    </button>
  );
};
