import { ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import authApi from '../../api/authApi';
import userApi from '../../api/userApi';
import type { LoginRequest } from '../../types/auth';
export const Login = () => {
  const navigate = useNavigate();
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginRequest>();
  const onSubmit = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      
      if (response.success && response.data) {
        const token = response.data.accessToken || response.data.token; 
        if (token) {
          localStorage.setItem('access_token', token);
          try {
            const profileResponse = await userApi.getprofile();
            
            if (profileResponse.success && profileResponse.data) {
                localStorage.setItem('user_info', JSON.stringify(profileResponse.data))
                window.dispatchEvent(new Event('auth-change'));
                toast.success('Đăng nhập thành công!'); 
                navigate('/');
            }
        } catch (profileError) {
            console.error('Lỗi lấy thông tin:', profileError);
            toast.error('Đăng nhập thành công nhưng không lấy được thông tin!');
        }
        } else {
          toast.error('Lỗi: Không nhận được token từ hệ thống.');
        }
      } else {
        toast.error(response.message || 'Đăng nhập thất bại!');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
    }
  };
  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 pb-24 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-100 to-surface -z-10"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[70%] bg-red-50 rounded-full blur-[120px] -z-10 opacity-60"></div>

      <div className="w-full max-w-[420px] bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/5 relative hover:shadow-red/5 transition-shadow duration-500">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Login</h1>
        <p className="text-sm font-medium text-gray-500 mb-10">Welcome back to the horizon.</p>
        
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
           <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Email</label>
              <input 
                 type="email" 
                 placeholder="flyer@aviation.com"
                 disabled={isSubmitting}
                 {...register('email', { 
                   required: 'Vui lòng nhập Email',
                   pattern: {
                     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                     message: "Email không đúng định dạng"
                   }
                 })}
                 className={`w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 transition-all ${
                   errors.email ? 'ring-2 ring-red-500' : 'focus:ring-red/20'
                 }`} 
              />
              {/* Hiển thị lỗi nếu có */}
              {errors.email && (
                <span className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email.message}</span>
              )}
           </div>

           <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Password</label>
              <input 
                 type="password" 
                 placeholder="••••••••" 
                 disabled={isSubmitting} 
                 {...register('password', { required: 'Vui lòng nhập Mật khẩu' })}
                 className={`w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 transition-all ${
                   errors.password ? 'ring-2 ring-red-500' : 'focus:ring-red/20'
                 }`} 
              />
              {/* Hiển thị lỗi nếu có */}
              {errors.password && (
                <span className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password.message}</span>
              )}
           </div>

           <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="rememberMe"
                className="w-5 h-5 rounded border-gray-300 text-red focus:ring-red cursor-pointer"
                {...register('rememberMe' as any)}
              />
              <label htmlFor="rememberMe" className="text-xs font-semibold text-gray-600 cursor-pointer">Remember me</label>
           </div>

           <button 
             type="submit"
             disabled={isSubmitting}
             className={`w-full text-white rounded-full h-14 font-bold text-sm tracking-wider flex items-center justify-center gap-2 mt-8 shadow-lg transition-colors ${
               isSubmitting ? 'bg-red/70 cursor-not-allowed shadow-none' : 'bg-red hover:bg-reddark shadow-red/20'
             }`}
           >
             {isSubmitting ? (
                <>
                  Signing in...
                  <Loader2 className="w-4 h-4 animate-spin" />
                </>
             ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
             )}
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
