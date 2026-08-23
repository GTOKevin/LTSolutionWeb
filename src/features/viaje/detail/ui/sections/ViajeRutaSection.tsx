import { Box, Grid, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { ArrowForward as ArrowForwardIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';
import type { ViajeDetail } from '@/entities/viaje/model/types';

interface ViajeRutaSectionProps {
    viaje: ViajeDetail;
}

export function ViajeRutaSection({ viaje }: ViajeRutaSectionProps) {
    const theme = useTheme();

    return (
        <Box>
            <Typography
                variant="caption"
                fontWeight={800}
                color="text.secondary"
                sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}
            >
                Ruta de Transporte
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper
                        sx={{
                            p: 2.5,
                            borderRadius: 2,
                            border: '1px dashed',
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                            <LocationOnIcon fontSize="small" color="primary" />
                            <Typography variant="caption" fontWeight={800} color="primary.main" sx={{ letterSpacing: '0.05em' }}>
                                PUNTO DE ORIGEN
                            </Typography>
                        </Stack>
                        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                            {viaje.origenDescripcion || 'Origen no especificado'}
                        </Typography>
                        {viaje.direccionOrigen && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {viaje.direccionOrigen}
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper
                        sx={{
                            p: 2.5,
                            borderRadius: 2,
                            border: '1px dashed',
                            borderColor: alpha(theme.palette.secondary.main, 0.4),
                            bgcolor: alpha(theme.palette.secondary.main, 0.02),
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                            <ArrowForwardIcon fontSize="small" color="secondary" />
                            <Typography variant="caption" fontWeight={800} color="secondary.main" sx={{ letterSpacing: '0.05em' }}>
                                PUNTO DE DESTINO
                            </Typography>
                        </Stack>
                        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                            {viaje.destinoDescripcion || 'Destino no especificado'}
                        </Typography>
                        {viaje.direccionDestino && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {viaje.direccionDestino}
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
