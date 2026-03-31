import { Outlet, Link, useLocation } from 'react-router-dom';

const MainLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/register');

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7]">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 h-[80px] flex items-center justify-between">
          <Link to="/" className="text-2xl font-black text-[#C9111E] tracking-tighter uppercase">
            Editorial Aviation
          </Link>
          
          {!isAuthPage && (
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/search" className="text-sm font-semibold text-[#C9111E] border-b-2 border-[#C9111E] py-1">Search</Link>
              <Link to="/bookings" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">My Bookings</Link>
              <Link to="/deals" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Deals</Link>
              <Link to="/help" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Help</Link>
            </nav>
          )}

          {!isAuthPage ? (
            <Link to="/login" className="bg-[#C9111E] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#A50D17] transition-colors">
              Login
            </Link>
          ) : (
            <Link to="/search" className="text-sm font-semibold text-[#C9111E]">Back to Search</Link>
          )}
        </div>
      </header>

      {/* Main Content (Outlet renders the child routes) */}
      <main className="flex-1 w-full bg-[#f6f6f6]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-8">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 font-medium">
          <div className="text-[#C9111E] text-sm font-black tracking-tighter uppercase mb-4 md:mb-0">
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