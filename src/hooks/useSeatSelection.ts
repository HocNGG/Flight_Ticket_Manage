// hooks/useSeatSelection.ts
// Hook quản lý logic chọn ghế — nhận dữ liệu thực từ API thay vì mock tĩnh

import { useEffect, useMemo, useState } from 'react';
import type { Seat, SeatStatus } from '../components/customer/booking/Seat';
import type { SeatClassCode } from '../data/flightSeat';
import type { SeatItem } from '../api/types';
import { mapApiSeatClass } from '../data/flightSeat';

type SeatRow = {
  rowNumber: number;
  seats: Array<Seat | null>;
};

// Chuyển API SeatItem → internal Seat object cho SeatButton
const apiSeatToSeat = (s: SeatItem): Seat => {
  const status: SeatStatus = s.status === 'BOOKED' ? 'booked' : 'available';
  return {
    id: s.seatNumber,
    status,
    price: s.price,
    seatClass: mapApiSeatClass(s.seatClass),
    occupied: status === 'booked',
    flightSeatId: s.flightSeatId,
  };
};

// Nhóm ghế API vào rows để render sơ đồ máy bay
const buildRowsFromApiSeats = (apiSeats: SeatItem[]): SeatRow[] => {
  // Nhóm theo rowNumber (số đầu của seatNumber: "20F" → row 20)
  const rowMap = new Map<number, Seat[]>();

  for (const s of apiSeats) {
    const match = s.seatNumber.match(/^(\d+)/);
    const rowNum = match ? parseInt(match[1], 10) : 0;
    if (!rowMap.has(rowNum)) rowMap.set(rowNum, []);
    rowMap.get(rowNum)!.push(apiSeatToSeat(s));
  }

  // Sắp xếp theo row số
  const sortedRows = [...rowMap.entries()].sort(([a], [b]) => a - b);

  return sortedRows.map(([rowNumber, seats]) => {
    // Sắp xếp ghế trong hàng theo chữ cái (A, B, C, D, E, F)
    const sorted = seats.sort((a, b) => {
      const aLetter = a.id.replace(/^\d+/, '');
      const bLetter = b.id.replace(/^\d+/, '');
      return aLetter.localeCompare(bLetter);
    });

    // Build với aisle null nếu có cả 2 nhóm ABC và DEF
    const letters = sorted.map((s) => s.id.replace(/^\d+/, ''));
    const hasLeft = letters.some((l) => ['A', 'B', 'C'].includes(l));
    const hasRight = letters.some((l) => ['D', 'E', 'F'].includes(l));
    const needsAisle = hasLeft && hasRight;

    const leftSeats = sorted.filter((s) => ['A', 'B', 'C'].includes(s.id.replace(/^\d+/, '')));
    const rightSeats = sorted.filter((s) => ['D', 'E', 'F'].includes(s.id.replace(/^\d+/, '')));

    const rowSeats: Array<Seat | null> = needsAisle
      ? [...leftSeats, null, ...rightSeats]
      : sorted;

    return { rowNumber, seats: rowSeats };
  });
};

export const useSeatSelection = (
  selectedSeatClass: SeatClassCode,
  _flightBasePrice = 0,           // kept for API compat, price now comes from API
  apiSeats: SeatItem[] = [],
) => {
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);

  // Reset khi đổi hạng ghế
  useEffect(() => {
    setSelectedSeat('');
    setSelectedSeatId(null);
  }, [selectedSeatClass]);

  // Build rows từ API seats, lọc theo hạng được chọn
  const seatRows = useMemo(() => {
    if (apiSeats.length === 0) return [];
    const filtered = apiSeats.filter(
      (s) => mapApiSeatClass(s.seatClass) === selectedSeatClass,
    );
    return buildRowsFromApiSeats(filtered);
  }, [apiSeats, selectedSeatClass]);

  const handleSelectSeat = (seat: Seat) => {
    if (seat.seatClass !== selectedSeatClass) return;
    if (seat.status !== 'available') return;
    setSelectedSeat(seat.id);
    setSelectedSeatId((seat as any).flightSeatId ?? null);
  };

  const seatStatusLabel = selectedSeat
    ? `Ghế đã chọn: ${selectedSeat} (${selectedSeatClass})`
    : `Chọn ghế hạng ${selectedSeatClass}`;

  return {
    selectedSeat,
    selectedSeatId,
    seatRows,
    aircraftInfo,
    handleSelectSeat,
    loading,
    seatStatusLabel
  };
};