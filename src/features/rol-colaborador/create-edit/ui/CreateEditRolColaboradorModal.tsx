import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    TextField,
    Grid,
    Typography,
    Box,
    useTheme,
    Alert,
    IconButton,
    FormControlLabel,
    Switch,
    DialogActions
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolColaboradorApi } from '@entities/rol-colaborador/api/rol-colaborador.api';
import { rolColaboradorSchema, type RolColaboradorSchema } from '../../model/schema';
import { useEffect, useState } from 'react';
import type { RolColaborador } from '@entities/rol-colaborador/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { handleLettersOnlyKeyDown } from '@shared/utils/input-validators';

interface CreateEditRolColaboradorModalProps {
    open: boolean;
    onClose: () => void;
    rolToEdit?: RolColaborador | null;
    onSuccess: (id: number) => void;
}

export function CreateEditRolColaboradorModal({ open, onClose, rolToEdit, onSuccess }: CreateEditRolColaboradorModalProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const isEdit = !!rolToEdit;

    const {
        register,
        handleSubmit,
        reset,
        setError,
        control,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(rolColaboradorSchema),
        defaultValues: {
            nombre: '',
            descripcion: '',
            activo: true
        }
    });

    useEffect(() => {
        if (open) {
            setErrorMessage(null);
            if (rolToEdit) {
                reset({
                    nombre: rolToEdit.nombre,
                    descripcion: rolToEdit.descripcion || '',
                    activo: rolToEdit.activo
                });
            } else {
                reset({
                    nombre: '',
                    descripcion: '',
                    activo: true
                });
            }
        }
    }, [open, rolToEdit, reset]);

    const mutation = useMutation({
        mutationFn: async (data: RolColaboradorSchema) => {
            if (isEdit && rolToEdit) {
                await rolColaboradorApi.update(rolToEdit.rolColaboradorID, data);
                return rolToEdit.rolColaboradorID;
            }
            const response = await rolColaboradorApi.create(data);
            return response.data;
        },
        onSuccess: (id: number) => {
            queryClient.invalidateQueries({ queryKey: ['roles-colaborador'] });
            onSuccess(id);
            onClose();
        },
        onError: (error: any) => {
            if (error?.response?.status === 409) {
                setErrorMessage('El nombre del rol ya se encuentra registrado.');
            } else {
                const genericError = handleBackendErrors<RolColaboradorSchema>(error, setError);
                if (genericError) {
                    setErrorMessage(genericError);
                }
            }
        }
    });

    const onSubmit = (data: RolColaboradorSchema) => {
        mutation.mutate(data);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: { 
                    borderRadius: 3,
                    bgcolor: theme.palette.background.paper,
                    backgroundImage: 'none'
                }
            }}
        >
            <DialogTitle sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 2
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {isEdit ? 'Editar Rol de Colaborador' : 'Crear Rol de Colaborador'}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 3, mt: 2 }}>
                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                        {errorMessage}
                    </Alert>
                )}

                <form id="rol-colaborador-form" onSubmit={(e) => {
                    e.stopPropagation();
                    handleSubmit(onSubmit)(e);
                }} noValidate>
                    <Grid container spacing={2}>
                        <Grid size={{xs:12}}>
                            <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                Nombre del Rol
                            </Typography>
                            <TextField
                                placeholder="ej: Conductor"
                                fullWidth
                                {...register('nombre')}
                                onKeyDown={handleLettersOnlyKeyDown}
                                error={!!errors.nombre}
                                helperText={errors.nombre?.message}
                                disabled={isEdit}
                                InputProps={{
                                    sx: { borderRadius: 2 }
                                }}
                            />
                        </Grid>
                        <Grid size={{xs:12}}>
                            <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                Descripción
                            </Typography>
                            <TextField
                                placeholder="Descripción breve..."
                                fullWidth
                                multiline
                                rows={3}
                                {...register('descripcion')}
                                error={!!errors.descripcion}
                                helperText={errors.descripcion?.message}
                                InputProps={{
                                    sx: { borderRadius: 2 }
                                }}
                            />
                        </Grid>
                        <Grid size={{xs:12}}>
                            <Controller
                                name="activo"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                            />
                                        }
                                        label={field.value ? "Activo" : "Inactivo"}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    Cancelar
                </Button>
                <Button 
                    type="submit"
                    form="rol-colaborador-form"
                    variant="contained"
                    disabled={mutation.isPending || isSubmitting}
                    sx={{ 
                        borderRadius: 2, 
                        textTransform: 'none', 
                        fontWeight: 600,
                        px: 4
                    }}
                >
                    {mutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
