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

      </Route>
    </Routes>
  );
};

export default AppRoutes;

