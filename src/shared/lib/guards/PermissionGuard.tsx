import { Navigate, useLocation } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';
import { Box, Typography, Button } from '@mui/material';

interface PermissionGuardProps {
    permission: string | string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
    const hasPermission = usePermission(permission);
    const location = useLocation();

    if (!hasPermission) {
        if (fallback) return <>{fallback}</>;
        
        return (
            <Box 
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 2,
                    p: 3
                }}
            >
                <Typography variant="h4" fontWeight="bold" color="error">
                    Acceso Denegado
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center">
                    No tienes los permisos necesarios para ver esta página.
                </Typography>
                <Button 
                    variant="outlined" 
                    onClick={() => window.history.back()}
                >
                    Regresar
                </Button>
            </Box>
        );
    }

    return <>{children}</>;
}
