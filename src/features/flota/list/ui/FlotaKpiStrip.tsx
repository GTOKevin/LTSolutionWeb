import { Grid } from '@mui/material';
import {
    LocalShipping as TruckIcon,
    CheckCircleOutline as AvailableIcon,
    AltRoute as RouteIcon,
    WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { StatsCard } from '@shared/components/ui/StatsCard';
import type { FlotaResumen } from '@entities/flota/model/types';

interface FlotaKpiStripProps {
    resumen?: FlotaResumen;
    isLoading: boolean;
}

export function FlotaKpiStrip({ resumen, isLoading }: FlotaKpiStripProps) {
    const value = (input: number | undefined) => (isLoading || input == null ? '—' : input);

    const disponibilidad = resumen?.disponibilidadTractos;
    const disponibilidadCaption = disponibilidad
        ? `${disponibilidad.tractosLibres} / ${disponibilidad.totalTractos} tractos libres`
        : 'Sin información';

    const topVencimiento = resumen?.vencimientosPorTipo?.[0];
    const vencimientosCaption = topVencimiento
        ? `${topVencimiento.tipoDocumentoNombre}: ${topVencimiento.cantidad}`
        : 'Sin vencimientos próximos';

    return (
        <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatsCard
                    title="Total Parque Automotor"
                    value={value(resumen?.totalParque)}
                    color="#2563eb"
                    icon={<TruckIcon />}
                    caption={`Tractos: ${resumen?.totalTractos ?? 0} · Carretas: ${resumen?.totalCarretas ?? 0} · Escoltas: ${resumen?.totalEscoltas ?? 0}`}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatsCard
                    title="Disponibilidad de Tractos"
                    value={disponibilidad ? `${disponibilidad.porcentajeActiva}%` : '—'}
                    color="#16a34a"
                    icon={<AvailableIcon />}
                    caption={disponibilidadCaption}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatsCard
                    title="Unidades en Ruta"
                    value={value(resumen?.unidadesEnRuta)}
                    color="#0891b2"
                    icon={<RouteIcon />}
                    caption="Unidades con viaje activo"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatsCard
                    title="Vencimientos Próximos"
                    value={value(resumen?.vencimientosProximos)}
                    color="#d97706"
                    icon={<WarningIcon />}
                    caption={vencimientosCaption}
                />
            </Grid>
        </Grid>
    );
}
