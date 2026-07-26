import { Navigate } from 'react-router-dom';
import { APP_PATHS } from '@shared/config/app-routes';
import { useAuthStore } from '@shared/store/auth.store';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (!isAuthenticated) {
        return <Navigate to={APP_PATHS.login} replace />;
    }

    return <>{children}</>;
}
