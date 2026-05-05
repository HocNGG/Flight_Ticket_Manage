import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    email: string;
    fullName: string;
    phone: string;
}

interface AuthState {
    accessToken: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setToken: (accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            setToken: (accessToken: string, refreshToken: string) => {
                set({
                    accessToken,
                    isAuthenticated: true,
                });
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
            },
            setUser: (user) => {
                set({ user });
            },
            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({
                    accessToken: null,
                    user: null,
                    isAuthenticated: false,
                });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                accessToken: state.accessToken,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            })
        }
    )
);
