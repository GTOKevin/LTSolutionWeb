import { Box } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { GuiasForm } from './GuiasForm';
import { GuiasList } from './GuiasList';

interface GuiasTabProps {
    viaje: Viaje;
}

export function GuiasTab({ viaje }: GuiasTabProps) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' }, gap: 4 }}>
            <GuiasForm viajeID={viaje.viajeID} />
            <GuiasList viajeID={viaje.viajeID} />
        </Box>
    );
}