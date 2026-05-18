import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';

export const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    loginMutation.reset(); // Xóa lỗi cũ mỗi khi user gõ lại
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: form.email, password: form.password });
  };

  // Lấy thông báo lỗi từ response của server, fallback về thông báo mặc định
  const errorMsg = loginMutation.error
    ? (loginMutation.error as any)?.response?.data?.message || 'Email hoặc mật khẩu không chính xác.'
    : '';

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 pb-24 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-100 to-surface -z-10"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[70%] bg-red-50 rounded-full blur-[120px] -z-10 opacity-60"></div>

      <div className="w-full max-w-[420px] bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/5 relative hover:shadow-red/5 transition-shadow duration-500">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Login</h1>
        <p className="text-sm font-medium text-gray-500 mb-10">Welcome back to the horizon.</p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Error message — lấy từ loginMutation.error */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl px-4 py-3">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="flyer@aviation.com"
              required
              className="w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <Link
                to="/forgot-password"
                className="text-[10px] font-bold text-red hover:underline uppercase tracking-widest"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
            />
          </div>

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setRememberMe(!rememberMe)}
          >
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-red border-red' : 'border-gray-300'}`}>
              {rememberMe && <span className="text-white text-[10px] font-black">✓</span>}
            </div>
            <label className="text-xs font-semibold text-gray-600 cursor-pointer">Remember me</label>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-red text-white hover:bg-reddark transition-colors rounded-full h-14 font-bold text-sm tracking-wider flex items-center justify-center gap-2 mt-8 shadow-lg shadow-red/20 disabled:opacity-60"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center">
          <p className="text-xs font-medium text-gray-500">
            New traveler? <Link to="/signup" className="text-red font-bold hover:underline">Create account</Link>
          </p>
        </div>
      </div>

    </div>
  );
};
