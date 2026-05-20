import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "../api/types";

interface User {
    email: string;
    fullName: string;
    phone: string;
    role: UserRole; // 'passenger' | 'admin' | 'staff'
}

interface AuthState {
    accessToken: string | null;
    user: User | null;
    role: string | null;
    isAuthenticated: boolean;
    setToken: (accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    setRole: (role: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            user: null,
            role: null,
            isAuthenticated: false,
            setToken: (accessToken: string, refreshToken: string) => {
                // JWT không chứa role — role sẽ được set qua setUser() sau khi gọi /api/users/me
                set({ accessToken, isAuthenticated: true });
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
            },
            setUser: (user: User) => {
                // Đồng thời cập nhật role trong state để ProtectedRoute hoạt động
                set({ user, role: user.role });
            },
            setRole: (role) => {
                set({ role });
            },
            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({
                    accessToken: null,
                    user: null,
                    role: null,
                    isAuthenticated: false,
                });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                accessToken: state.accessToken,
                user: state.user,
                role: state.role,
                isAuthenticated: state.isAuthenticated,
            })
        }
    )
);
