import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    Box,
    Switch,
    FormControlLabel,
    Typography,
    Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGastoSchema, type CreateGastoSchema } from '../../model/schema';

import type { Gasto } from '@entities/gasto/model/types';
import { useCreateGasto, useUpdateGasto } from '../../hooks/useGastoCrud';
import { handleBackendErrors } from '@/shared/utils/form-validation';
import { monedaApi } from '@/entities/moneda/api/moneda.api';

interface Props {
    open: boolean;
    onClose: () => void;
    gastoToEdit?: Gasto | null;
    onSuccess: () => void;
    viewOnly?: boolean;
}

export function CreateEditGastoModal({ open, onClose, gastoToEdit, onSuccess, viewOnly = false }: Props) {
    const isEdit = !!gastoToEdit;
    const createMutation = useCreateGasto();
    const updateMutation = useUpdateGasto();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { data: monedas = [] } = useQuery({
        queryKey: ['monedas-select', 'gasto-metadata'],
        queryFn: () => monedaApi.getSelect('', 20),
        enabled: open,
    });

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        formState: { errors, isSubmitting }
    } = useForm<CreateGastoSchema>({
        resolver: zodResolver(createGastoSchema),
        defaultValues: {
            nombre: '',
            codigo: '',
            monedaCodigoDefault: '',
            activo: true
        }
    });

    useEffect(() => {
        if (open) {
            if (gastoToEdit) {
                reset({
                    nombre: gastoToEdit.nombre,
                    codigo: gastoToEdit.codigo,
                    monedaCodigoDefault: gastoToEdit.monedaCodigoDefault || '',
                    activo: gastoToEdit.activo ?? true
                });
            } else {
                reset({
                    nombre: '',
                    codigo: '',
                    monedaCodigoDefault: '',
                    activo: true
                });
            }

            const resetUiTimer = window.setTimeout(() => {
                setErrorMessage(null);
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [open, gastoToEdit, reset]);

    const onSubmit = async (data: CreateGastoSchema) => {
        setErrorMessage(null);
        try {
            if (isEdit) {
                await updateMutation.mutateAsync({
                    id: gastoToEdit.gastoID,
                    data: {
                        ...data,
                        activo: data.activo ?? true
                    }
                });
            } else {
                await createMutation.mutateAsync({
                    ...data,
                    activo: data.activo ?? true
                });
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
                {viewOnly ? 'Detalle de Gasto' : isEdit ? 'Editar Gasto' : 'Nuevo Gasto'}
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
                                disabled={viewOnly}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Código"
                                fullWidth
                                {...register('codigo')}
                                error={!!errors.codigo}
                                helperText={errors.codigo?.message}
                                size="small"
                                disabled={viewOnly}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                label="Moneda por defecto"
                                fullWidth
                                {...register('monedaCodigoDefault')}
                                error={!!errors.monedaCodigoDefault}
                                helperText={errors.monedaCodigoDefault?.message || 'Opcional. Se aplicará al registrar el gasto en viaje.'}
                                size="small"
                                disabled={viewOnly}
                                defaultValue=""
                            >
                                <MenuItem value="">
                                    Sin moneda por defecto
                                </MenuItem>
                                {monedas.map((moneda) => (
                                    <MenuItem key={moneda.id} value={moneda.extra || moneda.text}>
                                        {moneda.text}
                                    </MenuItem>
                                ))}
                            </TextField>
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
                                                    disabled={viewOnly}
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
                        {viewOnly ? 'Cerrar' : 'Cancelar'}
                    </Button>
                    {!viewOnly ? (
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={isSubmitting || updateMutation.isPending || createMutation.isPending}
                        >
                            {isEdit ? 'Actualizar' : 'Crear'}
                        </Button>
                    ) : null}
                </DialogActions>
            </form>
        </Dialog>
    );
}
