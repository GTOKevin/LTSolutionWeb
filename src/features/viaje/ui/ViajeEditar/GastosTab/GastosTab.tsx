import { Box } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { GastosForm } from './GastosForm';
import { GastosList } from './GastosList';

interface GastosTabProps {
    viaje: Viaje;
    isViewOnly?: boolean;
}

export function GastosTab({ viaje, isViewOnly }: GastosTabProps) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: isViewOnly ? '1fr' : { xs: '1fr', lg: '5fr 7fr' }, gap: 4 }}>
            {!isViewOnly && <GastosForm viajeID={viaje.viajeID} />}
            <GastosList viajeID={viaje.viajeID} isViewOnly={isViewOnly} />
        </Box>
    );
}