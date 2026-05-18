// SeatSelection.tsx
// Tích hợp API: GET /api/flights/:id/seats + POST /api/bookings

import { Clock, Plane, ShieldCheck, Check } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SeatButton } from '../../../components/customer/booking/Seat';
import { useSeatSelection } from '../../../hooks/useSeatSelection';
import { seatClasses, type SeatClassCode, mapApiSeatClass } from '../../../data/flightSeat';
import { Enhance } from '../../../components/customer/booking/Enhance';
import { enhanceList } from '../../../data/filghtEnhance';
import { useFlightSeats } from '../../../hooks/useFlights';
import { useCreateBooking } from '../../../hooks/useBookings';
import { useState } from 'react';

// PassengerForm khớp với BE PassengerRequest
type PassengerForm = {
  fullName: string;        // BE: fullName
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  passportNumber: string;  // BE: bắt buộc
  nationality: string;
};

type ContactForm = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

// State từ FlightDetail navigate
type BookingState = {
  flightId?: string | number;
  seatClass?: string;
  flightCode?: string;
  departureAirport?: { code: string; name: string };
  arrivalAirport?: { code: string; name: string };
  departureTime?: string;
  arrivalTime?: string;
  basePrice?: number;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const location = useLocation();
  const bookingState = location.state as BookingState | null;

  // Convert API seat class (ECONOMY/BUSINESS/FIRST) → internal code (economy/business/first)
  const selectedSeatClass: SeatClassCode = bookingState?.seatClass
    ? mapApiSeatClass(bookingState.seatClass)
    : 'economy';
  const selectedClassConfig = seatClasses.find((item) => item.code === selectedSeatClass);

  // Form passenger — kớp với BE PassengerRequest
  const [passenger, setPassenger] = useState<PassengerForm>({
    fullName: '',
    gender: 'MALE',
    dateOfBirth: '',
    passportNumber: '',
    nationality: 'VN',
  });

  // Contact info
  const [contact, setContact] = useState<ContactForm>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handlePassengerChange = (field: keyof PassengerForm, value: string) => {
    setPassenger((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field: keyof ContactForm, value: string) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch sơ đồ ghế từ API — chỉ chạy khi có flightId
  const { data: apiSeats = [], isLoading: isLoadingSeats } = useFlightSeats(bookingState?.flightId);

  // Hook chọn ghế — nhận API seats thật
  const { selectedSeat, selectedSeatId, seatRows, handleSelectSeat, seatStatusLabel } =
    useSeatSelection(selectedSeatClass, bookingState?.basePrice ?? 0, apiSeats);

  // Tạo booking mutation
  const createBooking = useCreateBooking();

  // ✅ useEffect phải gọi TRƯỚC conditional return (Rules of Hooks)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Guard: redirect nếu thiếu state cần thiết
  if (!bookingState?.flightId || !selectedClassConfig) {
    return <Navigate to="/search" replace />;
  }

  // Tính giá theo hạng ghế đang chọn
  const ticketPrice = bookingState?.basePrice
    ? bookingState.basePrice * (selectedClassConfig.priceMultiplier ?? 1)
    : 0;

  const handleProceedToPayment = () => {
    if (!selectedSeat || selectedSeatId === null) {
      alert('Vui lòng chọn ghế trước khi tiếp tục.');
      return;
    }
    if (!passenger.fullName || !passenger.dateOfBirth || !passenger.passportNumber || !passenger.nationality) {
      alert('Vui lòng điền đầy đủ thông tin hành khách (họ tên, ngày sinh, hộ chiếu, quốc tịch).');
      return;
    }
    if (!contact.contactName || !contact.contactEmail || !contact.contactPhone) {
      alert('Vui lòng điền đầy đủ thông tin liên hệ.');
      return;
    }

    createBooking.mutate(
      {
        flightId: Number(bookingState.flightId),
        contactName: contact.contactName,
        contactEmail: contact.contactEmail,
        contactPhone: contact.contactPhone,
        passengers: [
          {
            flightSeatId: selectedSeatId,         // ID thực từ API
            passengerData: {
              fullName: passenger.fullName,
              gender: passenger.gender,
              dateOfBirth: passenger.dateOfBirth,
              passportNumber: passenger.passportNumber,
              nationality: passenger.nationality,
            },
          },
        ],
      },
      {
        onSuccess: (res) => {
          const { bookingId, bookingCode, totalPrice } = res.data.data;
          navigate('/booking/payment', {
            state: {
              bookingId,
              bookingCode,
              totalPrice,
              flightId: bookingState.flightId,
              flightCode: bookingState.flightCode,
              seatClass: bookingState.seatClass,
              selectedSeat,
              passenger,
              contact,
            },
          });
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Không thể tạo đặt chỗ. Vui lòng thử lại.';
          alert(msg);
        },
      },
    );
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-8 pb-32">

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">CHỌN GHẾ</h1>
          {bookingState?.flightCode && (
            <p className="text-gray-500 font-medium mt-2">
              {bookingState.flightCode} · {bookingState.departureAirport?.code} → {bookingState.arrivalAirport?.code}
            </p>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between w-full relative py-6 my-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[75%] h-0.5 bg-red"></div>
        <StepDot done /><StepDot done /><StepDot done /><StepDot active label="04" />
        <span className="relative z-10 bg-surface pl-4 text-[10px] font-bold uppercase tracking-widest text-dark">
          Bước 4: Chọn ghế & Thông tin
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left Column */}
        <div className="flex-1">

          {/* SEAT MAP */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden mb-8">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Khoang: {selectedClassConfig.label}</h2>
                <p className="text-xs text-gray-500 font-medium">{bookingState?.flightCode || 'Sơ đồ ghế'}</p>
              </div>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-100 rounded-sm"></div> Trống</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red rounded-sm"></div> Đã chọn</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-300 rounded-sm"></div> Đã đặt</div>
              </div>
            </div>

            {/* Seat Map */}
            <div className="bg-[#fcfcfc] rounded-3xl p-8 border border-gray-100 w-full max-w-lg mx-auto overflow-x-auto min-h-[250px]">
              {isLoadingSeats ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin" />
                </div>
              ) : seatRows.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                  Không có ghế khả dụng cho hạng này
                </div>
              ) : (
                <div className="space-y-4">
                  {seatRows.map((rowData) => (
                    <div key={rowData.rowNumber} className="flex gap-2 items-center px-4">
                      <span className="w-6 text-right text-gray-300 mr-2 text-xs">{rowData.rowNumber}</span>
                      {rowData.seats.map((seat, seatIndex) => (
                        <SeatButton
                          key={seat ? seat.id : `aisle-${seatIndex}`}
                          seat={seat}
                          isSelected={seat?.id === selectedSeat}
                          disabledByClass={Boolean(seat && seat.seatClass !== selectedSeatClass)}
                          onSelect={handleSelectSeat}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 text-sm font-semibold text-gray-600">{seatStatusLabel}</div>
          </div>
        </section>  


          {/* PASSENGER DETAILS */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-8">
            <p className="text-red text-[10px] font-bold uppercase tracking-widest mb-1">Thông tin hành khách</p>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">Thông tin người đặt vé</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* fullName */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
                  Họ và tên <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  value={passenger.fullName}
                  onChange={(e) => handlePassengerChange('fullName', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>

              {/* dateOfBirth */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
                  Ngày sinh <span className="text-red">*</span>
                </label>
                <input
                  type="date"
                  value={passenger.dateOfBirth}
                  onChange={(e) => handlePassengerChange('dateOfBirth', e.target.value)}
                  className="w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>

              {/* gender */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
                  Giới tính <span className="text-red">*</span>
                </label>
                <select
                  value={passenger.gender}
                  onChange={(e) => handlePassengerChange('gender', e.target.value)}
                  className="w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold text-gray-800 focus:outline-none appearance-none"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </div>

              {/* passportNumber */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
                  Số hộ chiếu <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  value={passenger.passportNumber}
                  onChange={(e) => handlePassengerChange('passportNumber', e.target.value)}
                  placeholder="B12345678"
                  className="w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>

              {/* nationality */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
                  Quốc tịch <span className="text-red">*</span>
                </label>
                <select
                  value={passenger.nationality}
                  onChange={(e) => handlePassengerChange('nationality', e.target.value)}
                  className="w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold text-gray-800 focus:outline-none appearance-none"
                >
                  <option value="VN">Việt Nam</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="CN">China</option>
                </select>
              </div>
            </div>
          </div>

          {/* CONTACT INFO */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-1">
              <Plane className="w-4 h-4 text-red" />
              <p className="text-red text-[10px] font-bold uppercase tracking-widest">Thông tin liên hệ</p>
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Người liên hệ</h2>
            <p className="text-sm text-gray-500 mb-6">Vé điện tử sẽ được gửi đến email này.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
                  Tên liên hệ <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  value={contact.contactName}
                  onChange={(e) => handleContactChange('contactName', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
                  Email <span className="text-red">*</span>
                </label>
                <input
                  type="email"
                  value={contact.contactEmail}
                  onChange={(e) => handleContactChange('contactEmail', e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
                  Số điện thoại <span className="text-red">*</span>
                </label>
                <input
                  type="tel"
                  value={contact.contactPhone}
                  onChange={(e) => handleContactChange('contactPhone', e.target.value)}
                  placeholder="0123456789"
                  className="w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-5 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700">Tên hành khách phải khớp chính xác với thông tin trên giấy tờ tùy thân khi làm thủ tục.</p>
            </div>
          </div>

          {/* Enhance */}
          <Enhance enhanceList={enhanceList} />

          <div className="flex justify-center md:justify-end mt-8">
            <button
              onClick={handleProceedToPayment}
              disabled={createBooking.isPending}
              className="bg-red text-white hover:bg-reddark transition-colors rounded-full px-8 py-3.5 font-bold text-sm shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {createBooking.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tạo đặt chỗ...
                </>
              ) : (
                'Tiến hành thanh toán'
              )}
            </button>
          </div>
        </div>

        {/* Right Column — Summary */}
        <aside className="w-full lg:w-[320px] flex-shrink-0 space-y-6">

          {/* Timer Card */}
          <div className="bg-[#fdf8ed] border border-[#f0e6d2] rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">GIỮ CHỖ CỦA BẠN</h3>
                <p className="text-gold font-black tracking-widest text-[10px] uppercase mt-1">14:59 CÒN LẠI</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 font-medium">Hoàn tất đặt chỗ trong thời gian quy định để giữ mức giá này.</p>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm sticky top-[100px]">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt giá</h3>

            <div className="space-y-4 text-xs font-medium border-b border-gray-100 pb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Giá vé ({selectedClassConfig.label})</span>
                <span className="text-gray-900 font-bold">{formatPrice(ticketPrice)}</span>
              </div>
              {selectedSeat && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Ghế {selectedSeat}</span>
                  <span className="text-red font-bold">Đã chọn</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Hạng ghế</span>
                <span className="text-gray-900 font-bold">{selectedClassConfig.label}</span>
              </div>
            </div>

            <div className="flex justify-between items-end pt-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tổng cộng</span>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-900">{formatPrice(ticketPrice)}</span>
                <p className="text-[8px] font-bold text-gray-400 tracking-widest uppercase text-right mt-1">ĐÃ BAO GỒM THUẾ</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const StepDot = ({ done, active, label }: { done?: boolean; active?: boolean; label?: string }) => (
  <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center relative z-10 ${done ? 'bg-red text-white' : active ? 'bg-white border-2 border-red text-red' : 'bg-white border-2 border-gray-200 text-gray-400'
    }`}>
    {done ? <Check className="w-3 h-3" /> : label}
  </div>
);
