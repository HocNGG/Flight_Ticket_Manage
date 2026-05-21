// hooks/useSeatSelection.ts
// Hook quản lý logic chọn ghế — nhận dữ liệu thực từ API thay vì mock tĩnh

import { useEffect, useMemo, useState } from 'react';
import type { Seat, SeatStatus } from '../components/customer/booking/Seat';
import type { SeatItem, SeatClassRange } from '../api/types';

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
    seatClass: s.seatClass.toLowerCase(),
    occupied: status === 'booked',
    flightSeatId: s.flightSeatId,
  };
};

// Nhóm ghế API vào rows để render sơ đồ máy bay
const buildRowsFromApiSeats = (apiSeats: SeatItem[]): SeatRow[] => {
  const rowMap = new Map<number, Seat[]>();

  for (const s of apiSeats) {
    const match = s.seatNumber.match(/^(\d+)/);
    const rowNum = match ? parseInt(match[1], 10) : 0;
    if (!rowMap.has(rowNum)) rowMap.set(rowNum, []);
    rowMap.get(rowNum)!.push(apiSeatToSeat(s));
  }

  const sortedRows = [...rowMap.entries()].sort(([a], [b]) => a - b);

  return sortedRows.map(([rowNumber, seats]) => {
    const seatMap: Record<string, Seat | null> = {
      A: null, B: null, C: null, D: null, E: null, F: null
    };

    seats.forEach(s => {
      const letter = s.id.replace(/^\d+/, '').toUpperCase();
      seatMap[letter] = s;
    });

    const rowSeats = [
      seatMap.A,
      seatMap.B,
      seatMap.C,
      null,
      seatMap.D,
      seatMap.E,
      seatMap.F
    ];

    return { rowNumber, seats: rowSeats };
  });
};

export const useSeatSelection = (
  selectedSeatClass: string,
  _flightBasePrice = 0,           // kept for API compat, price now comes from API
  apiSeats: SeatItem[] = [],
  seatClassRanges: SeatClassRange[] = [],
) => {
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);

  // Reset khi đổi hạng ghế
  useEffect(() => {
    setSelectedSeat('');
    setSelectedSeatId(null);
  }, [selectedSeatClass]);

  // Build rows từ API seats, lọc theo dải hàng của hạng ghế được chọn
  const seatRows = useMemo(() => {
    if (apiSeats.length === 0) return [];

    const currentRange = seatClassRanges.find(
      (r) => r.className.toLowerCase() === selectedSeatClass.toLowerCase()
    );

    let filteredSeats = apiSeats;
    if (currentRange) {
      filteredSeats = apiSeats.filter((s) => {
        const match = s.seatNumber.match(/^(\d+)/);
        const rowNum = match ? parseInt(match[1], 10) : 0;
        return rowNum >= currentRange.rowStart && rowNum <= currentRange.rowEnd;
      });
    } else {
      filteredSeats = apiSeats.filter(
        (s) => s.seatClass.toLowerCase() === selectedSeatClass.toLowerCase()
      );
    }

    return buildRowsFromApiSeats(filteredSeats);
  }, [apiSeats, selectedSeatClass, seatClassRanges]);

  const handleSelectSeat = (seat: Seat) => {
    if (seat.seatClass.toLowerCase() !== selectedSeatClass.toLowerCase()) return;
    if (seat.status !== 'available') return;
    setSelectedSeat(seat.id);
    setSelectedSeatId((seat as any).flightSeatId ?? null);
  };

  const getSeatClassLabel = (sc: string) => {
    const map: Record<string, string> = {
      economy: 'Phổ thông',
      business: 'Thương gia',
      first: 'Hạng Nhất',
      premium_economy: 'Phổ thông đặc biệt',
    };
    return map[sc.toLowerCase()] ?? sc;
  };

  const seatStatusLabel = selectedSeat
    ? `Ghế đã chọn: ${selectedSeat} (${getSeatClassLabel(selectedSeatClass)})`
    : `Chọn ghế hạng ${getSeatClassLabel(selectedSeatClass)}`;

  return {
    selectedSeat,
    selectedSeatId,
    seatRows,
    handleSelectSeat,
    seatStatusLabel,
  };
};