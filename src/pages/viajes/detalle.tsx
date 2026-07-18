import { Box } from '@mui/material';
import { ViajeDetailPageContent } from '@features/viaje/detail';

export function ViajeDetallePage() {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
            <ViajeDetailPageContent />
        </Box>
    );
}
