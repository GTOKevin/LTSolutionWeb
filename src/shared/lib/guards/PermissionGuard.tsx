import { usePermission } from '../hooks/usePermission';
import { Box, Typography, Button } from '@mui/material';
import type { PermissionCheckMode } from '../permissions/hasPermission';

interface PermissionGuardProps {
    permission: string | string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
    mode?: PermissionCheckMode;
}

export function PermissionGuard({ permission, children, fallback, mode = 'any' }: PermissionGuardProps) {
    const hasPermission = usePermission(permission, mode);

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
