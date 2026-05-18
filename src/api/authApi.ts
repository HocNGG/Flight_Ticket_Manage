import api from './axiosInstance'
import type { ApiResponse, LoginResponse, RegisterResponse, UserProfile } from './types'

export const authApi = {
    login: (email: string, password: string) =>
        api.post<ApiResponse<LoginResponse>>('/api/auth/login', {
            email,
            password
        }),

    register: (data: {
        email: string;
        password: string;
        fullName: string;
        phoneNumber: string;
    }) => api.post<ApiResponse<RegisterResponse>>('/api/auth/register', data),

    requestPasswordReset: (email: string) =>
        api.post<ApiResponse<null>>(`/api/auth/request-password-reset?email=${email}`),

    resetPassword: (email: string, otp: string, newPassword: string) =>
        api.post<ApiResponse<null>>(`/api/auth/reset-password?email=${email}&otp=${otp}&newPassword=${newPassword}`),
    getMe: () => api.get<ApiResponse<UserProfile>>('/api/users/me'),

}