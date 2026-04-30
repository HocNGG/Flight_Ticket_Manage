import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// Auth
import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';
import { ForgotPassword } from '../pages/auth/ForgotPassword';

// Customer Flow
import { FlightSearch } from '../pages/customer/search/FlightSearch';
import { FlightResults } from '../pages/customer/search/FlightResults';
import { FlightDetail } from '../pages/customer/search/FlightDetail';
import { SeatSelection } from '../pages/customer/booking/SeatSelection';
import { Payment } from '../pages/customer/payment/Payment';
import { PaymentResult } from '../pages/customer/payment/PaymentResult';
import { MyBookings } from '../pages/customer/booking-management/MyBookings';

// Admin
import { AdminDashboard } from '../pages/admin/dashboard/AdminDashboard';
import { AirlineManagement } from '../pages/admin/airlines/AirlineManagement';
import { FlightManagement } from '../pages/admin/flights/FlightManagement';
import { BookingManagement } from '../pages/admin/bookings/BookingManagement';
import { AirportManagement } from '../pages/admin/airports/AirportManagement';
import { AircraftManagement } from '../pages/admin/aircrafts/AircraftManagement';
import { RouteManagement } from '../pages/admin/routes/RouteManagement';
import { SeatManagement } from '../pages/admin/seats/SeatManagement';
import { PricingDashboard } from '../pages/admin/pricing/PricingDashboard';
import { ServicesManagement } from '../pages/admin/services/ServicesManagement';
import { PolicyManagement } from '../pages/admin/policies/PolicyManagement';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/search" replace />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Customer Search & Results */}
        <Route path="/search" element={<FlightSearch />} />
        <Route path="/results" element={<FlightResults />} />

        {/* /detail/:id — dùng flightId thực từ API */}
        <Route path="/detail/:id" element={<FlightDetail />} />

        {/* Booking Journey */}
        <Route path="/booking/seat" element={<SeatSelection />} />
        <Route path="/booking/payment" element={<Payment />} />
        {/* ZaloPay redirect về đây sau khi thanh toán: ?status=success|failed&bookingId=... */}
        <Route path="/booking/payment-result" element={<PaymentResult />} />

        {/* My Bookings — Passenger quản lý đặt chỗ */}
        <Route path="/my-bookings" element={<MyBookings />} />
      </Route>

      {/* Admin — mỗi trang tự wrap AdminLayout bên trong */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/flights" element={<FlightManagement />} />
      <Route path="/admin/bookings" element={<BookingManagement />} />
      <Route path="/admin/airlines" element={<AirlineManagement />} />
      <Route path="/admin/airports" element={<AirportManagement />} />
      <Route path="/admin/aircrafts" element={<AircraftManagement />} />
      <Route path="/admin/routes" element={<RouteManagement />} />
      <Route path="/admin/seats" element={<SeatManagement />} />
      <Route path="/admin/pricing" element={<PricingDashboard />} />
      <Route path="/admin/services" element={<ServicesManagement />} />
      <Route path="/admin/policies" element={<PolicyManagement />} />
    </Routes>
  );
};

export default AppRoutes;
