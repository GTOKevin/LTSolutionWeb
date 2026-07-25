import { Box } from '@mui/material';
import { ViajeEditPageContent } from '@features/viaje';

export function ViajeEditarPage() {
    return (
        <Box sx={{ minHeight: '100vh', p: { xs: 2, md: 4 }, marginBottom: '40px' }}>
            <ViajeEditPageContent />
        </Box>
    );
}
