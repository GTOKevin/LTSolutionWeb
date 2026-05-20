import { Box } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { GastosForm } from './GastosForm';
import { GastosList } from './GastosList';

interface GastosTabProps {
    viaje: Viaje;
}

export function GastosTab({ viaje }: GastosTabProps) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' }, gap: 4 }}>
            <GastosForm viajeID={viaje.viajeID} />
            <GastosList viajeID={viaje.viajeID} />
        </Box>
    );
}