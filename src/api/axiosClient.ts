import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';

// 1. Khởi tạo instance
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 2. REQUEST INTERCEPTOR
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 3. RESPONSE INTERCEPTOR
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error: AxiosError) => {
    if (!error.response) {
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng!');
      return Promise.reject(error);
    }

    const status = error.response.status;
    const errorData = error.response.data as { message?: string };

    switch (status) {
      case 400:
        toast.warning(errorData.message || 'Dữ liệu gửi lên không hợp lệ!');
        break;

      case 401:
        if (error.config?.url?.includes('/auth/login')) {
          toast.error('Email hoặc mật khẩu không chính xác!');
        } else {
          // Nếu lỗi 401 ở các API khác (như lấy thông tin user, mua vé...) thì mới đá ra ngoài
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
          localStorage.removeItem('access_token');
          window.location.href = '/login'; 
        }
        break;

        case 403:
          toast.error(errorData.message);
          break;

      case 404:
        console.warn('API Endpoint không tồn tại:', error.config?.url);
        toast.warning('Không tìm thấy dữ liệu');
        break;
      case 409:
        toast.error('Email này đã được sử dụng');
        break;
      case 429: 
        toast.warning(errorData.message || 'Thao tác quá nhanh. Vui lòng đợi một lát!');
        break;

      case 500:
        toast.error('Hệ thống đang gặp sự cố. Vui lòng thử lại sau!');
        console.error('Server Error Detail:', errorData);
        break;

      default:
        toast.error('Đã có lỗi không xác định xảy ra!');
        break;
    }

    return Promise.reject(error);
  }
);

export default axiosClient;