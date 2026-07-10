import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Tabs,
    Tab,
    Divider,
    TextField,
    InputAdornment,
    Stack,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@shared/components/ui/Toast/useToast';
import { employeePortalApi, EMPLOYEE_PORTAL_QUERY_KEYS } from '@/entities/employee/api/employee-portal.api';
import type { UpdateMiViajeKmsDto } from '@/entities/employee/model/types';
import {
    getUpdateMisViajesKmsDefaultValues,
    updateMisViajesKmsSchema,
    type UpdateMisViajesKmsForm,
    type UpdateMisViajesKmsFormInput,
} from '@/features/employee/viajes/model/schema';

const styles = {
    heroHeader: {
        backgroundColor: 'rgba(248, 249, 250, 0.8)',
        backdropFilter: 'blur(20px)',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 3,
        p: 3,
        boxShadow: 'none',
        border: '1px solid rgba(192, 199, 212, 0.5)',
    },
};

function formatDateLabel(value?: string | null): string {
    if (!value) {
        return 'Sin informacion';
    }

    const parsedValue = new Date(value);
    if (Number.isNaN(parsedValue.getTime())) {
        return value;
    }

    return parsedValue.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatKmLabel(value?: number | null): string {
    if (value === null || value === undefined) {
        return 'Sin registrar';
    }

    return `${value} km`;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <Box>
            <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', mb: 0.75 }}
            >
                {label}
            </Typography>
            <Typography variant="body1" fontWeight={600} color="text.primary">
                {value}
            </Typography>
        </Box>
    );
}

export function MisViajesDetallePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const viajeId = Number(id);

    const [activeTab, setActiveTab] = useState(0);

    const { data: viaje, isLoading } = useQuery({
        queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.viajeDetail(viajeId),
        queryFn: () => employeePortalApi.getMyViajeById(viajeId),
        enabled: !isNaN(viajeId),
    });

    const updateKmsMutation = useMutation({
        mutationFn: (payload: UpdateMiViajeKmsDto) => employeePortalApi.updateMyViajeKms(viajeId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: EMPLOYEE_PORTAL_QUERY_KEYS.all });
            showToast({ message: 'Kilometraje actualizado correctamente', severity: 'success' });
        },
        onError: (error: unknown) => {
            const msg = error instanceof Error ? error.message : 'Error al actualizar kilometraje';
            showToast({ message: msg, severity: 'error' });
        },
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UpdateMisViajesKmsFormInput, unknown, UpdateMisViajesKmsForm>({
        resolver: zodResolver(updateMisViajesKmsSchema),
        defaultValues: getUpdateMisViajesKmsDefaultValues(),
    });

    useEffect(() => {
        if (!viaje) {
            return;
        }

        reset(getUpdateMisViajesKmsDefaultValues({
            kmInicio: viaje.kmInicio,
            kmLlegada: viaje.kmLlegada,
            kmLlegadaBase: viaje.kmLlegadaBase,
        }));
    }, [reset, viaje]);

    const onSubmitKms = (data: UpdateMisViajesKmsForm) => {
        updateKmsMutation.mutate({
            kmInicio: data.kmInicio,
            kmLlegada: data.kmLlegada,
            kmLlegadaBase: data.kmLlegadaBase,
        });
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!viaje) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6">No se encontró el viaje</Typography>
                <Button onClick={() => navigate('/app/mis-viajes')} sx={{ mt: 2 }}>Volver</Button>
            </Box>
        );
    }

    const isCerrado = viaje.cerrado;
    const isFacturado = viaje.facturado;

    return (
        <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
            {/* Header / Hero */}
            <Box sx={{ ...styles.heroHeader, position: 'sticky', top: 0, zIndex: 10, px: { xs: 2, md: 4 }, py: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button 
                        onClick={() => navigate('/app/mis-viajes')}
                        sx={{ minWidth: 'auto', p: 1, borderRadius: '50%', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                        <ArrowBackIcon />
                    </Button>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
                                Viaje: {viaje.codigo}
                            </Typography>
                            <Box sx={{ px: 1.5, py: 0.5, borderRadius: '999px', bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {viaje.estadoNombre}
                            </Box>
                        </Box>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary">CERRADO:</Typography>
                            <Typography variant="caption" fontWeight="900" color={isCerrado ? 'success.main' : 'error.main'}>{isCerrado ? 'SÍ' : 'NO'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary">FACTURADO:</Typography>
                            <Typography variant="caption" fontWeight="900" color={isFacturado ? 'success.main' : 'error.main'}>{isFacturado ? 'SÍ' : 'NO'}</Typography>
                        </Box>
                    </Stack>
                </Box>
            </Box>

            {/* Title Section */}
            <Box sx={{ px: { xs: 2, md: 4 }, py: 4, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary', '& > span': { fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase' } }}>
                    <span>Viajes</span>
                    <span>›</span>
                    <span>{viaje.codigo}</span>
                    <span>›</span>
                    <Typography component="span" color="primary.main" fontWeight="bold">
                        {activeTab === 0 ? 'Resumen' : 'Gestión de KMs'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                            Ruta: {viaje.origenDescripcion} - {viaje.destinoDescripcion}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Cliente: {viaje.clienteRazonSocial}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Tabs Navigation */}
            <Box sx={{ px: { xs: 2, md: 4 }, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                <Tabs value={activeTab} onChange={(_, nv) => setActiveTab(nv)} sx={{ minHeight: 48, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minWidth: 'auto', px: 3, py: 1.5 } }}>
                    <Tab label="Resumen" />
                    <Tab label="KMs" />
                </Tabs>
            </Box>

            {/* Content Canvas */}
            <Box sx={{ flex: 1, bgcolor: 'background.paper', p: { xs: 2, md: 4 } }}>
                {activeTab === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
                            <Box sx={{ ...styles.card, gridColumn: { xs: 'span 1', xl: 'span 5' } }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                                    Resumen operativo
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                    <SummaryItem label="Cliente" value={viaje.clienteRazonSocial} />
                                    <SummaryItem label="Ruta" value={`${viaje.origenDescripcion} -> ${viaje.destinoDescripcion}`} />
                                    <SummaryItem label="Fecha de carga" value={formatDateLabel(viaje.fechaCarga)} />
                                    <SummaryItem label="Fecha de partida" value={formatDateLabel(viaje.fechaPartida)} />
                                    <SummaryItem label="Fecha de llegada" value={formatDateLabel(viaje.fechaLlegada)} />
                                    <SummaryItem label="Fecha de descarga" value={formatDateLabel(viaje.fechaDescarga)} />
                                    <SummaryItem label="Llegada a base" value={formatDateLabel(viaje.fechaLlegadaBase)} />
                                    <SummaryItem label="Estado actual" value={viaje.estadoNombre} />
                                </Box>
                            </Box>

                            <Box sx={{ ...styles.card, gridColumn: { xs: 'span 1', xl: 'span 3' } }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                                    Unidad asignada
                                </Typography>
                                <Stack spacing={3}>
                                    <SummaryItem label="Tracto" value={viaje.tractoPlaca || 'Sin informacion'} />
                                    <SummaryItem label="Carreta" value={viaje.carretaPlaca || 'Sin informacion'} />
                                    <SummaryItem label="Viaje cerrado" value={isCerrado ? 'Si' : 'No'} />
                                    <SummaryItem label="Viaje facturado" value={isFacturado ? 'Si' : 'No'} />
                                </Stack>
                            </Box>

                            <Box sx={{ ...styles.card, gridColumn: { xs: 'span 1', xl: 'span 4' } }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                                    Kilometraje registrado
                                </Typography>
                                <Stack spacing={3}>
                                    <SummaryItem label="Inicio de ruta" value={formatKmLabel(viaje.kmInicio)} />
                                    <SummaryItem label="Llegada a destino" value={formatKmLabel(viaje.kmLlegada)} />
                                    <SummaryItem label="Regreso a base" value={formatKmLabel(viaje.kmLlegadaBase)} />
                                </Stack>
                                <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Esta vista muestra únicamente información disponible en el contrato actual del portal del empleado.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
                        <Box sx={{ width: { xs: '100%', lg: '33%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ ...styles.card }}>
                                <Typography variant="overline" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3 }}>
                                    Contexto del viaje
                                </Typography>
                                <Stack spacing={2.5}>
                                    <SummaryItem label="Ruta" value={`${viaje.origenDescripcion} -> ${viaje.destinoDescripcion}`} />
                                    <SummaryItem label="Cliente" value={viaje.clienteRazonSocial} />
                                    <SummaryItem label="Tracto" value={viaje.tractoPlaca || 'Sin informacion'} />
                                    <SummaryItem label="Carreta" value={viaje.carretaPlaca || 'Sin informacion'} />
                                </Stack>
                            </Box>
                        </Box>

                        <Box sx={{ width: { xs: '100%', lg: '67%' } }}>
                            <Box sx={{ ...styles.card, height: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>Registro de Kilometraje</Typography>
                                        <Typography variant="body2" color="text.secondary">Introduzca los valores actuales para actualizar la hoja de ruta.</Typography>
                                    </Box>
                                </Box>

                                <Box component="form" onSubmit={handleSubmit(onSubmitKms)} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                                        <Box>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1 }}>KM INICIO DE RUTA</Typography>
                                            <Controller
                                                name="kmInicio"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        fullWidth
                                                        type="number"
                                                        placeholder="0"
                                                        disabled={isCerrado}
                                                        error={!!errors.kmInicio}
                                                        helperText={errors.kmInicio?.message}
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end"><Typography fontWeight="bold" color="text.secondary">KM</Typography></InputAdornment>,
                                                            sx: { fontSize: '1.5rem', fontWeight: 'bold', bgcolor: 'action.hover', borderRadius: 2, '& fieldset': { border: 'none' } }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1 }}>KM LLEGADA DESTINO</Typography>
                                            <Controller
                                                name="kmLlegada"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        fullWidth
                                                        type="number"
                                                        placeholder="0"
                                                        disabled={isCerrado}
                                                        error={!!errors.kmLlegada}
                                                        helperText={errors.kmLlegada?.message}
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end"><Typography fontWeight="bold" color="text.secondary">KM</Typography></InputAdornment>,
                                                            sx: { fontSize: '1.5rem', fontWeight: 'bold', bgcolor: 'action.hover', borderRadius: 2, '& fieldset': { border: 'none' } }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1 }}>KM REGRESO A BASE (FINAL)</Typography>
                                        <Controller
                                            name="kmLlegadaBase"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    type="number"
                                                    placeholder="0"
                                                    disabled={isCerrado}
                                                    error={!!errors.kmLlegadaBase}
                                                    helperText={errors.kmLlegadaBase?.message}
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end"><Typography fontWeight="bold" color="text.secondary">KM TOTAL</Typography></InputAdornment>,
                                                        sx: { fontSize: '2rem', fontWeight: 'bold', bgcolor: 'action.hover', borderRadius: 2, '& fieldset': { border: 'none' } }
                                                    }}
                                                />
                                            )}
                                        />
                                    </Box>

                                    <Divider sx={{ my: 1 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
                                            <InfoIcon fontSize="small" />
                                            <Typography variant="body2">Los campos se bloquearán una vez guardado el cierre de viaje.</Typography>
                                        </Box>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={isCerrado || updateKmsMutation.isPending}
                                            startIcon={<SaveIcon />}
                                            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 8px 16px rgba(0,93,168,0.2)' }}
                                        >
                                            Guardar Kilometraje
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
