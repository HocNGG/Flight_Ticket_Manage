import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Danh sách role được phép vào trang này. VD: ['admin'] hoặc ['admin', 'staff'] */
  allowedRoles: string[];
}

/**
 * Bọc bên ngoài các Route cần bảo vệ.
 * - Chưa đăng nhập → Redirect về /login
 * - Đăng nhập rồi nhưng sai role → Redirect về trang phù hợp với role của họ
 * - Đúng role → Render trang bình thường
 */
export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role } = useAuthStore();

  // 1. Chưa đăng nhập gì hết → về trang Login
  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = role.toLowerCase(); // Normalize về chữ thường để so sánh
  const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(normalizedRole);

  // 2. Đã đăng nhập nhưng role không đúng
  if (!isAllowed) {
    // Admin bị chặn thì về /admin/dashboard
    if (normalizedRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    // Staff bị chặn thì về /staff/cancel-requests
    if (normalizedRole === 'staff') return <Navigate to="/staff/cancel-requests" replace />;
    // User thường bị chặn thì về trang tìm kiếm
    return <Navigate to="/search" replace />;
  }

  // 3. Đúng role → cho qua
  return <>{children}</>;
};
