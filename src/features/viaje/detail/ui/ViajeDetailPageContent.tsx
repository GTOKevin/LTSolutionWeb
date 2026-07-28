import { Alert, Box, Card, CardContent, Chip, CircularProgress, Divider, Stack, Typography, Grid as Grid2 } from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import type { CreateViajeDto } from '@/entities/viaje/model/types';
import { useViajeOptions, useViajeIncidenteOptions } from '@features/viaje/options';
import { mapViajeToFormValues, getCreateViajeDefaultValues } from '@features/viaje/model/form-values';
import { VIAJE_QUERY_KEYS } from '@features/viaje/model/query-keys';
import { viajeSchema } from '@features/viaje/model/schema';
import { ViajeIncidente } from '@features/viaje/edit';
import { ViajeCreateEdit } from './ViajeCreateEdit';
import { ViajeTimeline } from './ViajeTimeline';
import { useEffect } from 'react';

export function ViajeDetailPageContent() {
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
    const { tiposIncidente } = useViajeIncidenteOptions(true);
    const methods = useForm<CreateViajeDto>({
        resolver: zodResolver(viajeSchema) as Resolver<CreateViajeDto>,
        defaultValues: getCreateViajeDefaultValues()
    });
    const { reset } = methods;

    useEffect(() => {
        if (viaje) {
            reset(mapViajeToFormValues(viaje));
        }
    }, [viaje, reset]);

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
