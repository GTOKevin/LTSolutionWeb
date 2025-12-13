import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserFromToken, isTokenExpired } from '../lib/jwt';

interface User {
    userId: string;
    roleId: string;
    role: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;

    setAuth: (token: string) => void;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,

            setAuth: (token: string) => {
                const user = getUserFromToken(token);
                set({
                    token,
                    user,
                    isAuthenticated: true
                });
            },

            logout: () => {
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false
                });
            },

            checkAuth: () => {
                const { token } = get();
                if (token && isTokenExpired(token)) {
                    get().logout();
                }
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
