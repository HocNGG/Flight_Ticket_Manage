import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export function useLogin() {
    const navigate = useNavigate();
    const { setToken, setUser } = useAuthStore();

    return useMutation({
        mutationFn: ({ email, password }: { email: string, password: string }) =>
            authApi.login(email, password),
        onSuccess: async (res) => {
            const { accessToken, refreshToken } = res.data.data;

            // Bước 1: lưu token (JWT không chứa role, không decode)
            setToken(accessToken, refreshToken);

            // Bước 2: gọi /api/users/me để lấy thông tin user + role
            let role: string = 'passenger';
            try {
                const meRes = await authApi.getMe();
                const userProfile = meRes.data.data; // { email, fullName, phone, role }
                setUser(userProfile); // setUser() sẽ tự động sync role vào state
                role = userProfile.role ?? 'passenger';
            } catch {
                // Không lấy được profile không sao — token vẫn hợp lệ
            }

            // Bước 3: Chuyển hướng dựa theo role
            const normalizedRole = role.toLowerCase();
            if (normalizedRole === 'admin') {
                navigate('/admin/dashboard');
            } else if (normalizedRole === 'staff') {
                navigate('/staff/cancel-requests');
            } else {
                navigate('/search');
            }
        },
    });
}

export function useRegister() {
    return useMutation({
        mutationFn: (data: {
            email: string;
            password: string;
            fullName: string;
            phoneNumber: string;
        }) => authApi.register(data),
        //onSuccess xử lý ổ component ( show "check mail")
    });
}

export function useRequestPasswordReset() {
    return useMutation({
        mutationFn: (email: string) => authApi.requestPasswordReset(email),
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: ({
            email,
            otp,
            newPassword,
        }: {
            email: string;
            otp: string;
            newPassword: string;
        }) => authApi.resetPassword(email, otp, newPassword),
    });
}