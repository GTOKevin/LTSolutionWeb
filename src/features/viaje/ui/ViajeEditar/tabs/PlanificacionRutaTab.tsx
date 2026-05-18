import { Box } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { ViajePlanRutaLayout } from '../../ViajePlanRuta';

interface PlanificacionRutaTabProps {
    viaje: Viaje;
}

export function PlanificacionRutaTab({ viaje }: PlanificacionRutaTabProps) {
    return (
        <Box sx={{ height: '100%', minHeight: '700px', display: 'flex', flexDirection: 'column' }}>
            <ViajePlanRutaLayout viajeId={viaje.viajeID} />
        </Box>
    );
}
