import { Box } from '@mui/material';
import { ViajeCreatePageContent } from '@features/viaje';

export function ViajeNuevoPage() {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
            <ViajeCreatePageContent />
        </Box>
    );
}
