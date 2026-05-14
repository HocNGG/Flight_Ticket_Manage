// data/flightSeat.ts
// Chứa dữ liệu và logic liên quan đến ghế bay (seat data và utilities)
// Được tách ra để tái sử dụng và dễ maintain

import type { Seat, SeatStatus } from '../components/customer/booking/Seat';

export type SeatClassCode = 'economy' | 'business' | 'first';

export type SeatClassConfig = {
  code: SeatClassCode;
  label: string;
  rowStart: number;
  rowEnd: number;
  priceMultiplier: number;  // Hệ số nhân giá: giá ghế = flight.basePrice × priceMultiplier
};

// Layout ghế: A B C (aisle) D E F - đại diện cho vị trí ghế trong máy bay
export const seatLayout = ['A', 'B', 'C', '_', 'D', 'E', 'F'] as const;

// Số hàng ghế trong máy bay (từ 1 đến 30)
export const rows = 30;

export const seatClasses: SeatClassConfig[] = [
  { code: 'first',    label: 'Hạng nhất', rowStart: 1,  rowEnd: 3,  priceMultiplier: 3.6 },
  { code: 'business', label: 'Thương gia', rowStart: 4,  rowEnd: 10, priceMultiplier: 2.0 },
  { code: 'economy',  label: 'Phổ thông',  rowStart: 11, rowEnd: 30, priceMultiplier: 1.0 },
];

// Helper: chuyển từ API value (ECONOMY|BUSINESS|FIRST) sang internal SeatClassCode
export const mapApiSeatClass = (apiValue: string): SeatClassCode => {
  const map: Record<string, SeatClassCode> = {
    ECONOMY: 'economy',
    BUSINESS: 'business',
    FIRST: 'first',
  };
  return map[apiValue?.toUpperCase()] ?? 'economy';
};

// Dữ liệu mẫu cho một số ghế cụ thể (thực tế sẽ lấy từ API)
// Chỉ định status và price cho các ghế này, còn lại mặc định available với price 0
export const initialSeats: Array<Pick<Seat, 'id' | 'status' | 'price'>> = [
  { id: '1A', status: 'occupied', price: 0 },
  { id: '1B', status: 'booked', price: 0 },
  { id: '1C', status: 'available', price: 260 },
  { id: '4A', status: 'occupied', price: 0 },
  { id: '4C', status: 'booked', price: 0 },
  { id: '11D', status: 'occupied', price: 0 },
  { id: '12E', status: 'booked', price: 0 },
];

export const getSeatClassByRow = (row: number): SeatClassCode => {
  if (row <= 3) return 'first';
  if (row <= 10) return 'business';
  return 'economy';
};

export const buildSeat = (id: string, status: SeatStatus, price: number, seatClass: SeatClassCode): Seat => ({
  id,
  status,
  price,
  seatClass,
  occupied: status === 'booked' || status === 'occupied',
});