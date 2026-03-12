import { 
    Box, Button, Typography, TextField, MenuItem, Grid,
    useTheme, CircularProgress,
    Paper,
    alpha
} from '@mui/material';
import { 
    ReportProblem as ReportProblemIcon,
    Save as SaveIcon,
    Edit as EditIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ViajeIncidente } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { UbigeoSelect } from '@/shared/components/ui/UbigeoSelect';
import { ImageUpload } from '@/shared/components/ui/ImageUpload';
import { useCreateViajeIncidente, useUpdateViajeIncidente } from '@/features/viaje/hooks/useViajeIncidentes';
import { viajeIncidenteSchema, type ViajeIncidenteFormData } from '../../model/schema';
import { getCurrentDateISO, getCurrentTimeISO, toInputDate, toInputTime, combineDateTime } from '@/shared/utils/date-utils';

interface Props {
    viajeId: number;
    tiposIncidente: SelectItem[];
    incidente?: ViajeIncidente | null;
    onCancel?: () => void;
}

export function ViajeIncidenteCreateEdit({ viajeId, tiposIncidente, incidente, onCancel }: Props) {
    const theme = useTheme();
    const createMutation = useCreateViajeIncidente();
    const updateMutation = useUpdateViajeIncidente();

    const isEditing = !!incidente;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    // Local state for separate date and time inputs
    const [date, setDate] = useState(getCurrentDateISO());
    const [time, setTime] = useState(getCurrentTimeISO());

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<ViajeIncidenteFormData>({
        resolver: zodResolver(viajeIncidenteSchema),
        defaultValues: {
            fechaHora: new Date().toISOString(),
            tipoIncidenteID: 0,
            descripcion: '',
            ubigeoID: 0,
            lugar: '',
            rutaFoto: ''
        }
    });

    useEffect(() => {
        if (incidente) {
            setDate(toInputDate(incidente.fechaHora));
            setTime(toInputTime(incidente.fechaHora));

            reset({
                fechaHora: incidente.fechaHora,
                tipoIncidenteID: incidente.tipoIncidenteID,
                descripcion: incidente.descripcion || '',
                ubigeoID: incidente.ubigeoID,
                lugar: incidente.lugar || '',
                rutaFoto: incidente.rutaFoto || ''
            });
        } else {
            setDate(getCurrentDateISO());
            setTime(getCurrentTimeISO());
            
            reset({
                fechaHora: new Date().toISOString(),
                tipoIncidenteID: 0,
                descripcion: '',
                ubigeoID: 0,
                lugar: '',
                rutaFoto: ''
            });
        }
    }, [incidente, reset]);

    useEffect(() => {
        // Combine date and time into ISO string when either changes
        try {
            if (date && time) {
                const combined = combineDateTime(date, time);
                if (combined) {
                    setValue('fechaHora', combined, { shouldValidate: true });
                }
            }
        } catch (e) {
            console.error("Invalid date/time format");
        }
    }, [date, time, setValue]);

    const onSubmit = async (data: ViajeIncidenteFormData) => {
        if (!viajeId) return;
        
        try {
            if (isEditing && incidente) {
                await updateMutation.mutateAsync({ 
                    id: incidente.viajeIncidenteID, 
                    data: data, 
                    viajeId 
                });
            } else {
                await createMutation.mutateAsync({ viajeId, data: data });
            }
            
            // Reset form
            setDate(getCurrentDateISO());
            setTime(getCurrentTimeISO());

            reset({
                fechaHora: new Date().toISOString(),
                tipoIncidenteID: 0,
                descripcion: '',
                ubigeoID: 0,
                lugar: '',
                rutaFoto: ''
            });
            
            if (onCancel) onCancel();
        } catch (error) {
            console.error("Error saving incidente:", error);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(isEditing ? theme.palette.warning.main : theme.palette.primary.main, 0.02)
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                        bgcolor: isEditing ? theme.palette.warning.main : theme.palette.primary.main,
                        color: 'white',
                        p: 0.5,
                        borderRadius: '50%',
                        display: 'flex'
                    }}>
                        {isEditing ? <EditIcon fontSize="small" /> : <ReportProblemIcon fontSize="small" />}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        {isEditing ? "Editar Incidente" : "Agregar Incidente"}
                    </Typography>
                </Box>
                {isEditing && (
                    <Button 
                        size="small" 
                        color="inherit" 
                        onClick={onCancel}
                        startIcon={<CancelIcon />}
                    >
                        Cancelar Edición
                    </Button>
                )}
            </Box>

            <Grid container spacing={2}>
                <Grid size={{xs:12, md:8}}>
                    <Grid container spacing={2}>
                        <Grid size={{xs:12, sm:6}}>
                            <Controller
                                name="tipoIncidenteID"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Tipo Incidente"
                                        fullWidth
                                        size="small"
                                        error={!!errors.tipoIncidenteID}
                                        helperText={errors.tipoIncidenteID?.message}
                                    >
                                        <MenuItem value={0} disabled>Seleccione...</MenuItem>
                                        {tiposIncidente.map(tipo => (
                                            <MenuItem key={tipo.id} value={tipo.id}>{tipo.text}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{xs:12, sm:6}}>
                            <Controller
                                name="ubigeoID"
                                control={control}
                                render={({ field }) => (
                                    <UbigeoSelect
                                        label=''
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        error={!!errors.ubigeoID}
                                        helperText={errors.ubigeoID?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{xs:12, sm:6}}>
                            <TextField
                                label="Fecha"
                                type="date"
                                fullWidth
                                size="small"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.fechaHora}
                            />
                        </Grid>
                        <Grid size={{xs:12, sm:6}}>
                            <TextField
                                label="Hora"
                                type="time"
                                fullWidth
                                size="small"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.fechaHora}
                                helperText={errors.fechaHora?.message}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <Controller
                                name="lugar"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Lugar / Referencia"
                                        fullWidth
                                        size="small"
                                        error={!!errors.lugar}
                                        helperText={errors.lugar?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <Controller
                                name="descripcion"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Descripción del Incidente"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        size="small"
                                        error={!!errors.descripcion}
                                        helperText={errors.descripcion?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid size={{xs:12,md:4}}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                            Evidencia Fotográfica
                        </Typography>
                        <Controller
                            name="rutaFoto"
                            control={control}
                            render={({ field }) => (
                                <ImageUpload
                                    value={field.value || undefined}
                                    onChange={(base64) => field.onChange(base64)}
                                    label="Evidencia Fotográfica (Imagen)"
                                />
                            )}
                        />
                        {errors.rutaFoto && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                {errors.rutaFoto.message}
                            </Typography>
                        )}
                    </Box>
                </Grid>

                <Grid size={{xs:12}}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
                        <Button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            variant="contained"
                            color={isEditing ? "warning" : "primary"}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            disabled={isLoading}
                        >
                            {isEditing ? "Actualizar Incidente" : "Registrar Incidente"}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}