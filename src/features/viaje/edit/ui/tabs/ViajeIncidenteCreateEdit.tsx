import { logger } from '@/shared/utils/logger';
import {
    Box, Button, Typography, TextField,
    useTheme, CircularProgress, alpha,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ViajeIncidente } from '@/entities/viaje/model/types';
import { buildIncidenteImagesPayload } from '@/entities/viaje/model/incidente-images';
import type { SelectItem } from '@/shared/model/types';
import { UbigeoSelect } from '@/shared/components/ui/UbigeoSelect';
import { MultiImageUploadField } from '@/shared/components/ui/MultiImageUploadField';
import { useCreateViajeIncidente, useUpdateViajeIncidente } from '@/features/viaje/hooks/useViajeIncidentes';
import { viajeIncidenteSchema, type ViajeIncidenteFormData } from '@/features/viaje/model/schema';
import { getCurrentDateISO, getCurrentTimeISO, toInputDate, toInputTime, combineDateTime } from '@/shared/utils/date-utils';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { handleBackendErrors } from '@/shared/utils/form-validation';

interface Props {
    viajeId: number;
    tiposIncidente: SelectItem[];
    incidente?: ViajeIncidente | null;
    onCancel?: () => void;
}

const getIncidenteFormDefaults = (incidente?: ViajeIncidente | null): ViajeIncidenteFormData => ({
    fechaHora: incidente?.fechaHora ?? new Date().toISOString(),
    tipoIncidenteID: incidente?.tipoIncidenteID ?? 0,
    descripcion: incidente?.descripcion || '',
    ubigeoID: incidente?.ubigeoID ?? 0,
    lugar: incidente?.lugar || '',
    rutasFoto: incidente?.rutasFoto?.length ? incidente.rutasFoto : [],
});

const getIncidenteDateTimeDefaults = (incidente?: ViajeIncidente | null) => ({
    date: incidente ? toInputDate(incidente.fechaHora) : getCurrentDateISO(),
    time: incidente ? toInputTime(incidente.fechaHora) : getCurrentTimeISO(),
});

export function ViajeIncidenteCreateEdit({ viajeId, tiposIncidente, incidente, onCancel }: Props) {
    const theme = useTheme();
    const createMutation = useCreateViajeIncidente();
    const updateMutation = useUpdateViajeIncidente();

    const isEditing = !!incidente;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    const [date, setDate] = useState(getCurrentDateISO());
    const [time, setTime] = useState(getCurrentTimeISO());

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm<ViajeIncidenteFormData>({
        resolver: zodResolver(viajeIncidenteSchema),
        defaultValues: {
            fechaHora: new Date().toISOString(),
            tipoIncidenteID: 0,
            descripcion: '',
            ubigeoID: 0,
            lugar: '',
            rutasFoto: [],
        },
    });

    useEffect(() => {
        const defaults = getIncidenteDateTimeDefaults(incidente);
        reset(getIncidenteFormDefaults(incidente));

        const resetUiTimer = window.setTimeout(() => {
            setDate(defaults.date);
            setTime(defaults.time);
        }, 0);

        return () => {
            window.clearTimeout(resetUiTimer);
        };
    }, [incidente, reset]);

    useEffect(() => {
        try {
            if (date && time) {
                const combined = combineDateTime(date, time);
                if (combined) {
                    setValue('fechaHora', combined, { shouldValidate: true });
                }
            }
        } catch {
            logger.error('Invalid date/time format');
        }
    }, [date, time, setValue]);

    const onSubmit = async (data: ViajeIncidenteFormData) => {
        if (!viajeId) return;

        const payload = {
            ...data,
            ...buildIncidenteImagesPayload(data.rutasFoto),
        };

        try {
            if (isEditing && incidente) {
                await updateMutation.mutateAsync({
                    id: incidente.viajeIncidenteID,
                    data: payload,
                    viajeId,
                });
            } else {
                await createMutation.mutateAsync({ viajeId, data: payload });
            }

            setDate(getCurrentDateISO());
            setTime(getCurrentTimeISO());
            reset(getIncidenteFormDefaults());

            if (onCancel) onCancel();
        } catch (error) {
            logger.error('Error saving incidente:', error);
            handleBackendErrors<ViajeIncidenteFormData>(error, setError);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    p: 3,
                    borderRadius: 3,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.5),
                }}
            >
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {isEditing ? 'Editar Incidente' : 'Registro de Incidente'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', mt: 0.5, display: 'block' }}>
                        {isEditing ? 'MODIFICACIÓN DE REPORTE' : 'NUEVO REPORTE DE CAMPO'}
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
                                Tipo de Incidente
                            </Typography>
                            <Controller
                                name="tipoIncidenteID"
                                control={control}
                                render={({ field }) => (
                                    <Box sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 }, padding: '2px' }}>
                                        <FormSelect
                                            label=""
                                            options={tiposIncidente}
                                            value={field.value}
                                            onChange={(event) => field.onChange(Number(event.target.value))}
                                            error={!!errors.tipoIncidenteID}
                                            helperText={errors.tipoIncidenteID?.message}
                                        />
                                    </Box>
                                )}
                            />
                        </Box>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
                                Ubicación (Ubigeo)
                            </Typography>
                            <Controller
                                name="ubigeoID"
                                control={control}
                                render={({ field }) => (
                                    <Box sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 } }}>
                                        <UbigeoSelect
                                            label=""
                                            value={field.value}
                                            onChange={(value) => field.onChange(value)}
                                            error={!!errors.ubigeoID}
                                            helperText={errors.ubigeoID?.message}
                                        />
                                    </Box>
                                )}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
                                Fecha
                            </Typography>
                            <TextField
                                type="date"
                                fullWidth
                                size="small"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.fechaHora}
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 } }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
                                Hora
                            </Typography>
                            <TextField
                                type="time"
                                fullWidth
                                size="small"
                                value={time}
                                onChange={(event) => setTime(event.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.fechaHora}
                                helperText={errors.fechaHora?.message}
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 } }}
                            />
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
                            Lugar / Referencia
                        </Typography>
                        <Controller
                            name="lugar"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    size="small"
                                    placeholder="KM 42 Autopista Norte..."
                                    error={!!errors.lugar}
                                    helperText={errors.lugar?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 } }}
                                />
                            )}
                        />
                    </Box>

                    <Box>
                        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
                            Descripción de los Hechos
                        </Typography>
                        <Controller
                            name="descripcion"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder="Escriba los detalles aquí..."
                                    error={!!errors.descripcion}
                                    helperText={errors.descripcion?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 } }}
                                />
                            )}
                        />
                    </Box>

                    <Box>
                        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
                            Evidencia Fotográfica
                        </Typography>
                        <Controller
                            name="rutasFoto"
                            control={control}
                            render={({ field }) => (
                                <MultiImageUploadField
                                    values={field.value}
                                    onChange={(values) => field.onChange(values)}
                                    helperText="Adjunta evidencia del incidente. Se subirán automáticamente al seleccionarlas. (JPG/PNG, máx. 1 MB)"
                                    folder="incidentes"
                                    minItems={1}
                                />
                            )}
                        />
                        {errors.rutasFoto && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                {errors.rutasFoto.message}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        {isEditing && (
                            <Button
                                type="button"
                                onClick={onCancel}
                                variant="outlined"
                                color="inherit"
                                sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, flex: 1 }}
                            >
                                Cancelar
                            </Button>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            sx={{
                                py: 1.5,
                                borderRadius: 3,
                                fontWeight: 800,
                                flex: isEditing ? 1 : 2,
                                background: isEditing ? 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)' : 'linear-gradient(135deg, #005da8 0%, #0076d2 100%)',
                                boxShadow: isEditing ? '0 4px 14px rgba(245, 124, 0, 0.3)' : '0 4px 14px rgba(0, 93, 168, 0.3)',
                            }}
                        >
                            {isEditing ? 'Actualizar Incidente' : 'Guardar Incidente'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
