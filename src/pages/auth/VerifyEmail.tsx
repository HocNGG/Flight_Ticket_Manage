import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import { CheckCircle } from 'lucide-react';

export const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            authApi.verifyEmail(token)
                .then(() => {

                    setTimeout(() => navigate('/login'), 10000);
                })
                .catch((error) => {
                    console.error('Lỗi xác thực:', error);
                });
        }
    }, [token, navigate]);

    // Giao diện tĩnh: CHỈ hiển thị thành công
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center hover:shadow-xl transition-shadow">
                
                {/* Icon Check màu xanh lá */}
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
                
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                    Tuyệt vời! 🎉
                </h2>
                
                <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
                    Tài khoản của bạn đã được kích hoạt thành công. <br/>
                    Hệ thống đang tự động chuyển hướng...
                </p>

                {/* Nút bấm trong trường hợp họ không muốn đợi 3 giây */}
                <button 
                    onClick={() => navigate('/login')}
                    className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors w-full"
                >
                    Đi tới Đăng nhập ngay
                </button>

            </div>
        </div>
    );
};