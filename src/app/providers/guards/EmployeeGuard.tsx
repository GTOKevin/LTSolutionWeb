import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { useEmployeeAssociation } from '@features/profile';

interface EmployeeGuardProps {
    children: React.ReactNode;
    /**
     * Ruta a la que redirigir cuando el usuario NO es empleado. Se recibe por prop
     * (calculada por el llamador con `getDefaultAppRoute`) para no acoplar el guard
     * a la lógica de ruteo de `app`.
     */
    redirectTo: string;
}

export function EmployeeGuard({ children, redirectTo }: EmployeeGuardProps) {
    const { isEmployee, isEmployeeLoading, isEmployeeError, retryProfile } = useEmployeeAssociation();

    if (isEmployeeLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isEmployeeError) {
        return (
            <Box sx={{ p: 4 }}>
                <FetchErrorState
                    message="No se pudo verificar tu acceso al portal del empleado. Intenta nuevamente."
                    onRetry={retryProfile}
                />
            </Box>
        );
    }

    if (!isEmployee) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
