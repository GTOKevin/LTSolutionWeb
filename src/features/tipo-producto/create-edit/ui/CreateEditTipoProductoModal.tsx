import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
    Box,
    Switch,
    FormControlLabel,
    Typography,
    Autocomplete,
    Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createTipoProductoSchema, type CreateTipoProductoSchema } from '../../model/schema';
import type { TipoProducto } from '@entities/tipo-producto/model/types';
import { useCreateTipoProducto, useUpdateTipoProducto } from '../../hooks/useTipoProductoCrud';
import { tipoProductoApi } from '@entities/tipo-producto/api/tipo-producto.api';
import { handleBackendErrors } from '@/shared/utils/form-validation';

interface Props {
    open: boolean;
    onClose: () => void;
    tipoProductoToEdit?: TipoProducto | null;
    onSuccess: () => void;
}

export function CreateEditTipoProductoModal({ open, onClose, tipoProductoToEdit, onSuccess }: Props) {
    const isEdit = !!tipoProductoToEdit;
    const createMutation = useCreateTipoProducto();
    const updateMutation = useUpdateTipoProducto();
    const [inputValue, setInputValue] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { data: categoriasQuery } = useQuery({
        queryKey: ['categorias-select'],
        queryFn: tipoProductoApi.getSelectCategoria,
        enabled: open
    });

    const categorias = categoriasQuery?.data?.map(c => c.text) || [];

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        formState: { errors, isSubmitting }
    } = useForm<CreateTipoProductoSchema>({
        resolver: zodResolver(createTipoProductoSchema),
        defaultValues: {
            nombre: '',
            tipo: 'PROD',
            categoria: '',
            activo: true
        }
    });

    useEffect(() => {
        if (open) {
            setErrorMessage(null);
            if (tipoProductoToEdit) {
                reset({
                    nombre: tipoProductoToEdit.nombre,
                    tipo: tipoProductoToEdit.tipo,
                    categoria: tipoProductoToEdit.categoria,
                    activo: tipoProductoToEdit.activo ?? true
                });
                setInputValue(tipoProductoToEdit.categoria);
            } else {
                reset({
                    nombre: '',
                    tipo: 'PROD',
                    categoria: '',
                    activo: true || undefined
                });
                setInputValue('');
            }
        }
    }, [open, tipoProductoToEdit, reset]);

    const onSubmit = async (data: CreateTipoProductoSchema) => {
        setErrorMessage(null);
        try {
            if (isEdit) {
                await updateMutation.mutateAsync({
                    id: tipoProductoToEdit.tipoProductoID,
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
                {isEdit ? 'Editar Tipo de Producto' : 'Nuevo Tipo de Producto'}
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

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="tipo"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Tipo"
                                        fullWidth
                                        error={!!errors.tipo}
                                        helperText={errors.tipo?.message}
                                        size="small"
                                    >
                                        <MenuItem value="PROD">Producto</MenuItem>
                                        <MenuItem value="SERV">Servicio</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="categoria"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        freeSolo
                                        options={categorias}
                                        value={field.value}
                                        onChange={(_, newValue) => {
                                            field.onChange(newValue || '');
                                        }}
                                        inputValue={inputValue}
                                        onInputChange={(_, newInputValue) => {
                                            setInputValue(newInputValue);
                                            field.onChange(newInputValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Categoría"
                                                error={!!errors.categoria}
                                                helperText={errors.categoria?.message}
                                                size="small"
                                            />
                                        )}
                                    />
                                )}
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