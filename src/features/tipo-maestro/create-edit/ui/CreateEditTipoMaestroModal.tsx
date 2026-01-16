import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Grid,
    FormControlLabel,
    Switch,
    IconButton,
    Autocomplete
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { tipoMaestroSchema, type TipoMaestroSchema } from '../../model/schema';
import { tipoMaestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import type { TipoMaestro } from '@entities/tipo-maestro/model/types';

interface CreateEditTipoMaestroModalProps {
    open: boolean;
    onClose: () => void;
    maestroToEdit: TipoMaestro | null;
    onSuccess: (id: number) => void;
}

export function CreateEditTipoMaestroModal({
    open,
    onClose,
    maestroToEdit,
    onSuccess
}: CreateEditTipoMaestroModalProps) {
    const isEdit = !!maestroToEdit;
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(tipoMaestroSchema),
        defaultValues: {
            nombre: '',
            codigo: '',
            seccion: '',
            activo: true
        }
    });

    // Fetch secciones for Autocomplete
    const { data: secciones } = useQuery({
        queryKey: ['secciones-maestro'],
        queryFn: tipoMaestroApi.getSecciones,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    useEffect(() => {
        if (open) {
            if (maestroToEdit) {
                reset({
                    nombre: maestroToEdit.nombre,
                    codigo: maestroToEdit.codigo || '',
                    seccion: maestroToEdit.seccion || '',
                    activo: maestroToEdit.activo
                });
            } else {
                reset({
                    nombre: '',
                    codigo: '',
                    seccion: '',
                    activo: true
                });
            }
        }
    }, [open, maestroToEdit, reset]);

    const mutation = useMutation({
        mutationFn: async (data: TipoMaestroSchema) => {
            if (isEdit && maestroToEdit) {
                await tipoMaestroApi.update(maestroToEdit.tipoMaestroID, data);
                return maestroToEdit.tipoMaestroID;
            }
            const response = await tipoMaestroApi.create(data);
            return response.data;
        },
        onSuccess: (id: number) => {
            queryClient.invalidateQueries({ queryKey: ['tipo-maestros'] });
            queryClient.invalidateQueries({ queryKey: ['secciones-maestro'] }); // Invalidate sections as we might have added one
            onSuccess(id);
            onClose();
        },
    });

    const onSubmit = (data: TipoMaestroSchema) => {
        mutation.mutate(data);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                pb: 1
            }}>
                <Typography variant="h6" fontWeight="bold">
                    {isEdit ? 'Editar Maestro' : 'Nuevo Maestro'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid size={{xs:12}}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                                Información General
                            </Typography>
                        </Grid>

                        <Grid size={{xs:12}}>
                            <Controller
                                name="seccion"
                                control={control}
                                render={({ field: { onChange, value, ref, ...field } }) => (
                                    <Autocomplete
                                        {...field}
                                        freeSolo
                                        options={secciones?.data || []}
                                        value={value || null}
                                        onChange={(_, newValue) => onChange(newValue)}
                                        onInputChange={(_, newInputValue) => {
                                            // When typing free text, update the form value
                                            // Note: Autocomplete behavior can be tricky. 
                                            // If freeSolo is true, value can be string.
                                            // We usually rely on onChange for selection, but for typing...
                                            // If user types and doesn't select, onChange might be called with string or we rely on onInputChange?
                                            // With freeSolo, onChange is called with string value when Enter is pressed or focus lost if it's not an option?
                                            // Actually, simplest way for react-hook-form + Autocomplete freeSolo:
                                            onChange(newInputValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                label="Sección *" 
                                                placeholder="Seleccione o escriba una sección (Ej: VEHICULO)"
                                                error={!!errors.seccion}
                                                helperText={errors.seccion?.message || "La sección define el grupo y el rango de IDs"}
                                                inputRef={ref}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <Controller
                                name="nombre"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Nombre *"
                                        fullWidth
                                        error={!!errors.nombre}
                                        helperText={errors.nombre?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <Controller
                                name="codigo"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Código"
                                        fullWidth
                                        placeholder="Código opcional"
                                        error={!!errors.codigo}
                                        helperText={errors.codigo?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{xs:12}}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name="activo"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                color="success"
                                            />
                                        )}
                                    />
                                }
                                label="Registro Activo"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        disabled={isSubmitting || mutation.isPending}
                    >
                        {isEdit ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
