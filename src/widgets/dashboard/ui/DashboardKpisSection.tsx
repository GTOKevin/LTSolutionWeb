import { Box, Stack, Typography, useTheme } from '@mui/material';
import {
    Directions as DirectionsIcon,
    LocalShipping as LocalShippingIcon,
    Payments as PaymentsIcon,
    WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import type { DashboardOverview } from '@entities/dashboard/model/types';
import { formatCurrency } from '@shared/utils/format-utils';
import { DashboardMetricCard } from './DashboardMetricCard';
import { TrendBadge } from './DashboardShared';

interface DashboardKpisSectionProps {
    data: DashboardOverview;
}

export function DashboardKpisSection({ data }: DashboardKpisSectionProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    xl: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 2,
            }}
        >
            <DashboardMetricCard
                title="Viajes en Curso"
                icon={<DirectionsIcon />}
                accentColor={theme.palette.primary.main}
            >
                <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, lineHeight: 1 }}>
                    {data.viajesEnCurso.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    En tránsito o descargando.
                </Typography>
            </DashboardMetricCard>

            <DashboardMetricCard
                title="Facturación Mensual"
                icon={<PaymentsIcon />}
                accentColor={theme.palette.success.main}
            >
                {data.facturacionMensual.length > 0 ? (
                    <Stack spacing={1.25}>
                        {data.facturacionMensual.map(item => (
                            <Box key={item.monedaID}>
                                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2 }}>
                                    {formatCurrency(item.totalFacturado, item.simbolo)}
                                </Typography>
                                <TrendBadge value={item.variacionVsMesAnteriorPct} />
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        Sin facturación del periodo
                    </Typography>
                )}
            </DashboardMetricCard>

            <DashboardMetricCard
                title="Alertas Críticas"
                icon={<WarningAmberIcon />}
                accentColor={theme.palette.error.main}
            >
                <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, lineHeight: 1, color: theme.palette.error.main }}>
                    {data.alertasCriticas.total.toString().padStart(2, '0')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {data.alertasCriticas.facturasVencidas} facturas vencidas y {data.alertasCriticas.documentosVencidos} documentos/licencias vencidos.
                </Typography>
            </DashboardMetricCard>

            <DashboardMetricCard
                title="Disponibilidad de Flota"
                icon={<LocalShippingIcon />}
                accentColor={theme.palette.secondary.main}
            >
                <Stack spacing={1.25}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, lineHeight: 1 }}>
                            {Number(data.disponibilidadFlota.porcentajeDisponible).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={700}>
                            {data.disponibilidadFlota.disponibles}/{data.disponibilidadFlota.total}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            height: 8,
                            borderRadius: 999,
                            overflow: 'hidden',
                            bgcolor: `${theme.palette.secondary.main}1f`,
                        }}
                    >
                        <Box
                            sx={{
                                width: `${Math.min(100, Math.max(0, data.disponibilidadFlota.porcentajeDisponible))}%`,
                                height: '100%',
                                borderRadius: 999,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                            }}
                        />
                    </Box>
                </Stack>
            </DashboardMetricCard>
        </Box>
    );
}
