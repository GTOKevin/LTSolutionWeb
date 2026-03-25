import { useEffect, useState } from 'react';
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
    Typography,
    Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { createMercaderiaSchema, type CreateMercaderiaSchema } from '../../model/schema';
import type { Mercaderia } from '@entities/mercaderia/model/types';
import { useCreateMercaderia, useUpdateMercaderia } from '../../hooks/useMercaderiaCrud';
import { handleBackendErrors } from '@/shared/utils/form-validation';

interface Props {
    open: boolean;
    onClose: () => void;
    mercaderiaToEdit?: Mercaderia | null;
    onSuccess: () => void;
}

export function CreateEditMercaderiaModal({ open, onClose, mercaderiaToEdit, onSuccess }: Props) {
    const isEdit = !!mercaderiaToEdit;
    const createMutation = useCreateMercaderia();
    const updateMutation = useUpdateMercaderia();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        formState: { errors, isSubmitting }
    } = useForm<CreateMercaderiaSchema>({
        resolver: zodResolver(createMercaderiaSchema),
        defaultValues: {
            nombre: '',
            activo: true || undefined
        }
    });

    useEffect(() => {
        if (open) {
            setErrorMessage(null);
            if (mercaderiaToEdit) {
                reset({
                    nombre: mercaderiaToEdit.nombre,
                    activo: mercaderiaToEdit.activo ?? true
                });
            } else {
                reset({
                    nombre: '',
                    activo: true
                });
            }
        }
    }, [open, mercaderiaToEdit, reset]);

    const onSubmit = async (data: CreateMercaderiaSchema) => {
        setErrorMessage(null);
        try {
            if (isEdit) {
                await updateMutation.mutateAsync({
                    id: mercaderiaToEdit.mercaderiaID,
                    data
                });
            } else {
                await createMutation.mutateAsync(data);
            }
            onSuccess();
            onClose();
        } catch (error: unknown) {
            const genericError = handleBackendErrors(error, setError);
            if (genericError) {
                setErrorMessage(genericError);
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                {isEdit ? 'Editar Mercadería' : 'Nueva Mercadería'}
            </DialogTitle>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    {errorMessage && (
                        <Box sx={{ mb: 2 }}>
                            <Alert severity="error" onClose={() => setErrorMessage(null)}>
                                {errorMessage}
                            </Alert>
                        </Box>
                    )}
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