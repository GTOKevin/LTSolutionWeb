import { Box, Typography, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useLayoutStore } from '@shared/store/layout.store';

export function ClientesPage() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);

    useEffect(() => {
        setPageTitle('Clientes');
    }, [setPageTitle]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Clientes
            </Typography>
            <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="body1" color="text.secondary">
                    Esta página será implementada en el Sprint 2.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Módulo de gestión de clientes con listado paginado, CRUD completo y gestión de
                    contactos.
                </Typography>
            </Paper>
        </Box>
    );
}
