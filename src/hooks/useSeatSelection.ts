// hooks/useSeatSelection.ts
// Hook tùy chỉnh để quản lý logic chọn ghế và xây dựng danh sách ghế
// Tách logic ra khỏi component để dễ test và tái sử dụng

import { useEffect, useState } from 'react';
import type { SeatDetailDTO, SeatRowDTO } from '../types/flight/seat';
import flightApi from '../api/flightApi';

export const useSeatSelection = (flightId:number) => {

  const [seatRows, setSeatRows] = useState<(SeatDetailDTO | null)[][]>([]);
  const [selectedSeat, setSelectedSeat] = useState<SeatDetailDTO | null>(null);
  const [aircraftInfo, setAircraftInfo] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSeatMap = async () => {
      if (!flightId) return;
      try {
        setLoading(true);
        const response = await flightApi.getSeatsByFlight(flightId);
        // response.data tương ứng với SeatMapResponse
        const { rows, aircraft } = response.data;
        
        setAircraftInfo(aircraft);

        // Chuyển đổi SeatRowDTO[] thành mảng 2 chiều (SeatDetailDTO | null)[][]
        const grid = rows.map((row: SeatRowDTO) => {
          const rowSeats = [...row.seats];
          
          // Logic chèn lối đi (Aisle): 
          // Nếu hàng có 4 ghế (2 bên trái - 2 bên phải), chèn null vào giữa index 2
          if (rowSeats.length === 4) {
            (rowSeats as any).splice(2, 0, null);
          }
          return rowSeats;
        });

        setSeatRows(grid);
      } catch (error) {
        console.error("Error loading seat map:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeatMap();
  }, [flightId]);

  // Hàm xử lý chọn ghế: chỉ cho phép chọn ghế available
  const handleSelectSeat = (seat: SeatDetailDTO | null) => {
    if (!seat || seat.status.toUpperCase() !== 'AVAILABLE') return;
    setSelectedSeat(seat);
  };
  return {
    selectedSeat,
    seatRows,
    aircraftInfo,
    handleSelectSeat,
    loading,
    seatStatusLabel: selectedSeat 
      ? `Selected: ${selectedSeat.seatNumber} (${selectedSeat.seatClass})` 
      : "Please select your seat"
  };
};