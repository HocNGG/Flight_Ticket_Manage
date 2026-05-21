import React, { useState } from 'react';
import { BookOpen, ClipboardList, Plane, LogOut, Menu, X } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const navigation = [
  { label: 'Booking Requests', icon: ClipboardList, path: '/staff/cancel-requests', badge: true },
  { label: 'All Bookings', icon: BookOpen, path: '/staff/bookings' },
  { label: 'Flights', icon: Plane, path: '/staff/flights' },
];

export const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm tracking-tight leading-none">Editorial</p>
            <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">Staff Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              id={`staff-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150
                ${active
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {item.badge && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                  ${active ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'}`}>
                  !
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <img
            src="https://ui-avatars.com/api/?name=Staff&background=f59e0b&color=fff&size=32"
            alt="Staff avatar"
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate">Staff</p>
            <p className="text-slate-400 text-[10px] truncate">Nhân viên hỗ trợ</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  const currentPage = navigation.find(n => location.pathname.startsWith(n.path))?.label ?? 'Staff Portal';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0 w-[220px] bg-slate-900 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[220px] bg-slate-900 flex flex-col h-full">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 h-[60px] flex items-center px-6 gap-4">
          <button className="lg:hidden text-gray-500 hover:text-gray-800" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <Link to="/staff/cancel-requests" className="text-gray-400 hover:text-gray-700">Staff</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-semibold">{currentPage}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-800">Staff</p>
              <p className="text-[10px] text-gray-400">Nhân viên hỗ trợ</p>
            </div>
            <img src="https://ui-avatars.com/api/?name=Staff&background=f59e0b&color=fff&size=32" alt="Staff" className="w-8 h-8 rounded-full" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
  );
};
