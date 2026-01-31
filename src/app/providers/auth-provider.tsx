import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@shared/store/auth.store';
import { authApi } from '@entities/auth/api/auth.api';
import { Box, CircularProgress } from '@mui/material';

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { isAuthenticated, user, setAuth, logout } = useAuthStore();
    const [isInitialized, setIsInitialized] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initAuth = async () => {
            // If already authenticated, nothing to do
            if (isAuthenticated) {
                setIsInitialized(true);
                return;
            }

            // If we have a persisted user but no token (e.g. page reload), try to refresh
            if (user) {
                try {
                    // Send empty tokens, backend checks cookie
                    const res = await authApi.refreshToken({ token: '', refreshToken: '' });
                    setAuth(res.token, res.refreshToken);
                } catch (error) {
                    console.error('Failed to restore session:', error);
                    logout(); // Clear invalid/stale user data
                }
            }

            setIsInitialized(true);
        };

        initAuth();
    }, []); // Run once on mount

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
