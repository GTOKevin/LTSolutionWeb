import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserFromToken, isTokenExpired } from '../lib/jwt';

interface User {
    userId: string;
    roleId: string;
    role: string;
    name: string | null;
    email: string | null;
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isSessionExpired: boolean;

    setAuth: (token: string, refreshToken: string) => void;
    setSessionExpired: (value: boolean) => void;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isSessionExpired: false,

            setAuth: (token: string, refreshToken: string) => {
                const user = getUserFromToken(token);
                set({
                    token,
                    refreshToken,
                    user: user || null,
                    isAuthenticated: true,
                    isSessionExpired: false
                });
            },
            
            setSessionExpired: (value: boolean) => {
                set({ isSessionExpired: value });
            },

            logout: () => {
                set({
                    token: null,
                    refreshToken: null,
                    user: null,
                    isAuthenticated: false,
                    isSessionExpired: false
                });
            },

            checkAuth: () => {
                const { token } = get();
                if (token && isTokenExpired(token)) {
                    // Do not logout immediately, let the interceptor handle refresh or expiry
                    // But if it's way past expiry, maybe?
                    // For now, keep as is but allow interceptor to do the work
                    // get().logout(); 
                }
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
