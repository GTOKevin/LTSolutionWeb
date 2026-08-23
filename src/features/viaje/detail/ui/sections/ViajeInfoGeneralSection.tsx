import { Stack } from '@mui/material';
import type { ViajeDetail } from '@/entities/viaje/model/types';
import { ViajeInfoServiceSection } from './ViajeInfoServiceSection';
import { ViajeRutaSection } from './ViajeRutaSection';
import { ViajeSeguimientoSection } from './ViajeSeguimientoSection';
import { ViajeCargaSection } from './ViajeCargaSection';

interface ViajeInfoGeneralSectionProps {
    viaje: ViajeDetail;
}

export function ViajeInfoGeneralSection({ viaje }: ViajeInfoGeneralSectionProps) {
    return (
        <Stack spacing={3}>
            <ViajeInfoServiceSection viaje={viaje} />
            <ViajeRutaSection viaje={viaje} />
            <ViajeSeguimientoSection viaje={viaje} />
            <ViajeCargaSection viaje={viaje} />
        </Stack>
    );
}
