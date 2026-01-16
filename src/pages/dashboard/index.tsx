import { Box, Typography, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useLayoutStore } from '@shared/store/layout.store';

export function DashboardPage() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);

    useEffect(() => {
        setPageTitle('Sistema de Logística y Transporte');
    }, [setPageTitle]);

    return (
        <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    ¡Bienvenido al Sistema de Logística y Transporte!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Utiliza el menú lateral para navegar entre los módulos disponibles.
                </Typography>
            </Paper>
        </Box>
    );
}
