import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/signup');

  // Đọc từ Zustand — tự động re-render ngay khi login/logout
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Lấy chữ cái đầu của tên để làm avatar
  const avatarLetter = user?.fullName?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 h-[80px] flex items-center justify-between">
          <Link to="/" className="text-2xl font-black text-red tracking-tighter uppercase">
            Editorial Aviation
          </Link>

          {!isAuthPage && (
            <nav className="hidden md:flex items-center gap-8">
              {[
                { path: '/search', label: 'Search' },
                { path: '/bookings', label: 'My Bookings' },
                { path: '/deals', label: 'Deals' },
                { path: '/help', label: 'Help' },
              ].map((item) => {
                const isActive = location.pathname.includes(item.path) || (item.path === '/search' && location.pathname === '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`py-1 transition-colors ${
                      isActive
                        ? 'text-sm font-semibold text-red border-b-2 border-red'
                        : 'text-sm font-medium text-gray-500 hover:text-black border-b-2 border-transparent'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Góc phải: thay đổi theo trạng thái đăng nhập */}
          {isAuthPage ? (
            <Link to="/search" className="text-sm font-semibold text-red">Back to Search</Link>
          ) : isAuthenticated ? (
            // ✅ Đã đăng nhập: hiện avatar + tên + Logout
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {avatarLetter}
              </div>
              <span className="text-sm font-semibold text-gray-800 hidden md:block">
                {user?.fullName ?? 'Traveler'}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-gray-400 hover:text-red transition-colors uppercase tracking-widest"
              >
                Logout
              </button>
            </div>
          ) : (
            // ❌ Chưa đăng nhập: nút Login
            <Link to="/login" className="bg-red text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-reddark transition-colors">
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-surface">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-8">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 font-medium">
          <div className="text-red text-sm font-black tracking-tighter uppercase mb-4 md:mb-0">
            Editorial Aviation
          </div>
          <div className="flex gap-6 mb-4 md:mb-0">
            <Link to="/support" className="hover:text-black transition-colors uppercase tracking-wider">Support</Link>
            <Link to="/privacy" className="hover:text-black transition-colors uppercase tracking-wider">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-black transition-colors uppercase tracking-wider">Terms of Carriage</Link>
            <Link to="/sitemap" className="hover:text-black transition-colors uppercase tracking-wider">Sitemap</Link>
          </div>
          <div>© 2024 EDITORIAL AVIATION. THE KINETIC HORIZON.</div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;