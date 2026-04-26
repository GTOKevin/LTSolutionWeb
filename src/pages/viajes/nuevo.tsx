import { Box } from '@mui/material';
import { ViajeWizardCreate } from '@/features/viaje/ui/ViajeWizardCreate/ViajeWizardCreate';

export function ViajeNuevoPage() {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
            <ViajeWizardCreate />
        </Box>
    );
}