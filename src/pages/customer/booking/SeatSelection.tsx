// SeatSelection.tsx
// Component chính cho trang chọn ghế
// Tập trung vào UI, logic được tách vào hook useSeatSelection

import { Clock, Plane, ShieldCheck , Check, Mail } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SeatButton } from '../../../components/customer/booking/Seat';
import { useSeatSelection } from '../../../hooks/useSeatSelection';
import { Enhance } from '../../../components/customer/booking/Enhance';
import type { CreateBookingRequest } from '../../../types/booking/booking';
import { useEffect, useState } from 'react';
import type { PassengerInfo } from '../../../types/passenger/passenger';
import type { BookingPassengerRequest, BookingServiceRequest } from '../../../types/booking/bookingPassenger';
import type { SeatDetailDTO } from '../../../types/flight/seat';
import type { ServiceOptionDTO } from '../../../types/option/serviceoption';
import serviceApi from '../../../api/serviceApi';

export const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const flightId = location.state?.flightId;

  const [services, setServices] = useState<ServiceOptionDTO[]>([]);
  
  const { 
    selectedSeats, 
    seatRows, 
    aircraftInfo, 
    handleSelectSeat: handleSelectSeatFromHook, 
    loading, 
    seatStatusLabel 
  } = useSeatSelection(flightId);
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceApi.getAllService(); 
        if (response.data) {
          setServices(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    };
    fetchServices();
  }, []);
  const [bookingData, setBookingData] = useState<CreateBookingRequest>({
    contactEmail: '',
    contactPhone: '',
    contactName: '',
    flightId: flightId || 0,
    passengers: []
  });

  const onSeatClick = (seat: SeatDetailDTO | null) => {
    if (!seat || seat.status.toUpperCase() !== 'AVAILABLE') return;

    handleSelectSeatFromHook(seat);

    setBookingData(prev => {
      const isSelected = prev.passengers.find(p => p.flightSeatId === seat.flightSeatId);
      
      if (isSelected) {
        return { ...prev, passengers: prev.passengers.filter(p => p.flightSeatId !== seat.flightSeatId) };
      } else {
        const newPassenger: BookingPassengerRequest = {
          flightSeatId: seat.flightSeatId,
          passengerData: { fullName: '', dateOfBirth: '', gender: 'MALE', nationality: 'Vietnam' },
          serviceOptions: [],
          baggageOptions: []
        };
        return { ...prev, passengers: [...prev.passengers, newPassenger] };
      }
    });
  };

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    const newPassengers = [...bookingData.passengers];
    const pData = { ...newPassengers[index].passengerData, [field]: value };
    
    if (field === 'nationality') {
      value === 'Vietnam' ? delete pData.passportNumber : delete pData.cccd;
    } 

    newPassengers[index].passengerData = pData;
    setBookingData({ ...bookingData, passengers: newPassengers });
  };
  
  const toggleService = (pIdx: number, sId: number) => {
    setBookingData(prev => {
      const newPassengers = [...prev.passengers];
      const currentServices = newPassengers[pIdx].serviceOptions;
      const isSelected = currentServices.some(s => s.serviceOptionId === sId);

      if (isSelected) {
        newPassengers[pIdx].serviceOptions = currentServices.filter(s => s.serviceOptionId !== sId);
      } else {
        const newService: BookingServiceRequest = {
          serviceOptionId: sId,
          quantity: 1 
        };
        newPassengers[pIdx].serviceOptions = [...currentServices, newService];
      }

      return { ...prev, passengers: newPassengers };
    });
  };
  // Tính toán tiền cho Sidebar
  const totalSeatPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const taxFee = totalSeatPrice*0.1;

  if (loading) return <div className="p-20 text-center">Loading Seat Map...</div>;
  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-8 pb-32">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">SEAT SELECTION</h1>
        </div>
      </div>

      {/* Stepper Divider */}
      <div className="flex items-center justify-between w-full relative py-6 my-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[55%] h-0.5 bg-red"></div>

        <div className="w-6 h-6 rounded-full bg-red text-white flex items-center justify-center relative z-10"><Check className="w-3 h-3" /></div>
        <div className="w-6 h-6 rounded-full bg-red text-white flex items-center justify-center relative z-10"><Check className="w-3 h-3" /></div>
        <div className="w-6 h-6 rounded-full bg-white border-2 border-red text-red text-[10px] font-bold flex items-center justify-center relative z-10 bg-white">03</div>
        <div className="w-6 h-6 rounded-full bg-white text-gray-400 text-[10px] font-bold flex items-center justify-center relative z-10 border-2 border-gray-200">04</div>

        <span className="relative z-10 bg-surface pl-4 text-[10px] font-bold uppercase tracking-widest text-dark">Step 3: Selection & information</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Main Content */}
        <div className="flex-1">
          {/* SEAT MAP */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden mb-8">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Main Cabin</h2>
                <p className="text-xs text-gray-500 font-medium">{aircraftInfo || "Boeing 787-9 Dreamliner"}</p>
              </div>
              
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-100 rounded-sm"></div> AVAILABLE</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red rounded-sm"></div> SELECTED</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-300 rounded-sm"></div> OCCUPIED</div>
              </div>
            </div>

          {/* Seat Map Container */}
          <div className="bg-[#fcfcfc] rounded-3xl p-8 border border-gray-100 w-full max-w-lg mx-auto overflow-x-auto min-h-[250px]">
            <div className="space-y-4">
              {/* Render các hàng ghế */}
              {seatRows.map((rowSeats, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-2 items-center px-4 justify-center">
                  {/* Số hàng */}
                  <span className="w-6 text-right text-gray-300 mr-2 text-[10px] font-bold uppercase tracking-tighter">
                    {rowIndex + 1}
                  </span>

                  {/* Danh sách ghế trong hàng */}
                  {rowSeats.map((seat, seatIndex) => (
                    <SeatButton
                      key={seat ? seat.flightSeatId : `aisle-${rowIndex}-${seatIndex}`}
                      seat={seat}
                      isSelected={selectedSeats.some(s => s.flightSeatId === seat?.flightSeatId)}
                      onSelect={() => onSeatClick(seat)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-dashed border-gray-100 text-center">
            <span className="text-sm font-bold text-red uppercase tracking-widest animate-fadeIn">
              {seatStatusLabel}
            </span>
          </div>
        </div>

        {/* CONTACT INFORMATION  */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5 text-red" /> CONTACT INFORMATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Full Name</label>
              <input 
                placeholder="Johnathan Doe" 
                className="w-full bg-[#f3f4f6] border-none rounded-xl h-12 px-4 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-red/20 focus:bg-white transition-all outline-none"
                onChange={e => setBookingData({...bookingData, contactName: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Email Address</label>
              <input 
                placeholder="john.doe@example.com" 
                className="w-full bg-[#f3f4f6] border-none rounded-xl h-12 px-4 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-red/20 focus:bg-white transition-all outline-none"
                onChange={e => setBookingData({...bookingData, contactEmail: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Phone Number</label>
              <input 
                placeholder="(+84) 00-0000-000" 
                className="w-full bg-[#f3f4f6] border-none rounded-xl h-12 px-4 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-red/20 focus:bg-white transition-all outline-none"
                onChange={e => setBookingData({...bookingData, contactPhone: e.target.value})}
              />
            </div>
          </div>
        </section>  


        {/* PASSENGER DETAILS FORM */}
        <div className="mb-16">
          <p className="text-red text-[10px] font-bold uppercase tracking-widest mb-1">Information Checklist</p>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Passenger Details Required</h2>

          <div className="flex flex-col md:flex-row gap-8">
               <div className="flex-1 space-y-4">
                  <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed max-w-sm">
                    Ensure your details match your passport exactly to avoid boarding issues. Standard international travel regulations apply.
                  </p>

                  <div className="bg-white rounded-xl p-4 flex gap-4 border border-gray-100 shadow-sm">
                    <Plane className="w-5 h-5 text-red flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-gray-900">Passport Validity</p>
                      <p className="text-[10px] text-gray-500">Must be valid for at least 6 months after arrival.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 flex gap-4 border border-gray-100 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-red flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-gray-900">Official Documentation</p>
                      <p className="text-[10px] text-gray-500">All names must match government issued IDs.</p>
                    </div>
                  </div>
               </div>

               <div className="flex-[2] bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                  <div className="flex-1 w-full space-y-4">
                    {bookingData.passengers.length === 0 ? (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Select a seat to start</p>
                      </div>
                    ) : (
                      bookingData.passengers.map((passenger, idx) => (
                        <section 
                          key={passenger.flightSeatId} 
                          className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 b-w-full animate-fadeIn"
                        >
                          {/* Header */}
                          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
                            <h3 className="font-black text-gray-900 text-xs tracking-tight">
                              PASSENGER #{idx + 1}
                            </h3>
                            <span className="text-[10px] font-bold text-red bg-red/5 px-3 py-0.5 rounded-full border border-red/10">
                              SEAT {selectedSeats.find(s => s.flightSeatId === passenger.flightSeatId)?.seatNumber}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                            {/* Full Name */}
                            <div className="md:col-span-3">
                              <label className="text-[9px] font-bold text-gray-800 uppercase tracking-wider block mb-1 ml-1">Full Legal Name</label>
                              <input 
                                placeholder="Jonathan Doe" 
                                className="w-full bg-[#f3f4f6] border-none rounded-lg h-10 px-3 text-xs font-semibold text-gray-800 focus:ring-1 focus:ring-red/30 focus:bg-white transition-all outline-none"
                                onChange={e => updatePassenger(idx, 'fullName', e.target.value.toUpperCase())} 
                              />
                            </div>

                            {/* Gender -*/}
                            <div className="md:col-span-3">
                              <label className="text-[9px] font-bold text-gray-800 uppercase tracking-wider block mb-1 ml-1">Gender</label>
                              <div className="flex gap-2">
                                {['MALE', 'FEMALE'].map((gender) => (
                                  <button
                                    key={gender}
                                    type="button"
                                    onClick={() => updatePassenger(idx, 'gender', gender)}
                                    className={`flex-1 h-10 rounded-lg text-[9px] font-black tracking-widest transition-all border ${
                                      passenger.passengerData.gender === gender 
                                      ? 'bg-red text-white border-red shadow-sm' 
                                      : 'bg-[#f3f4f6] text-gray-400 border-transparent hover:bg-gray-200'
                                    }`}
                                  >
                                    {gender}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Date of Birth */}
                            <div className="md:col-span-2">
                              <label className="text-[9px] font-bold text-gray-800 uppercase tracking-wider block mb-1 ml-1">Date of Birth</label>
                              <input 
                                type="date" 
                                className="w-full bg-[#f3f4f6] border-none rounded-lg h-10 px-3 text-xs font-semibold text-gray-800 focus:ring-1 focus:ring-red/30 focus:bg-white transition-all outline-none"
                                onChange={e => updatePassenger(idx, 'dateOfBirth', e.target.value)} 
                              />
                            </div>

                            {/* Nationality */}
                            <div className="md:col-span-2">
                              <label className="text-[9px] font-bold text-gray-800 uppercase tracking-wider block mb-1 ml-1">Nationality</label>
                              <select 
                                className="w-full bg-[#f3f4f6] border-none rounded-lg h-10 px-3 text-xs font-semibold text-gray-800 focus:ring-1 focus:ring-red/30 focus:bg-white transition-all outline-none cursor-pointer"
                                onChange={e => updatePassenger(idx, 'nationality', e.target.value)}
                                defaultValue="Vietnam"
                              >
                                <option value="Vietnam">Vietnam</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>

                            {/* Identification (CCCD/Passport) */}
                            <div className="md:col-span-2 animate-slideDown">
                              <label className="text-[9px] font-bold text-red uppercase tracking-wider block mb-1 ml-1">
                                {passenger.passengerData.nationality === 'Vietnam' ? 'CCCD' : 'Passport Number'}
                              </label>
                              <input 
                                placeholder={passenger.passengerData.nationality === 'Vietnam' ? "001203xxxxxx" : "P12345678"} 
                                className="w-full bg-[#f3f4f6] border border-red/20 rounded-lg h-10 px-3 text-xs font-semibold text-gray-800 focus:ring-1 focus:ring-red/40 focus:bg-white transition-all outline-none shadow-inner"
                                onChange={e => updatePassenger(idx, 
                                  passenger.passengerData.nationality === 'Vietnam' ? 'cccd' : 'passportNumber', 
                                  e.target.value
                                )} 
                              />
                            </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-gray-50">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Personal Extras</p>
                              <Enhance 
                                  enhanceList={services} 
                                  onAdd={(s) => toggleService(idx, s.serviceId)}
                                  selectedServices={passenger.serviceOptions.map(s => s.serviceOptionId)}
                              />
                          </div>
                        </section>
                      ))
                    )}
                  </div>
                
               </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <aside className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
           
           {/* Timer Card */}
           <div className="bg-[#fdf8ed] border border-[#f0e6d2] rounded-2xl p-6 shadow-sm">
             <div className="flex items-start gap-4 mb-3">
               <div className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center flex-shrink-0">
                 <Clock className="w-4 h-4" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900 leading-tight">HOLDING YOUR SEAT</h3>
                 <p className="text-gold font-black tracking-widest text-[10px] uppercase mt-1">14:59 REMAINING</p>
               </div>
             </div>
             <p className="text-xs text-gray-600 font-medium">We've reserved Seat 13B for you. Complete your booking within the time limit to secure this price.</p>
           </div>

           {/* Price Summary Card */}
           <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden sticky top-[100px]">
             
             <h3 className="text-xl font-bold text-gray-900 mb-6">Price Summary</h3>
             
             <div className="space-y-4 text-xs font-medium border-b border-gray-100 pb-6">
                 <div className="flex justify-between">
                   <span className="text-gray-500">Base Fare (London - Tokyo)</span>
                   <span className="text-gray-900 font-bold">$842.00</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-500">Preferred Seat (13B)</span>
                   <span className="text-red font-bold">+$45.00</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-500">Taxes & Fees</span>
                   <span className="text-gray-900 font-bold">$112.40</span>
                 </div>
             </div>
             
             <div className="flex justify-between items-end pt-6">
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total</span>
               <div className="text-right">
                 <span className="text-2xl font-black text-gray-900">{totalSeatPrice}</span>
                 <p className="text-[8px] font-bold text-gray-400 tracking-widest uppercase text-right mt-1">ALL INCLUSIVE</p>
               </div>
             </div>

             {/* Promo Image inside sidebar now */}
             <div className="rounded-[1rem] overflow-hidden relative shadow-sm group cursor-pointer border border-transparent mt-8">
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
               <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80" alt="Japan" className="w-full h-[120px] object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute bottom-4 left-4 right-4 z-20">
                 <h3 className="text-xs font-bold text-white leading-tight">Your Japanese adventure is just a few steps away.</h3>
               </div>
            </div>
            <div className="flex justify-center  mt-8">
                <button onClick={() => navigate('/booking/payment')} className="bg-red text-white hover:bg-reddark transition-colors rounded-full px-8 py-3.5 font-bold text-sm shadow-md">
                  Payment & Extras 
                </button>
              </div>       
           </div>
        </aside>

      </div>
    </div>
  );
};

