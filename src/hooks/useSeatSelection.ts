// hooks/useSeatSelection.ts
// Hook tùy chỉnh để quản lý logic chọn ghế và xây dựng danh sách ghế
// Tách logic ra khỏi component để dễ test và tái sử dụng

import { useMemo, useState } from 'react';
import type { Seat, SeatStatus } from '../components/customer/booking/Seat';
import { seatLayout, rows, initialSeats, buildSeat } from '../data/flightSeat';

export const useSeatSelection = () => {
  // State lưu id ghế đang được chọn (mặc định '1C')
  const [selectedSeat, setSelectedSeat] = useState<string>('1C');

  // Xây dựng danh sách ghế cho toàn bộ máy bay
  // Sử dụng useMemo để chỉ tính toán lại khi dependencies thay đổi
  const seatRows = useMemo(() => {
    const seatMap: Array<Array<Seat | null>> = [];

    // Duyệt qua từng hàng (1 đến rows)
    for (let row = 1; row <= rows; row += 1) {
      // Tạo mảng ghế cho hàng này dựa trên seatLayout
      const rowSeats = seatLayout.map((letter) => {
        if (letter === '_') {
          return null; // Vị trí aisle (khoảng trống giữa ghế)
        }

        const id = `${row}${letter}`; // Tạo id ghế (vd: 1A, 2B, ...)
        const sample = initialSeats.find((seat) => seat.id === id); // Tìm dữ liệu mẫu
        const status = (sample?.status as SeatStatus) ?? 'available'; // Mặc định available
        const price = sample?.price ?? 0; // Mặc định price 0

        return buildSeat(id, status, price); // Tạo object Seat
      });

      seatMap.push(rowSeats); // Thêm hàng vào seatMap
    }

    return seatMap; // Trả về mảng 2 chiều [hàng][ghế]
  }, []); // Dependencies rỗng vì dữ liệu tĩnh

  // Hàm xử lý chọn ghế: chỉ cho phép chọn ghế available
  const handleSelectSeat = (seat: Seat) => {
    if (seat.status !== 'available') return; // Bỏ qua nếu không available
    setSelectedSeat(seat.id); // Cập nhật state
  };

  // Label hiển thị trạng thái ghế đã chọn
  const seatStatusLabel = selectedSeat ? `Selected seat ${selectedSeat}` : 'Select a seat';

  return {
    selectedSeat,
    seatRows,
    handleSelectSeat,
    seatStatusLabel,
  };
};