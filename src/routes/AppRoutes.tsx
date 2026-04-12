import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
 // Auth
import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';

// Customer Flow
import { FlightSearch } from '../pages/customer/search/FlightSearch';
import { FlightResults } from '../pages/customer/search/FlightResults';
import { FlightDetail } from '../pages/customer/search/FlightDetail';
import { SeatSelection } from '../pages/customer/booking/SeatSelection';
import { Payment } from '../pages/customer/payment/Payment';
import { AirlineManagement } from '../pages/admin/airlines/AirlineManagement';
import { FlightManagement } from '../pages/admin/flights/FlightManagement';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/search" replace />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Customer Search & Results */}
        <Route path="/search" element={<FlightSearch />} />
        <Route path="/results" element={<FlightResults />} />
        <Route path="/detail/:id" element={<FlightDetail />} />

        {/* Booking Journey */}
        <Route path="/booking/seat" element={<SeatSelection />} />
        <Route path="/booking/payment" element={<Payment />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/airlines" element={<AirlineManagement />} />
      <Route path="/admin/flights" element={<FlightManagement />} />
    </Routes>
  );
};

export default AppRoutes;

