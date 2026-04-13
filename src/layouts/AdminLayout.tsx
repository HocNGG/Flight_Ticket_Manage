import React from 'react';
import { Plane, BarChart3, Building2, LogOut } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const navigation = [
  { label: 'Airline Management', icon: Building2, path: '/admin/airlines' },
  { label: 'Flight Management', icon: Plane, path: '/admin/flights' },
  { label: 'Reports', icon: BarChart3 },
];

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-[80px] flex items-center justify-between">
          <Link to="/admin/airlines" className="text-2xl font-black text-red tracking-tighter uppercase">
            Editorial Aviation
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs overflow-hidden shadow-sm">
              <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="User avatar" />
            </div>
            <button type="button" className="flex items-center gap-2 text-gray-600 hover:text-red transition-colors font-medium">
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-[1440px] mx-auto px-6 py-8 w-full flex-1">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between h-[calc(100vh-8rem)] sticky top-28">
            <div>
              <div className="mb-10">
                <h2 className="text-2xl font-black tracking-tight text-gray-900">Admin Console</h2>
              </div>

              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  // If path matches perfectly or is a prefix and we want it active
                  const active = item.path && location.pathname.startsWith(item.path);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => item.path && navigate(item.path)}
                      className={`w-full flex items-center gap-3 rounded-3xl px-4 py-3 text-left transition ${active ? 'bg-red/10 text-red font-semibold' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <section className="space-y-6">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
};
