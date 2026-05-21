import React, { useState } from 'react';
import {
  LayoutDashboard,
  Plane,
  BookOpen,
  Building2,
  MapPin,
  Cpu,
  Route,
  Armchair,
  TrendingUp,
  Wrench,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Flights', icon: Plane, path: '/admin/flights' },
  { label: 'Bookings', icon: BookOpen, path: '/admin/bookings' },
  { label: 'Airlines', icon: Building2, path: '/admin/airlines' },
  { label: 'Airports', icon: MapPin, path: '/admin/airports' },
  { label: 'Aircrafts', icon: Cpu, path: '/admin/aircrafts' },
  { label: 'Routes', icon: Route, path: '/admin/routes' },
  { label: 'Seats', icon: Armchair, path: '/admin/seats' },
  { label: 'Pricing', icon: TrendingUp, path: '/admin/pricing' },
  { label: 'Services', icon: Wrench, path: '/admin/services' },
  { label: 'Policies', icon: FileText, path: '/admin/policies' },
];

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-6 border-b border-white/10 ${collapsed ? 'justify-center px-3' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-red flex items-center justify-center flex-shrink-0">
          <Plane className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-black text-sm tracking-tight leading-none">Editorial</p>
            <p className="text-red text-[10px] font-bold uppercase tracking-widest">Aviation Admin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              id={`nav-${item.label.toLowerCase()}`}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 group
                ${active
                  ? 'bg-red text-white shadow-lg shadow-red/30'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`flex-shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-2">
        {/* Admin info */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2">
            <img
              src="https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff&size=32"
              alt="Admin avatar"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">Admin</p>
              <p className="text-slate-400 text-[10px] truncate">admin@aviation.com</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 hover:bg-red/20 hover:text-red transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-slate-900 transition-all duration-300 sticky top-0 h-screen
          ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-white hover:bg-red transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[240px] bg-slate-900 flex flex-col h-full">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 h-[60px] flex items-center px-6 gap-4">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-gray-500 hover:text-gray-800"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-700">Admin</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-semibold capitalize">
              {navigation.find(n => location.pathname.startsWith(n.path))?.label ?? 'Dashboard'}
            </span>
          </div>

          {/* Right */}
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-800">Admin</p>
              <p className="text-[10px] text-gray-400">Quản trị viên</p>
            </div>
            <img
              src="https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff&size=32"
              alt="Admin"
              className="w-8 h-8 rounded-full"
            />
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
