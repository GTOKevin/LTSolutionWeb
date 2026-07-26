import { Navigate } from 'react-router-dom';
import { APP_PATHS } from '@shared/config/app-routes';
import { useAuthStore } from '@shared/store/auth.store';

interface PublicRouteProps {
    children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to={APP_PATHS.appRoot} replace />;
    }

    return <>{children}</>;
}
