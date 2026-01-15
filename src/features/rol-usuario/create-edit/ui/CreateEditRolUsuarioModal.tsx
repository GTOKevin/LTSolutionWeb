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
import { rolUsuarioApi } from '@entities/rol-usuario/api/rol-usuario.api';
import { rolUsuarioSchema, type RolUsuarioSchema } from '../../model/schema';
import { useEffect, useState } from 'react';
import type { RolUsuario } from '@entities/rol-usuario/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { handleLettersOnlyKeyDown } from '@shared/utils/input-validators';

interface CreateEditRolUsuarioModalProps {
    open: boolean;
    onClose: () => void;
    rolToEdit?: RolUsuario | null;
    onSuccess: (id: number) => void;
}

export function CreateEditRolUsuarioModal({ open, onClose, rolToEdit, onSuccess }: CreateEditRolUsuarioModalProps) {
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
        resolver: zodResolver(rolUsuarioSchema),
        defaultValues: {
            nombre: '',
            descripcion: '',
            estado: true
        }
    });

    useEffect(() => {
        if (open) {
            setErrorMessage(null);
            if (rolToEdit) {
                reset({
                    nombre: rolToEdit.nombre,
                    descripcion: rolToEdit.descripcion || '',
                    estado: rolToEdit.estado
                });
            } else {
                reset({
                    nombre: '',
                    descripcion: '',
                    estado: true
                });
            }
        }
    }, [open, rolToEdit, reset]);

    const mutation = useMutation({
        mutationFn:async (data: RolUsuarioSchema) => {
            if (isEdit && rolToEdit) {
                await rolUsuarioApi.update(rolToEdit.rolUsuarioID, data);
                return rolToEdit.rolUsuarioID;
            }
            const response= await rolUsuarioApi.create(data);
            return response.data;
        },
        onSuccess: (id:number) => {
            queryClient.invalidateQueries({ queryKey: ['roles-usuario'] });
            onSuccess(id);
            onClose();
        },
        onError: (error: any) => {
            if (error?.response?.status === 409) {
                // Assuming backend sends a specific message or we default to a friendly one
                setErrorMessage('El nombre del rol ya se encuentra registrado.');
            } else {
                const genericError = handleBackendErrors<RolUsuarioSchema>(error, setError);
                if (genericError) {
                    setErrorMessage(genericError);
                }
            }
        }
    });

    const onSubmit = (data: RolUsuarioSchema) => {
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
                            {isEdit ? 'Editar Rol' : 'Crear Rol'}
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

                <form id="rol-form" onSubmit={(e) => {
                    e.stopPropagation();
                    handleSubmit(onSubmit)(e);
                }} noValidate>
                    <Grid container spacing={2}>
                        <Grid size={{xs: 12}}>
                            <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                Nombre del Rol
                            </Typography>
                            <TextField
                                placeholder="ej: Administrador"
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
                        <Grid size={{xs: 12}}>
                            <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                Descripción
                            </Typography>
                            <TextField
                                placeholder="Descripción breve de los permisos..."
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
                        <Grid size={{xs: 12}}>
                            <Controller
                                name="estado"
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
                    form="rol-form"
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
