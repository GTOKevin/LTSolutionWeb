import { Box, Grid, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { CalendarToday as CalendarTodayIcon } from '@mui/icons-material';
import type { ViajeDetail } from '@/entities/viaje/model/types';
import { formatDateShort } from '@/shared/utils/date-utils';
import { formatDecimalAmount } from '@/shared/utils/format-utils';
import { getTotalGalonesConsumidos } from '../../model/gasto-derivations';
import { useViajeGastos } from '@features/viaje/hooks/useViajeGastos';

interface ViajeSeguimientoSectionProps {
    viaje: ViajeDetail;
}

export function ViajeSeguimientoSection({ viaje }: ViajeSeguimientoSectionProps) {
    const theme = useTheme();
    const { data: gastosData } = useViajeGastos(viaje.viajeID, 1, 100);

    const gastos = gastosData?.items ?? [];
    const totalGalonesConsumidos = getTotalGalonesConsumidos(gastos);

    const kmRecorridoDestino = viaje.kmInicio != null && viaje.kmLlegada != null ? viaje.kmLlegada - viaje.kmInicio : null;
    const kmRecorridoBase = viaje.kmInicio != null && viaje.kmLlegadaBase != null ? viaje.kmLlegadaBase - viaje.kmInicio : null;

    const formatKm = (value: number | null | undefined) => (value == null || value < 0 ? '—' : `${value.toLocaleString()} km`);

    const fechas = [
        { label: 'Fecha Carga', val: formatDateShort(viaje.fechaCarga) },
        { label: 'Fecha Partida', val: formatDateShort(viaje.fechaPartida || '') },
        { label: 'Fecha Llegada', val: formatDateShort(viaje.fechaLlegada || '') },
        { label: 'Fecha Descarga', val: formatDateShort(viaje.fechaDescarga || '') },
        { label: 'Llegada a Base', val: formatDateShort(viaje.fechaLlegadaBase || '') },
    ];

    const kms = [
        { label: 'Km Inicio (Origen)', value: formatKm(viaje.kmInicio), color: 'primary', emphasized: true },
        { label: 'Km Llegada (Destino)', value: formatKm(viaje.kmLlegada), color: 'primary', emphasized: true },
        { label: 'Km Llegada a Base', value: formatKm(viaje.kmLlegadaBase), color: 'primary', emphasized: true },
        { label: 'Km Recorrido (Origen → Destino)', value: formatKm(kmRecorridoDestino), color: 'success', emphasized: false },
        { label: 'Km Recorrido (Total)', value: formatKm(kmRecorridoBase), color: 'success', emphasized: false },
        { label: 'Galones Consumidos', value: gastosData ? `${formatDecimalAmount(totalGalonesConsumidos)} gal` : '—', color: 'primary', emphasized: false },
    ];

    return (
        <Box>
            <Typography
                variant="caption"
                fontWeight={800}
                color="text.secondary"
                sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}
            >
                Seguimiento y Control
            </Typography>
            <Grid container spacing={2}>
                {fechas.map((item) => (
                    <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={item.label}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.background.default, 0.6),
                            }}
                        >
                            <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
                                <CalendarTodayIcon fontSize="inherit" color="action" />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    {item.label}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight={700}>
                                {item.val || '—'}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2} sx={{ mt: 1 }}>
                {kms.map((item) => {
                    const isSuccess = item.color === 'success';
                    return (
                        <Grid size={{ xs: 12, sm: 4 }} key={item.label}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: isSuccess
                                        ? alpha(theme.palette.success.main, 0.04)
                                        : item.emphasized
                                            ? undefined
                                            : alpha(theme.palette.primary.main, 0.05),
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color={isSuccess ? 'success.main' : item.emphasized ? 'text.secondary' : 'primary.main'}
                                    fontWeight={isSuccess || !item.emphasized ? 700 : 600}
                                >
                                    {item.label}
                                </Typography>
                                <Typography variant="h6" fontWeight={800} color={isSuccess ? 'success.main' : 'primary.main'} mt={0.5}>
                                    {item.value}
                                </Typography>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
