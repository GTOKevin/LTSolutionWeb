import { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box,
    Switch,
    FormControlLabel,
    Typography
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/shared/components/ui/Toast';
import { createGastoSchema, type CreateGastoSchema } from '../../model/schema';
import type { Gasto } from '@entities/gasto/model/types';
import { useCreateGasto, useUpdateGasto } from '../../hooks/useGastoCrud';

interface Props {
    open: boolean;
    onClose: () => void;
    gastoToEdit?: Gasto | null;
    onSuccess: () => void;
}

export function CreateEditGastoModal({ open, onClose, gastoToEdit, onSuccess }: Props) {
    const isEdit = !!gastoToEdit;
    const { showToast } = useToast();
    const createMutation = useCreateGasto();
    const updateMutation = useUpdateGasto();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<CreateGastoSchema>({
        resolver: zodResolver(createGastoSchema),
        defaultValues: {
            nombre: '',
            activo: true
        }
    });

    useEffect(() => {
        if (open) {
            if (gastoToEdit) {
                reset({
                    nombre: gastoToEdit.nombre,
                    activo: gastoToEdit.activo ?? true
                });
            } else {
                reset({
                    nombre: '',
                    activo: true
                });
            }
        }
    }, [open, gastoToEdit, reset]);

    const onSubmit = async (data: CreateGastoSchema) => {
        try {
            if (isEdit) {
                await updateMutation.mutateAsync({
                    id: gastoToEdit.gastoID,
                    data
                });
                showToast({ message: 'Gasto actualizado exitosamente', severity: 'success' });
            } else {
                await createMutation.mutateAsync(data);
                showToast({ message: 'Gasto creado exitosamente', severity: 'success' });
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            showToast({ message: error.response?.data?.detail || 'Error al guardar el gasto', severity: 'error' });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                {isEdit ? 'Editar Gasto' : 'Nuevo Gasto'}
            </DialogTitle>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Nombre"
                                fullWidth
                                {...register('nombre')}
                                error={!!errors.nombre}
                                helperText={errors.nombre?.message}
                                size="small"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ mt: 1 }}>
                                <Controller
                                    name="activo"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" color="text.secondary">
                                                    {field.value ? 'Activo (Visible en el sistema)' : 'Inactivo (Oculto en el sistema)'}
                                                </Typography>
                                            }
                                        />
                                    )}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} disabled={isSubmitting || updateMutation.isPending || createMutation.isPending}>
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={isSubmitting || updateMutation.isPending || createMutation.isPending}
                    >
                        {isEdit ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}