import { Box } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { LegacyViajePlanRutaLayout } from '@features/viaje/legacy';

interface PlanificacionRutaTabProps {
    viaje: Viaje;
    isViewOnly?: boolean;
}

export function PlanificacionRutaTab({ viaje, isViewOnly }: PlanificacionRutaTabProps) {
    return (
        <Box sx={{ height: '100%', minHeight: '700px', display: 'flex', flexDirection: 'column' }}>
            <LegacyViajePlanRutaLayout viajeId={viaje.viajeID} isViewOnly={isViewOnly} />
        </Box>
    );
}
