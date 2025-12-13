import { Box, Typography, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useLayoutStore } from '@shared/store/layout.store';

export function CotizacionesPage() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);

    useEffect(() => {
        setPageTitle('Cotizaciones');
    }, [setPageTitle]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Cotizaciones
            </Typography>
            <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="body1" color="text.secondary">
                    Esta página será implementada en el Sprint 3.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Módulo de gestión de cotizaciones con listado paginado, creación/edición de
                    cotización con detalle, y totalización.
                </Typography>
            </Paper>
        </Box>
    );
}
