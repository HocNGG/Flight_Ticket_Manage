// data/flightSeat.ts
// Chứa dữ liệu và logic liên quan đến ghế bay (seat data và utilities)
// Được tách ra để tái sử dụng và dễ maintain

import type { Seat, SeatStatus } from '../components/customer/booking/Seat';

// Layout ghế: A B C (aisle) D E F - đại diện cho vị trí ghế trong máy bay
export const seatLayout = ['A', 'B', 'C', '_', 'D', 'E', 'F'] as const;

// Số hàng ghế trong máy bay (từ 1 đến 30)
export const rows = 30;

// Dữ liệu mẫu cho một số ghế cụ thể (thực tế sẽ lấy từ API)
// Chỉ định status và price cho các ghế này, còn lại mặc định available với price 0
export const initialSeats: Array<Pick<Seat, 'id' | 'status' | 'price'>> = [
  { id: '1A', status: 'occupied', price: 0 }, // Ghế đã bị chiếm
  { id: '1B', status: 'booked', price: 0 },   // Ghế đã được đặt
  { id: '1C', status: 'available', price: 20 }, // Ghế có sẵn với giá 20
];

// Hàm utility để tạo object Seat đầy đủ từ id, status, price
// Tự động set occupied dựa trên status (booked/occupied = true)
export const buildSeat = (id: string, status: SeatStatus, price: number): Seat => ({
  id,
  status,
  price,
  occupied: status === 'booked' || status === 'occupied',
});