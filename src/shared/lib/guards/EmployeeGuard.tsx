import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useEmployeeAssociation } from '@features/profile/hooks/useEmployeeAssociation';
import { getDefaultAppRoute } from '@app/router/lib/default-app-route';
import { useAuthStore } from '@shared/store/auth.store';

export function EmployeeGuard({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    const { isEmployee, isEmployeeLoading } = useEmployeeAssociation();

    if (isEmployeeLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isEmployee) {
        return <Navigate to={getDefaultAppRoute(user, false)} replace />;
    }

    return <>{children}</>;
}