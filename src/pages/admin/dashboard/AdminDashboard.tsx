import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane, BookOpen, Building2, MapPin, Cpu, Route, Armchair, Wrench, FileText,
  ArrowRight, CheckCircle2, Clock, XCircle, DollarSign, Users,
} from 'lucide-react';
import { AdminLayout } from '../../../layouts/AdminLayout';

const formatPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const KPI_DATA = [
  { label: 'Chuyến bay hôm nay', value: '24', sub: '+3 so với hôm qua', light: 'bg-blue-50 text-blue-600', icon: Plane },
  { label: 'Đặt chỗ mới', value: '138', sub: 'Trong 24h qua', light: 'bg-green-50 text-green-600', icon: BookOpen },
  { label: 'Doanh thu tháng', value: formatPrice(128_500_000), sub: '↑ 12% so với tháng trước', light: 'bg-red/10 text-red', icon: DollarSign },
  { label: 'Hành khách', value: '2,847', sub: 'Tổng trong tháng', light: 'bg-purple-50 text-purple-600', icon: Users },
];

const QUICK_LINKS = [
  { label: 'Chuyến bay', path: '/admin/flights', icon: Plane, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Đặt chỗ', path: '/admin/bookings', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Hãng bay', path: '/admin/airlines', icon: Building2, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Sân bay', path: '/admin/airports', icon: MapPin, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { label: 'Máy bay', path: '/admin/aircrafts', icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Tuyến bay', path: '/admin/routes', icon: Route, color: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'Ghế ngồi', path: '/admin/seats', icon: Armchair, color: 'text-pink-600', bg: 'bg-pink-50' },
  { label: 'Dịch vụ', path: '/admin/services', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Chính sách', path: '/admin/policies', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
];

const MOCK_BOOKINGS = [
  { bookingCode: 'BK123456', passenger: 'Nguyễn Văn A', flight: 'VN001', price: 2_500_000, status: 'PAID' },
  { bookingCode: 'BK123457', passenger: 'Trần Thị B', flight: 'VN002', price: 5_200_000, status: 'PENDING_PAYMENT' },
  { bookingCode: 'BK123458', passenger: 'Lê Văn C', flight: 'QH201', price: 1_800_000, status: 'CANCELLED' },
  { bookingCode: 'BK123459', passenger: 'Phạm Thị D', flight: 'VJ303', price: 3_100_000, status: 'PAID' },
  { bookingCode: 'BK123460', passenger: 'Hoàng Minh E', flight: 'BL415', price: 2_750_000, status: 'PENDING_PAYMENT' },
];

const statusConfig: Record<string, { label: string; color: string; Icon: React.FC<{ className?: string }> }> = {
  PAID: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700', Icon: Clock },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', Icon: XCircle },
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {time.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — {time.toLocaleTimeString('vi-VN')}
            </p>
          </div>
          <button onClick={() => navigate('/admin/flights')} className="hidden sm:flex items-center gap-2 bg-red hover:bg-red/90 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
            <Plane className="w-4 h-4" /> Thêm chuyến bay
          </button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {KPI_DATA.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.light}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">{k.value}</p>
                <p className="text-xs font-bold text-gray-500 mt-1">{k.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{k.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm">Điều hướng nhanh</h2>
            </div>
            <div className="p-3 grid grid-cols-2 gap-1.5">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button key={link.path} onClick={() => navigate(link.path)}
                    className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${link.bg} flex-shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${link.color}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 leading-tight">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent bookings */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-sm">Đặt chỗ gần đây</h2>
              <button onClick={() => navigate('/admin/bookings')} className="text-red text-xs font-bold flex items-center gap-1 hover:underline">
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Mã booking', 'Hành khách', 'Chuyến bay', 'Giá', 'Trạng thái'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_BOOKINGS.map((b) => {
                    const cfg = statusConfig[b.status];
                    const { Icon: StatusIcon } = cfg;
                    return (
                      <tr key={b.bookingCode} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-black text-gray-800 text-xs tracking-wider">{b.bookingCode}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{b.passenger}</td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-700">{b.flight}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-700 whitespace-nowrap">{formatPrice(b.price)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${cfg.color}`}>
                            <StatusIcon className="w-2.5 h-2.5" />{cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
