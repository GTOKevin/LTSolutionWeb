import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { FacturaCreateEdit } from '@features/factura';

export function FacturaVerPage() {
    const { id } = useParams<{ id: string }>();

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, md: 4 }, pb: 10 }}>
            <FacturaCreateEdit id={Number(id)} viewOnly />
        </Box>
    );
}
