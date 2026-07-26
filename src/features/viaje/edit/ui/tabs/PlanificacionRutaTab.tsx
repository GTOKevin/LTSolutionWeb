import { Box } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { ViajePlanRutaLayout } from '@features/viaje/ui/ViajeEditar/RutaTab/ViajePlanRutaLayout';

interface PlanificacionRutaTabProps {
    viaje: Viaje;
    isViewOnly?: boolean;
}

export function PlanificacionRutaTab({ viaje, isViewOnly }: PlanificacionRutaTabProps) {
    return (
        <Box sx={{ height: '100%', minHeight: '700px', display: 'flex', flexDirection: 'column' }}>
            <ViajePlanRutaLayout viajeId={viaje.viajeID} isViewOnly={isViewOnly} />
        </Box>
    );
}
