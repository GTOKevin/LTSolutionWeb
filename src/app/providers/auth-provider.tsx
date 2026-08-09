import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@shared/store/auth.store';
import { authApi } from '@entities/auth/api/auth.api';
import { Box, CircularProgress } from '@mui/material';
import { configureAuthHttpClient } from '@app/session/lib/configure-auth-http-client';
import { resetSessionClientState } from '@app/session/lib/reset-session-client-state';

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    configureAuthHttpClient();
    const queryClient = useQueryClient();
    const { isAuthenticated, hasHydrated, setAuth } = useAuthStore();
    const [isInitialized, setIsInitialized] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (!hasHydrated) {
            return;
        }

        if (initialized.current) return;
        initialized.current = true;

        const initAuth = async () => {
            if (isAuthenticated) {
                setIsInitialized(true);
                return;
            }

            try {
                const res = await authApi.refreshToken();
                setAuth(res.token);
            } catch {
                try {
                    await authApi.logout();
                } catch {
                    // The local session still needs to be cleared even if cookie cleanup fails.
                }
                resetSessionClientState(queryClient);
            }

            setIsInitialized(true);
        };

        initAuth();
    }, [hasHydrated, isAuthenticated, queryClient, setAuth]);

    if (!isInitialized) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                bgcolor: 'background.default'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return <>{children}</>;
}
