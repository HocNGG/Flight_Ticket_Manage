import { PlaneTakeoff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // Import Hook
import { toast } from 'react-toastify';
import authApi from '../../api/authApi';
import type { RegisterRequest } from '../../types/auth';

interface RegisterFormData extends RegisterRequest {
    confirmPassword: string;
}

export const Signup = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    // Khởi tạo React Hook Form
    const { 
        register, 
        handleSubmit, 
        watch, 
        formState: { errors } 
    } = useForm<RegisterFormData>();

    // Hàm xử lý khi dữ liệu đã hợp lệ
    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            // Chỉ gửi những trường mà API cần (loại bỏ confirmPassword)
            const { confirmPassword:_, ...registerData } = data;
            
            const response = await authApi.register(registerData);
            if (response.success) {
                toast.success("Đăng ký thành công. Vui lòng xác nhận lại email để kích hoạt tài khoản của bạn.");
                navigate('/login');
            }
        } catch (error : unknown) {
             console.error('Signup error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 pb-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-100 to-surface -z-10"></div>
            
            <div className="w-full max-w-[420px] bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl relative">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Register</h1>
                <p className="text-sm font-medium text-gray-500 mb-8">Begin your premium journey.</p>

                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    
                    {/* Email */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1">Email</label>
                        <input
                            {...register("email", { 
                                required: "Email là bắt buộc",
                                pattern: { value: /^\S+@\S+$/i, message: "Email không đúng định dạng" }
                            })}
                            placeholder="flyer@aviation.com"
                            className={`w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold focus:outline-none focus:ring-2 ${errors.email ? 'ring-red/50' : 'focus:ring-red/20'}`}
                        />
                        {errors.email && <span className="text-[10px] text-red-500 mt-1 ml-1">{errors.email.message}</span>}
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1">Full Name</label>
                        <input
                            {...register("fullName", { required: "Vui lòng nhập họ tên" })}
                            placeholder="Johnathan Doe"
                            className="w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red/20"
                        />
                        {errors.fullName && <span className="text-[10px] text-red-500 mt-1 ml-1">{errors.fullName.message}</span>}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1">Phone Number</label>
                        <input
                            {...register("phoneNumber", { required: "Vui lòng nhập số điện thoại" })}
                            placeholder="0123456789"
                            className="w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red/20"
                        />
                    </div>

                    {/* Passwords Group */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1">Password</label>
                            <input
                                type="password"
                                {...register("password", { 
                                    required: "Trường này là bắt buộc", 
                                    minLength: { value: 6, message: "Mật khẩu phải có tối thiểu 6 ký tự" } 
                                })}
                                placeholder="••••••"
                                className="w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red/20"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1">Confirm Password</label>
                            <input  
                                type="password"
                                {...register("confirmPassword", { 
                                    required: "Trường này là bắt buộc", 
                                    validate: (value) => value === watch('password') || "Không khớp với mật khẩu đăng ký"
                                })}
                                placeholder="••••••"
                                className="w-full bg-surface rounded-xl h-12 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red/20"
                            />
                        </div>
                    {(errors.password || errors.confirmPassword) && (
                        <p className="text-[10px] text-red-500 ml-1">
                            {errors.password?.message || errors.confirmPassword?.message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#E8E8E8] text-red hover:bg-[#dedede] transition-all rounded-full h-14 font-bold text-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : (
                            <>
                                Join Membership
                                <PlaneTakeoff className="w-5 h-5 -rotate-45" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 border-t border-gray-100 pt-6 text-center">
                    <p className="text-xs font-medium text-gray-500">
                        Already a member? <Link to="/login" className="text-red font-bold hover:underline text-red-600">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};