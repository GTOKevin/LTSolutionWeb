import { Alert, Box, Card, CardContent, Chip, CircularProgress, Divider, Stack, Typography, Grid as Grid2 } from '@mui/material';
import { ResumenGeneralTab, ViajeIncidente } from '@features/viaje/edit';
import { ViajeTimeline } from './ViajeTimeline';
import { useViajeDetailPageController } from '../hooks/useViajeDetailPageController';

export function ViajeDetailPageContent() {
    const {
        viajeId,
        viaje,
        isLoading,
        isError,
        isViewOnly,
        tiposIncidente,
        resumenGeneralData,
        onReadOnlyGeneralTabChange,
    } = useViajeDetailPageController();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError || !viaje) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                Error al cargar los detalles del viaje.
            </Alert>
        );
    }

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={800} color="primary.main">
                    Panel 360° - Viaje #{viaje.viajeID}
                </Typography>
                <Chip label={viaje.estado?.nombre || ''} color="info" size="medium" sx={{ fontWeight: 600 }} />
            </Stack>

            <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} gutterBottom>Línea de Tiempo</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <ViajeTimeline viaje={viaje} />
                        </CardContent>
                    </Card>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 9 }}>
                    <Stack spacing={3}>
                        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} gutterBottom>Datos Generales</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <ResumenGeneralTab
                                    viaje={viaje}
                                    formData={resumenGeneralData}
                                    onChange={onReadOnlyGeneralTabChange}
                                    isViewOnly={isViewOnly}
                                />
                            </CardContent>
                        </Card>

                        <Grid2 container spacing={3}>
                            <Grid2 size={{ xs: 12 }}>
                                <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>Incidentes</Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <ViajeIncidente
                                            viewOnly={isViewOnly}
                                            tiposIncidente={tiposIncidente || []}
                                            viajeId={viajeId}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid2>
                        </Grid2>
                    </Stack>
                </Grid2>
            </Grid2>
        </Box>
    );
}
