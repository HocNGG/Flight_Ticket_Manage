import { PlaneTakeoff } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuth';

export const Signup = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const registerMutation = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    registerMutation.reset(); // Xóa lỗi cũ mỗi khi user gõ lại
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(form, {
      onSuccess: () => setSubmitted(true),
    });
  };

  // Lấy thông báo lỗi từ server, fallback về thông báo mặc định
  const errorMsg = registerMutation.error
    ? (registerMutation.error as any)?.response?.data?.message || 'Đăng ký thất bại.'
    : '';

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 pb-24 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-100 to-surface -z-10"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[70%] bg-red-50 rounded-full blur-[120px] -z-10 opacity-60"></div>

      <div className="w-full max-w-[420px] bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/5 relative hover:shadow-red/5 transition-shadow duration-500">

        {/* Decorative corner shape */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-surface rounded-bl-full -z-10"></div>

        {submitted ? (
          // ✅ Thành công: yêu cầu xác thực email
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlaneTakeoff className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Đăng ký thành công!</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Vui lòng kiểm tra email <span className="font-bold text-gray-800">{form.email}</span> để xác thực tài khoản trước khi đăng nhập.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block text-red font-bold text-sm hover:underline"
            >
              Về trang đăng nhập
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Register</h1>
            <p className="text-sm font-medium text-gray-500 mb-8">Begin your premium journey.</p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Error message — lấy từ registerMutation.error */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl px-4 py-3">
                  {errorMsg}
                </div>
              )}
              {/* Full Name */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">
                  Email
                </label>
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

              {/* Phone Number — required by API */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="0123456789"
                  required
                  className="w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">
                  Create Password
                </label>
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

              <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
                By registering, you agree to our Terms of Carriage and Privacy Policy regarding your personal data.
              </p>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-[#E8E8E8] text-red hover:bg-[#dedede] transition-colors rounded-full h-14 font-bold text-sm tracking-wider flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
              >
                {registerMutation.isPending ? 'Registering...' : 'Join Membership'}
                <PlaneTakeoff className="w-5 h-5 -rotate-45" />
              </button>
            </form>

            <div className="mt-8 border-t border-gray-100 pt-6 text-center">
              <p className="text-xs font-medium text-gray-500">
                Already a member? <Link to="/login" className="text-red font-bold hover:underline">Log in</Link>
              </p>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
