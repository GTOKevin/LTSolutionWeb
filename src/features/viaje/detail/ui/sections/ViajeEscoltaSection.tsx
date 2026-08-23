import {
    DirectionsCar as DirectionsCarIcon,
    Person as PersonIcon,
    SecurityOutlined as SecurityOutlinedIcon,
    Shield as ShieldIcon,
} from '@mui/icons-material';
import { Box, Chip, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import type { ViajeDetail, ViajeEscoltaDetail } from '@/entities/viaje/model/types';

interface ViajeEscoltaSectionProps {
    viaje: ViajeDetail;
}

const getEscoltaConductor = (item: ViajeEscoltaDetail) =>
    item.colaboradorNombreCompleto || item.nombreConductor || 'Sin conductor';

export function ViajeEscoltaSection({ viaje }: ViajeEscoltaSectionProps) {
    const theme = useTheme();
    const escoltas = viaje.escoltas ?? [];
    const requiereEscolta = viaje.requiereEscolta ?? false;

    return (
        <Stack spacing={2}>
            {/* Estado del servicio de escolta */}
            <Paper
                variant="outlined"
                sx={{
                    p: 2.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.4),
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <ShieldIcon color={requiereEscolta ? 'warning' : 'action'} sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                            Servicio de Escolta y Custodia
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {requiereEscolta
                                ? 'Este viaje requiere de vehículo o personal de escolta para cumplimiento de ruta segura.'
                                : 'El viaje no requiere servicio de escolta registrado.'}
                        </Typography>
                    </Box>
                </Stack>
                <Chip
                    label={requiereEscolta ? 'REQUIERE ESCOLTA' : 'NO REQUIERE ESCOLTA'}
                    color={requiereEscolta ? 'warning' : 'default'}
                    variant={requiereEscolta ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 700, letterSpacing: '0.05em' }}
                />
            </Paper>

            {/* Lista de escoltas */}
            <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <SecurityOutlinedIcon fontSize="small" color="primary" />
                    <Typography
                        variant="caption"
                        fontWeight={800}
                        color="text.secondary"
                        sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
                    >
                        Datos de Escolta
                    </Typography>
                    <Chip
                        label={`${escoltas.length} ${escoltas.length === 1 ? 'registro' : 'registros'}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                </Stack>

                {escoltas.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <SecurityOutlinedIcon color="disabled" sx={{ fontSize: 36, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            No se registraron escoltas para este viaje.
                        </Typography>
                    </Paper>
                ) : (
                    <Stack spacing={2}>
                        {escoltas.map((item) => {
                            const esTercero = item.tercero === true;
                            const placa = item.placa || '—';
                            const conductor = getEscoltaConductor(item);

                            return (
                                <Paper
                                    key={item.viajeEscoltaID}
                                    variant="outlined"
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.background.default, 0.4),
                                    }}
                                >
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                color: 'primary.main',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <DirectionsCarIcon />
                                        </Box>

                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
                                                <Chip
                                                    label={esTercero ? 'Tercero' : 'Propio'}
                                                    size="small"
                                                    color={esTercero ? 'secondary' : 'primary'}
                                                    variant="outlined"
                                                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                                />
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="body1" fontWeight={800} color="primary.main">
                                                    {placa}
                                                </Typography>
                                            </Stack>
                                        </Box>

                                        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
                                            <Box>
                                                <Stack direction="row" spacing={0.5} alignItems="center" mb={0.25}>
                                                    <PersonIcon fontSize="inherit" color="action" />
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                        Conductor
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {conductor}
                                                </Typography>
                                            </Box>
                                            {item.empresa && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                        Empresa
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={700}>
                                                        {item.empresa}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </Stack>
    );
}