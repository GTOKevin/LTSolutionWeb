import { Box } from '@mui/material';
import { FacturaCreateEdit } from '@features/factura';

export function FacturaNuevaPage() {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, md: 4 }, pb: 10 }}>
            <FacturaCreateEdit />
        </Box>
    );
}
