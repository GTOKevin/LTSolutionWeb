import { Box } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { LegacyGuiasForm, LegacyGuiasList } from './legacy-tab-components';

interface GuiasTabProps {
    viaje: Viaje;
    isViewOnly?: boolean;
}

export function GuiasTab({ viaje, isViewOnly }: GuiasTabProps) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: isViewOnly ? '1fr' : { xs: '1fr', lg: '5fr 7fr' }, gap: 4 }}>
            {!isViewOnly && <LegacyGuiasForm viajeID={viaje.viajeID} />}
            <LegacyGuiasList viajeID={viaje.viajeID} isViewOnly={isViewOnly} />
        </Box>
    );
}
