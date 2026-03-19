import { logger } from '@/shared/utils/logger';
import { 
    Button, TextField, FormControlLabel, Switch,
    Paper, Typography, Grid, useTheme, alpha, CircularProgress
} from '@mui/material';
import { 
    Save as SaveIcon
} from '@mui/icons-material';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateViajeEscoltaDto, ViajeEscolta } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { useCreateViajeEscolta, useUpdateViajeEscolta } from '@/features/viaje/hooks/useViajeEscoltas';
import { viajeEscoltaSchema, type ViajeEscoltaFormData } from '../../model/schema';
import { SubFormHeader } from '@/shared/components/ui/SubFormHeader';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { handleBackendErrors } from '@/shared/utils/form-validation';

interface Props {
    viajeId: number;
    flotas: SelectItem[];
    colaboradores: SelectItem[];
    escolta?: ViajeEscolta | null;
    onCancel?: () => void;
}

export function ViajeEscoltaCreateEdit({ viajeId, flotas, colaboradores, escolta, onCancel }: Props) {
    const theme = useTheme();
    const createMutation = useCreateViajeEscolta();
    const updateMutation = useUpdateViajeEscolta();

    const isEditing = !!escolta;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    const { control, handleSubmit, reset, watch, setValue, setError, formState: { errors } } = useForm<ViajeEscoltaFormData>({
        resolver: zodResolver(viajeEscoltaSchema),
        defaultValues: {
            tercero: false,
            flotaID: 0,
            colaboradorID: 0,
            nombreConductor: '',
            empresa: ''
        }
    });

    const isTercero = watch('tercero');

    useEffect(() => {
        if (escolta) {
            reset({
                tercero: escolta.tercero ?? false,
                flotaID: escolta.flotaID || 0,
                colaboradorID: escolta.colaboradorID || 0,
                nombreConductor: escolta.nombreConductor || '',
                empresa: escolta.empresa || ''
            });
        } else {
            reset({
                tercero: false,
                flotaID: 0,
                colaboradorID: 0,
                nombreConductor: '',
                empresa: ''
            });
        }
    }, [escolta, reset]);

    // Clear fields when switching types
    useEffect(() => {
        if (isTercero) {
            setValue('flotaID', 0);
            setValue('colaboradorID', 0);
        } else {
            setValue('nombreConductor', '');
            setValue('empresa', '');
        }
    }, [isTercero, setValue]);

    const onSubmit = async (data: ViajeEscoltaFormData) => {
        if (!viajeId) return;

        try {
            const payload: CreateViajeEscoltaDto = {
                ...data,
                // Ensure optional fields are undefined if not used
                flotaID: data.flotaID || undefined,
                colaboradorID: data.colaboradorID || undefined,
                nombreConductor: data.nombreConductor || undefined,
                empresa: data.empresa || undefined
            };

            if (isEditing && escolta) {
                await updateMutation.mutateAsync({ 
                    id: escolta.viajeEscoltaID, 
                    data: payload, 
                    viajeId 
                });
            } else {
                await createMutation.mutateAsync({ viajeId, data: payload });
            }
            
            reset();
            if (onCancel) onCancel();
        } catch (error) {
            logger.error("Error saving escolta:", error);
            handleBackendErrors<ViajeEscoltaFormData>(error, setError);
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
            <SubFormHeader 
                isEditing={isEditing}
                titleAdd="Asignar Escolta"
                titleEdit="Editar Escolta"
                onCancel={onCancel}
            />

            <Grid container spacing={2}>
                <Grid size={{xs:12}}>
                    <Controller
                        name="tercero"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={!!field.value} 
                                            onChange={(e) => field.onChange(e.target.checked)} 
                                        />
                                    }
                                    label={<Typography variant="body2" fontWeight="bold">Es Servicio Tercero</Typography>}
                                />
                            )}
                        />
                    </Grid>

                    {!isTercero ? (
                        <>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                    Vehículo Escolta
                                </Typography>
                                <Controller
                                    name="flotaID"
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label=""
                                            options={flotas}
                                            value={field.value || 0}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            error={!!errors.flotaID || !!errors.root}
                                            helperText={errors.flotaID?.message}
                                            sx={{ bgcolor: 'background.paper' }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                    Personal de Seguridad
                                </Typography>
                                <Controller
                                    name="colaboradorID"
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label=""
                                            options={colaboradores}
                                            value={field.value || 0}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            error={!!errors.colaboradorID || !!errors.root}
                                            helperText={errors.colaboradorID?.message}
                                            sx={{ bgcolor: 'background.paper' }}
                                        />
                                    )}
                                />
                            </Grid>
                        </>
                    ) : (
                        <>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                    Nombre Conductor / Personal
                                </Typography>
                                <Controller
                                    name="nombreConductor"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            size="small"
                                            error={!!errors.nombreConductor || !!errors.root}
                                            helperText={errors.nombreConductor?.message}
                                            sx={{ bgcolor: 'background.paper' }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                    Empresa
                                </Typography>
                                <Controller
                                    name="empresa"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            size="small"
                                            error={!!errors.empresa || !!errors.root}
                                            helperText={errors.empresa?.message}
                                            sx={{ bgcolor: 'background.paper' }}
                                        />
                                    )}
                                />
                            </Grid>
                        </>
                    )}

                    {errors.root && (
                        <Grid size={12}>
                            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                {errors.root.message}
                            </Typography>
                        </Grid>
                )}

                <Grid size={{xs:12}} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        variant="contained"
                        color={isEditing ? "warning" : "primary"}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={isLoading}
                        sx={{ 
                            px: 4,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: theme.shadows[2]
                        }}
                    >
                        {isEditing ? "Guardar Cambios" : "Asignar Escolta"}
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
}
