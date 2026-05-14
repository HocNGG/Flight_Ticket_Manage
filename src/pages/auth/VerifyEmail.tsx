// pages/auth/VerifyEmail.tsx
// Khi user click link trong email → FE gọi BE verify → redirect /login

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosInstance';
import type { ApiResponse } from '../../api/types';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { isLoading, isSuccess, isError } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: async () => {
      const res = await api.get<ApiResponse<string>>(
        `/api/auth/verify-email?token=${token}`,
      );
      return res.data;
    },
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });

  // Tự động redirect về /login sau 3s nếu thành công
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100 p-12 max-w-md w-full text-center">

        {/* Loading */}
        {isLoading && (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-red animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
              Đang xác thực...
            </h1>
            <p className="text-gray-500 text-sm">Vui lòng chờ trong giây lát.</p>
          </>
        )}

        {/* Success */}
        {isSuccess && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
              Xác thực thành công!
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              Email của bạn đã được xác thực. Đang chuyển về trang đăng nhập...
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-red text-white hover:bg-reddark transition-colors rounded-xl h-12 font-bold text-sm tracking-widest uppercase"
            >
              Đăng nhập ngay
            </button>
          </>
        )}

        {/* Error / No token */}
        {(isError || !token) && !isLoading && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red/10 flex items-center justify-center">
                <XCircle className="w-9 h-9 text-red" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
              Xác thực thất bại
            </h1>
            <p className="text-gray-500 text-sm mb-2">
              {!token
                ? 'Không tìm thấy token xác thực.'
                : 'Link đã hết hạn hoặc không hợp lệ.'}
            </p>
            <p className="text-xs text-gray-400 mb-8">
              Vui lòng đăng ký lại hoặc liên hệ hỗ trợ.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/signup')}
                className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors rounded-xl h-12 font-bold text-sm"
              >
                Đăng ký lại
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 bg-red text-white hover:bg-reddark transition-colors rounded-xl h-12 font-bold text-sm"
              >
                Đăng nhập
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
