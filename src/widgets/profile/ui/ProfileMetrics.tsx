import { Card, CardContent, Stack, Typography, Box, alpha, useTheme } from '@mui/material';
import { LocalShippingOutlined, TrendingUpRounded } from '@mui/icons-material';
import { cardSx, formatDate, metricLabelDarkSx, metricLabelSx } from './ProfileShared';

interface ProfileMetricsProps {
    viajesCount: number;
    ultimaFechaViaje?: string | null;
    actividadPercent: number;
    documentosCriticos: number;
}

export function ProfileMetrics({ viajesCount, ultimaFechaViaje, actividadPercent, documentosCriticos }: ProfileMetricsProps) {
    const theme = useTheme();

    return (
        <Stack spacing={3}>
            <Card
                sx={{
                    ...cardSx(theme.palette.mode),
                    color: theme.palette.common.white,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography sx={metricLabelSx}>ULTIMOS VIAJES</Typography>
                            <Typography sx={{ fontSize: 50, lineHeight: 1, fontWeight: 900, letterSpacing: '-0.04em', mt: 0.5 }}>
                                {viajesCount}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                                {ultimaFechaViaje ? `Ult. ${formatDate(ultimaFechaViaje)}` : 'Sin viajes recientes'}
                            </Typography>
                        </Box>
                        <LocalShippingOutlined sx={{ fontSize: 64, opacity: 0.22 }} />
                    </Stack>
                </CardContent>
            </Card>

            <Card sx={cardSx(theme.palette.mode)}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography sx={metricLabelDarkSx}>ACTIVIDAD</Typography>
                            <Typography sx={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', mt: 0.5 }}>
                                {actividadPercent.toFixed(1)}%
                            </Typography>
                            <Box
                                sx={{
                                    mt: 1.5,
                                    height: 6,
                                    width: '100%',
                                    maxWidth: 180,
                                    borderRadius: 999,
                                    bgcolor: alpha(theme.palette.success.main, 0.16),
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    sx={{
                                        height: '100%',
                                        width: `${Math.min(actividadPercent, 100)}%`,
                                        borderRadius: 999,
                                        bgcolor: 'success.main',
                                    }}
                                />
                            </Box>
                        </Box>
                        <Stack alignItems="flex-end" spacing={0.5}>
                            <TrendingUpRounded sx={{ color: 'success.main', fontSize: 34 }} />
                            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                                {documentosCriticos > 0 ? `${documentosCriticos} crítico(s)` : 'Operativo'}
                            </Typography>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
}

