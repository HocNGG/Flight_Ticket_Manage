import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';

import type {
      LoginRequest,
      LoginResponse,
      RegisterRequest,
      RegisterResponse
} from '../types/auth';

const authApi = {
  login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return axiosClient.post('/auth/login', data);
  },

  register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return axiosClient.post('/auth/register', data);
  },

  verifyEmail(token: string): Promise<ApiResponse<string>> {
    return axiosClient.get('/auth/verify-email', {
      params: { token }
    });
  },

};

export default authApi;