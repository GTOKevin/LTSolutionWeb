import { Box } from '@mui/material';
import { ViajeDetalle } from '@/features/viaje/ui/ViajeDetalle/ViajeDetalle';

export function ViajeDetallePage() {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
            <ViajeDetalle />
        </Box>
    );
}
