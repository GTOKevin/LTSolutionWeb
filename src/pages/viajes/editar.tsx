import { Box } from '@mui/material';
import { ViajeEditar } from '@/features/viaje/ui/ViajeEditar/ViajeEditar';

export function ViajeEditarPage() {
    return (
        <Box sx={{ minHeight: '100vh', p: { xs: 2, md: 4 }, marginBottom:'40px' }}>
            <ViajeEditar />
        </Box>
    );
}
