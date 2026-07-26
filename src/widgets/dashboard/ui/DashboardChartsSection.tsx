import { alpha, Box, Card, CardContent, Divider, FormControl, MenuItem, Select, Stack, Typography, useTheme } from '@mui/material';
import type { DashboardOverview, DashboardPeriod } from '@entities/dashboard/model/types';
import { DASHBOARD_PERIOD_OPTIONS } from '../lib/dashboard-view-helpers';
import { dashboardCardSx } from '../lib/dashboard-styles';
import { FacturacionLegendItem } from './DashboardShared';

interface DashboardChartsSectionProps {
    data: DashboardOverview;
    period: DashboardPeriod;
    onPeriodChange: (period: DashboardPeriod) => void;
    description: string;
    canViewViajes: boolean;
    canViewFacturas: boolean;
}

export function DashboardChartsSection({
    data,
    period,
    onPeriodChange,
    description,
    canViewViajes,
    canViewFacturas,
}: DashboardChartsSectionProps) {
    const theme = useTheme();
    const maxVolume = Math.max(...data.volumenViajes.series.map(item => item.value), 1);
    const paid = data.estadoFacturacion.pagadoPct ?? 0;
    const pending = data.estadoFacturacion.pendientePct ?? 0;
    const overdue = data.estadoFacturacion.vencidoPct ?? 0;

    const donutGradient = `conic-gradient(
        ${theme.palette.success.main} 0% ${paid}%,
        #f59e0b ${paid}% ${paid + pending}%,
        ${theme.palette.error.main} ${paid + pending}% ${paid + pending + overdue}%,
        ${alpha(theme.palette.text.primary, 0.08)} ${paid + pending + overdue}% 100%
    )`;

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    xl: canViewViajes && canViewFacturas ? 'minmax(0, 2fr) minmax(340px, 1fr)' : '1fr',
                },
                gap: 2,
            }}
        >
            {canViewViajes && (
                <Card sx={dashboardCardSx(theme)}>
                    <CardContent sx={{ p: 3 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', md: 'center' },
                                gap: 2,
                                mb: 3,
                            }}
                        >
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    Volumen de Viajes
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {description}
                                </Typography>
                            </Box>

                            <FormControl size="small" sx={{ minWidth: 190 }}>
                                <Select
                                    value={period}
                                    onChange={(event) => onPeriodChange(event.target.value as DashboardPeriod)}
                                    sx={{
                                        borderRadius: 2.5,
                                        bgcolor: alpha(theme.palette.text.primary, 0.03),
                                    }}
                                >
                                    {DASHBOARD_PERIOD_OPTIONS.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Box sx={{ position: 'relative', height: 280 }}>
                            <Stack
                                spacing={0}
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    justifyContent: 'space-between',
                                    pointerEvents: 'none',
                                }}
                            >
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <Divider key={index} sx={{ borderColor: alpha(theme.palette.text.primary, 0.08) }} />
                                ))}
                            </Stack>

                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${Math.max(data.volumenViajes.series.length, 1)}, minmax(0, 1fr))`,
                                    gap: 1.5,
                                    alignItems: 'end',
                                    pt: 2,
                                }}
                            >
                                {data.volumenViajes.series.map(point => (
                                    <Stack key={point.label} spacing={1} alignItems="stretch" justifyContent="flex-end" sx={{ height: '100%' }}>
                                        <Box
                                            title={`${point.label}: ${point.value} viaje(s)`}
                                            sx={{
                                                minHeight: 8,
                                                height: `${Math.max((point.value / maxVolume) * 100, 4)}%`,
                                                borderRadius: '16px 16px 6px 6px',
                                                background: point.value === maxVolume
                                                    ? `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.95)} 0%, ${theme.palette.primary.main} 100%)`
                                                    : alpha(theme.palette.primary.main, 0.2),
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.55),
                                                },
                                            }}
                                        />
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                textAlign: 'center',
                                                fontWeight: 700,
                                                letterSpacing: '0.06em',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {point.label}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {canViewFacturas && (
                <Card sx={dashboardCardSx(theme)}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Estado de Facturación
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Resumen de cobranzas del periodo.
                        </Typography>

                        <Stack spacing={3} alignItems="center">
                            <Box
                                sx={{
                                    width: 220,
                                    height: 220,
                                    borderRadius: '50%',
                                    background: donutGradient,
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 148,
                                        height: 148,
                                        borderRadius: '50%',
                                        bgcolor: theme.palette.background.paper,
                                        display: 'grid',
                                        placeItems: 'center',
                                        boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.text.primary, 0.06)}`,
                                    }}
                                >
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: '1.75rem', fontWeight: 700 }}>
                                            {data.estadoFacturacion.totalFacturas}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                            Facturas
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Stack spacing={1.25} sx={{ width: '100%' }}>
                                <FacturacionLegendItem
                                    color={theme.palette.success.main}
                                    label="Pagado"
                                    percentage={data.estadoFacturacion.pagadoPct}
                                    count={data.estadoFacturacion.pagadas}
                                />
                                <FacturacionLegendItem
                                    color="#f59e0b"
                                    label="Pendiente"
                                    percentage={data.estadoFacturacion.pendientePct}
                                    count={data.estadoFacturacion.pendientes}
                                />
                                <FacturacionLegendItem
                                    color={theme.palette.error.main}
                                    label="Vencido"
                                    percentage={data.estadoFacturacion.vencidoPct}
                                    count={data.estadoFacturacion.vencidas}
                                />
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}
