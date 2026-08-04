import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserFromToken, isTokenExpired } from '../lib/jwt';
import type { User } from '@entities/auth/model/types';

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isSessionExpired: boolean;
    hasHydrated: boolean;

    setAuth: (token: string) => void;
    setSessionExpired: (value: boolean) => void;
    setHasHydrated: (value: boolean) => void;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            isSessionExpired: false,
            hasHydrated: false,

            setAuth: (token: string) => {
                const user = getUserFromToken(token);
                set({
                    token,
                    user: user || null,
                    isAuthenticated: true,
                    isSessionExpired: false,
                });
            },
            
            setSessionExpired: (value: boolean) => {
                set({ isSessionExpired: value });
            },

            setHasHydrated: (value: boolean) => {
                set({ hasHydrated: value });
            },

            logout: () => {
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                    isSessionExpired: false,
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
            partialize: (state) => ({ 
                user: state.user,
            }), // Persist minimal user context, NOT tokens
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
