import { Box, Typography, Grid2, CircularProgress, Alert, Card, CardContent, Divider, Chip, Stack } from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { VIAJE_QUERY_KEYS } from '../../model/query-keys';
import { useViajeOptions } from '../../hooks/useViajeOptions';
import { FormProvider, useForm } from 'react-hook-form';

// Import sub-modules
import { ViajeCreateEdit } from '../Viaje/ViajeCreateEdit';
import { ViajeMercaderia } from '../ViajeMercaderia/Index';
import { ViajeGasto } from '../ViajeGasto/Index';
import { ViajeGuia } from '../ViajeGuia/Index';
import { ViajeIncidente } from '../ViajeIncidente/Index';
import { ViajePermiso } from '../ViajePermiso/Index';
import { ViajeEscolta } from '../ViajeEscolta/Index';
import { ViajeTimeline } from './ViajeTimeline';

export function ViajeDetalle() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'view';
    const isViewOnly = mode === 'view';
    const viajeId = parseInt(id || '0', 10);

    const { data: viaje, isLoading, isError } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.detail(viajeId),
        queryFn: () => viajeApi.getById(viajeId),
        enabled: !!viajeId && viajeId > 0
    });

    const options = useViajeOptions(true);
    const { 
        flotasEscolta, colaboradores, 
        tiposMedida, tiposPeso, tiposGasto, monedas,
        tiposGuia, tiposIncidente, mercaderias
    } = options;

    const methods = useForm({
        defaultValues: viaje || {}
    });

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

    // Checks for specific modules
    const requiereEscolta = viaje?.viajeMercaderia?.some(m => {
        const merc = mercaderias?.find(x => x.id === m.mercaderiaID);
        return merc && (merc.ancho > 3 || merc.largo > 20 || merc.peso > 48);
    });

    const requierePermiso = viaje?.viajeMercaderia?.some(m => {
        const merc = mercaderias?.find(x => x.id === m.mercaderiaID);
        return merc && (merc.ancho > 2.6 || merc.alto > 4.1 || merc.largo > 20 || merc.peso > 48);
    });

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={800} color="primary.main">
                    Panel 360° - Viaje #{viaje.viajeID}
                </Typography>
                <Chip label={viaje.estado?.nombre || ''} color="info" size="medium" sx={{ fontWeight: 600 }} />
            </Stack>

            <Grid2 container spacing={3}>
                {/* Timeline / Status Tracker (Left column) */}
                <Grid2 size={{ xs: 12, md: 3 }}>
                    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} gutterBottom>Línea de Tiempo</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <ViajeTimeline viaje={viaje} />
                        </CardContent>
                    </Card>
                </Grid2>

                {/* Widgets (Right column) */}
                <Grid2 size={{ xs: 12, md: 9 }}>
                    <Stack spacing={3}>
                        <FormProvider {...methods}>
                            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={700} gutterBottom>Datos Generales</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <ViajeCreateEdit 
                                        viaje={viaje} 
                                        isViewOnly={isViewOnly} 
                                        options={options}
                                        isPending={false}
                                    />
                                </CardContent>
                            </Card>
                        </FormProvider>

                        <Grid2 container spacing={3}>
                            <Grid2 size={{ xs: 12, lg: 6 }}>
                                <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>Mercadería</Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <ViajeMercaderia 
                                            viewOnly={isViewOnly} 
                                            tiposMedida={tiposMedida || []} 
                                            tiposPeso={tiposPeso || []} 
                                            mercaderias={mercaderias || []}
                                            viajeId={viajeId}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid2>

                            <Grid2 size={{ xs: 12, lg: 6 }}>
                                <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>Guías</Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <ViajeGuia
                                            viewOnly={isViewOnly}
                                            tiposGuia={tiposGuia || []}
                                            viajeId={viajeId}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid2>

                            <Grid2 size={{ xs: 12, lg: 6 }}>
                                <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>Gastos</Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <ViajeGasto 
                                            viewOnly={isViewOnly} 
                                            tiposGasto={tiposGasto || []} 
                                            monedas={monedas || []}
                                            viajeId={viajeId}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid2>

                            <Grid2 size={{ xs: 12, lg: 6 }}>
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

                            {requierePermiso && (
                                <Grid2 size={{ xs: 12, lg: 6 }}>
                                    <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" fontWeight={700} gutterBottom>Permisos</Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <ViajePermiso viajeId={viajeId} viewOnly={isViewOnly} />
                                        </CardContent>
                                    </Card>
                                </Grid2>
                            )}

                            {requiereEscolta && (
                                <Grid2 size={{ xs: 12, lg: 6 }}>
                                    <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="h6" fontWeight={700} gutterBottom>Escolta</Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <ViajeEscolta 
                                                viewOnly={isViewOnly} 
                                                viajeId={viajeId}
                                                flotas={flotasEscolta || []}
                                                colaboradores={colaboradores || []}
                                            />
                                        </CardContent>
                                    </Card>
                                </Grid2>
                            )}
                        </Grid2>
                    </Stack>
                </Grid2>
            </Grid2>
        </Box>
    );
}