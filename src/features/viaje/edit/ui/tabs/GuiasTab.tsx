import { Box } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { GuiasForm } from './GuiasForm';
import { GuiasList } from './GuiasList';

interface GuiasTabProps {
    viaje: Viaje;
    isViewOnly?: boolean;
}

export function GuiasTab({ viaje, isViewOnly }: GuiasTabProps) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: isViewOnly ? '1fr' : { xs: '1fr', lg: '5fr 7fr' }, gap: 4 }}>
            {!isViewOnly && <GuiasForm viajeID={viaje.viajeID} />}
            <GuiasList viajeID={viaje.viajeID} isViewOnly={isViewOnly} />
        </Box>
    );
}
