import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@shared/store/auth.store';

interface PublicRouteProps {
    children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/app" replace />;
    }

    return <>{children}</>;
}
