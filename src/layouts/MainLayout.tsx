import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation,useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, Settings, UserCircle } from 'lucide-react';
import type { UserInfoResponse } from '../types/user';
const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/signup');


  const [user, setUser] = useState<UserInfoResponse| null >(() => {
    const saved = localStorage.getItem('user_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncUser = () => {
      const saved = localStorage.getItem('user_info');
      const parsedUser = saved ? JSON.parse(saved) : null;
      setUser((prevUser: UserInfoResponse|null) => {
        if (JSON.stringify(prevUser) !== JSON.stringify(parsedUser)) {
          return parsedUser;
        }
        return prevUser;
      });
    };

    syncUser();

    window.addEventListener('auth-change', syncUser);
    window.addEventListener('storage', syncUser);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('auth-change', syncUser);
      window.removeEventListener('storage', syncUser);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    setUser(null);
    setIsOpen(false);
    navigate('/login');
    window.dispatchEvent(new Event('auth-change'));
  };

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
              <Link to="/search" className="text-sm font-semibold text-red border-b-2 border-red py-1">Search</Link>
              <Link to="/bookings" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">My Bookings</Link>
              <Link to="/deals" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Deals</Link>
              <Link to="/help" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Help</Link>
            </nav>
          )}

          {!isAuthPage ? (
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full transition-all duration-300 border border-gray-200"
                  >
                    <div className="w-7 h-7 bg-red rounded-full flex items-center justify-center text-white shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      Hi, {user.fullName || 'Guest'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* DROPDOWN MENU */}
                  {isOpen && (
                    <div className="absolute top-full left-0 right-0 w-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red/5 hover:text-red transition-colors"
                      >
                        <UserCircle className="w-4 h-4" />
                        My Profile
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red/5 hover:text-red transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>

                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red hover:bg-red/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-red text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-reddark transition-colors">
                  Login
                </Link>
              )}
            </div>
          ) : (
            <Link to="/search" className="text-sm font-semibold text-red">Back to Search</Link>
          )}
        </div>
      </header>

      {/* Main Content (Outlet renders the child routes) */}
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