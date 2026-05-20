import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

// Auth
import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { VerifyEmail } from '../pages/auth/VerifyEmail';

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

// Staff
import { CancelRequests } from '../pages/staff/CancelRequests';
import { StaffAllBookings } from '../pages/staff/StaffAllBookings';
import { StaffFlights } from '../pages/staff/StaffFlights';


const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/search" replace />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Email verification: link trong mail → /verify-email?token=UUID → gọi BE → redirect /login */}
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Customer Search & Results */}
        <Route path="/search" element={<FlightSearch />} />
        <Route path="/results" element={<FlightResults />} />

        {/* /detail/:id — dùng flightId thực từ API */}
        <Route path="/detail/:id" element={<FlightDetail />} />

        {/* Booking Journey — Cần đăng nhập (passenger/admin/staff) */}
        <Route path="/booking/seat" element={
          <ProtectedRoute allowedRoles={['passenger', 'admin', 'staff']}>
            <SeatSelection />
          </ProtectedRoute>
        } />
        <Route path="/booking/payment" element={
          <ProtectedRoute allowedRoles={['passenger', 'admin', 'staff']}>
            <Payment />
          </ProtectedRoute>
        } />
        {/* ZaloPay redirect về đây sau khi thanh toán: ?status=1&apptransid=... */}
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route path="/booking/payment-result" element={<Navigate to="/payment-result" replace />} />

        {/* My Bookings — Passenger quản lý đặt chỗ */}
        <Route path="/bookings" element={
          <ProtectedRoute allowedRoles={['passenger', 'admin', 'staff']}>
            <MyBookings />
          </ProtectedRoute>
        } />
      </Route>

      {/* Admin — chỉ role 'admin' mới vào được */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/flights" element={<ProtectedRoute allowedRoles={['admin']}><FlightManagement /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><BookingManagement /></ProtectedRoute>} />
      <Route path="/admin/airlines" element={<ProtectedRoute allowedRoles={['admin']}><AirlineManagement /></ProtectedRoute>} />
      <Route path="/admin/airports" element={<ProtectedRoute allowedRoles={['admin']}><AirportManagement /></ProtectedRoute>} />
      <Route path="/admin/aircrafts" element={<ProtectedRoute allowedRoles={['admin']}><AircraftManagement /></ProtectedRoute>} />
      <Route path="/admin/routes" element={<ProtectedRoute allowedRoles={['admin']}><RouteManagement /></ProtectedRoute>} />
      <Route path="/admin/seats" element={<ProtectedRoute allowedRoles={['admin']}><SeatManagement /></ProtectedRoute>} />
      <Route path="/admin/pricing" element={<ProtectedRoute allowedRoles={['admin']}><PricingDashboard /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin']}><ServicesManagement /></ProtectedRoute>} />
      <Route path="/admin/policies" element={<ProtectedRoute allowedRoles={['admin']}><PolicyManagement /></ProtectedRoute>} />

      {/* Staff — chỉ role 'staff' và 'admin' mới vào được */}
      <Route path="/staff" element={<Navigate to="/staff/cancel-requests" replace />} />
      <Route path="/staff/cancel-requests" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><CancelRequests /></ProtectedRoute>} />
      <Route path="/staff/bookings" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffAllBookings /></ProtectedRoute>} />
      <Route path="/staff/flights" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffFlights /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;
