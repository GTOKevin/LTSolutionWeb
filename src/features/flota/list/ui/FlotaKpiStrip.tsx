import { Box, Card, Grid, LinearProgress, Typography, alpha, useTheme } from '@mui/material';
import {
    LocalShipping as TruckIcon,
    CheckCircleOutline as AvailableIcon,
    AltRoute as RouteIcon,
    NotificationImportant as WarningIcon,
} from '@mui/icons-material';
import type { FlotaResumen } from '@entities/flota/model/types';

interface FlotaKpiStripProps {
    resumen?: FlotaResumen;
    isLoading: boolean;
}

export function FlotaKpiStrip({ resumen, isLoading }: FlotaKpiStripProps) {
    const theme = useTheme();
    const value = (input: number | undefined) => (isLoading || input == null ? '—' : input);

    const disponibilidad = resumen?.disponibilidadTractos;
    const disponibilidadPct = disponibilidad?.porcentajeActiva ?? 0;
    const disponibilidadCaption = disponibilidad
        ? `${disponibilidad.tractosLibres} de ${disponibilidad.totalTractos} tractos libres`
        : 'Sin información';

    const topVencimiento = resumen?.vencimientosPorTipo?.[0];
    const vencimientosCaption = topVencimiento
        ? `${topVencimiento.tipoDocumentoNombre}: ${topVencimiento.cantidad}`
        : 'Sin vencimientos en los próximos 15 días';

    const kpis = [
        {
            title: 'TOTAL PARQUE AUTOMOTOR',
            value: value(resumen?.totalParque),
            color: '#2563EB',
            icon: <TruckIcon sx={{ fontSize: 20 }} />,
            breakdown: (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        Tractos: <strong>{resumen?.totalTractos ?? 0}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>•</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        Carretas: <strong>{resumen?.totalCarretas ?? 0}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>•</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        Escoltas: <strong>{resumen?.totalEscoltas ?? 0}</strong>
                    </Typography>
                </Box>
            ),
        },
        {
            title: 'DISPONIBILIDAD DE TRACTOS',
            value: disponibilidad ? `${disponibilidadPct}%` : '—',
            color: '#16A34A',
            icon: <AvailableIcon sx={{ fontSize: 20 }} />,
            breakdown: (
                <Box sx={{ width: '100%', mt: 0.75 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            {disponibilidadCaption}
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(100, Math.max(0, disponibilidadPct))}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: '#16A34A',
                                borderRadius: 3,
                            },
                        }}
                    />
                </Box>
            ),
        },
        {
            title: 'UNIDADES EN RUTA',
            value: value(resumen?.unidadesEnRuta),
            color: '#0891B2',
            icon: <RouteIcon sx={{ fontSize: 20 }} />,
            breakdown: (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Unidades con viaje activo y despacho en curso
                </Typography>
            ),
        },
        {
            title: 'VENCIMIENTOS PRÓXIMOS',
            value: value(resumen?.vencimientosProximos),
            color: (resumen?.vencimientosProximos ?? 0) > 0 ? '#DC2626' : '#D97706',
            icon: <WarningIcon sx={{ fontSize: 20 }} />,
            breakdown: (
                <Typography
                    variant="caption"
                    sx={{
                        mt: 0.5,
                        display: 'block',
                        color: (resumen?.vencimientosProximos ?? 0) > 0 ? 'error.main' : 'text.secondary',
                        fontWeight: (resumen?.vencimientosProximos ?? 0) > 0 ? 600 : 400,
                    }}
                >
                    {vencimientosCaption}
                </Typography>
            ),
        },
    ];

    return (
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
            {kpis.map((kpi, idx) => (
                <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={idx}>
                    <Card
                        elevation={0}
                        sx={{
                            height: '100%',
                            borderRadius: 3,
                            border: `1px solid ${theme.palette.divider}`,
                            bgcolor: theme.palette.background.paper,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            p: 2.5,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[2],
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: '0.08em',
                                    color: 'text.secondary',
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                }}
                            >
                                {kpi.title}
                            </Typography>
                            <Box
                                sx={{
                                    p: 0.75,
                                    borderRadius: 2,
                                    bgcolor: alpha(kpi.color, 0.12),
                                    color: kpi.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {kpi.icon}
                            </Box>
                        </Box>

                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                color: 'text.primary',
                                letterSpacing: '-0.02em',
                                mb: 0.5,
                            }}
                        >
                            {kpi.value}
                        </Typography>

                        {kpi.breakdown}
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
