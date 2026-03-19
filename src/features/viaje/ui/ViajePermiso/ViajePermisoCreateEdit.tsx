import { logger } from '@/shared/utils/logger';
import { 
    Box, Button, Typography, Paper, Grid,
    useTheme, alpha, CircularProgress
} from '@mui/material';
import { 
    Save as SaveIcon
} from '@mui/icons-material';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ViajePermiso } from '@/entities/viaje/model/types';
import { ImageUpload } from '@/shared/components/ui/ImageUpload';
import { useCreateViajePermiso, useUpdateViajePermiso } from '@/features/viaje/hooks/useViajePermisos';
import { viajePermisoSchema, type ViajePermisoFormData } from '../../model/schema';
import { getCurrentDateISO, toInputDate } from '@/shared/utils/date-utils';
import { SubFormHeader } from '@/shared/components/ui/SubFormHeader';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';

interface Props {
    viajeId: number;
    permiso?: ViajePermiso | null;
    onCancel?: () => void;
}

export function ViajePermisoCreateEdit({ viajeId, permiso, onCancel }: Props) {
    const theme = useTheme();
    const createMutation = useCreateViajePermiso();
    const updateMutation = useUpdateViajePermiso();

    const isEditing = !!permiso;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    const { control, handleSubmit, reset, formState: { errors } } = useForm<ViajePermisoFormData>({
        resolver: zodResolver(viajePermisoSchema),
        defaultValues: {
            fechaVigencia: getCurrentDateISO(),
            fechaVencimiento: undefined,
            rutaArchivo: ''
        }
    });

    useEffect(() => {
        if (permiso) {
            reset({
                fechaVigencia: permiso.fechaVigencia ? toInputDate(permiso.fechaVigencia) : getCurrentDateISO(),
                fechaVencimiento: permiso.fechaVencimiento ? toInputDate(permiso.fechaVencimiento) : undefined,
                rutaArchivo: permiso.rutaArchivo || ''
            });
        } else {
            reset({
                fechaVigencia: getCurrentDateISO(),
                fechaVencimiento: undefined,
                rutaArchivo: ''
            });
        }
    }, [permiso, reset]);

    const onSubmit = async (data: ViajePermisoFormData) => {
        if (!viajeId) return;

        try {
            const payload = {
                ...data,
                fechaVencimiento: data.fechaVencimiento || undefined,
                rutaArchivo: data.rutaArchivo || undefined
            };

            if (isEditing && permiso) {
                await updateMutation.mutateAsync({ 
                    id: permiso.viajePermisoID, 
                    data: payload, 
                    viajeId 
                });
            } else {
                await createMutation.mutateAsync({ viajeId, data: payload });
            }
            
            reset({
                fechaVigencia: getCurrentDateISO(),
                fechaVencimiento: undefined,
                rutaArchivo: ''
            });
            
            if (onCancel) onCancel();
        } catch (error) {
            logger.error("Error saving permiso:", error);
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
                titleAdd="Agregar Permiso"
                titleEdit="Editar Permiso"
                onCancel={onCancel}
            />

            <Grid container spacing={3}>
                <Grid size={{xs:12, md:6}}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Controller
                            name="fechaVigencia"
                            control={control}
                            render={({ field }) => (
                                <FormDatePicker
                                    {...field}
                                    label="Fecha Vigencia"
                                    sx={{ bgcolor: 'background.paper' }}
                                    error={!!errors.fechaVigencia}
                                    helperText={errors.fechaVigencia?.message}
                                />
                            )}
                        />
                        <Controller
                            name="fechaVencimiento"
                            control={control}
                            render={({ field }) => (
                                <FormDatePicker
                                    {...field}
                                    value={field.value || ''}
                                    label="Fecha Vencimiento"
                                    sx={{ bgcolor: 'background.paper' }}
                                    error={!!errors.fechaVencimiento}
                                    helperText={errors.fechaVencimiento?.message}
                                />
                            )}
                        />
                        
                        <Button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            variant="contained"
                            color={isEditing ? "warning" : "primary"}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            disabled={isLoading}
                            sx={{ 
                                mt: 2,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                boxShadow: theme.shadows[2]
                            }}
                        >
                            {isEditing ? "Guardar Cambios" : "Agregar Permiso"}
                        </Button>
                    </Box>
                </Grid>

                <Grid size={{xs:12, md:6}}>
                    <Box sx={{ height: '100%' }}>
                         <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                            Documento / Permiso (Imagen o PDF)
                        </Typography>
                        <Controller
                            name="rutaArchivo"
                            control={control}
                            render={({ field }) => (
                                <ImageUpload
                                    value={field.value}
                                    onChange={(base64) => field.onChange(base64)}
                                    label="Documento / Permiso (Imagen o PDF)"
                                />
                            )}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}