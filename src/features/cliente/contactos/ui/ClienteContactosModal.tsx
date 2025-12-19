import {
    Button,
    TextField,
    Grid,
    FormControlLabel,
    Switch,
    Typography,
    Box,
    useTheme,
    alpha,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import { createContactoSchema } from '../../model/schema';
import type { CreateContactoSchema } from '../../model/schema';
import { useState } from 'react';
import type { ClienteContacto } from '@entities/cliente/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';

interface ClienteContactosListProps {
    clienteId: number;
    viewOnly?: boolean;
}

export function ClienteContactosList({ clienteId, viewOnly = false }: ClienteContactosListProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const { data: data, isLoading } = useQuery({
        queryKey: ['cliente-contactos', clienteId],
        queryFn: () => clienteApi.getContactos(clienteId, undefined, undefined, 1, 100),
        enabled: !!clienteId
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        setError,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<CreateContactoSchema>({
        resolver: zodResolver(createContactoSchema),
        defaultValues: {
            activo: true
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateContactoSchema) => 
            clienteApi.addContacto(clienteId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cliente-contactos', clienteId] });
            resetForm();
        },
        onError: (error: any) => {
            const genericError = handleBackendErrors<CreateContactoSchema>(error, setError);
            if (genericError) {
                setErrorMessage(genericError);
                setOpenSnackbar(true);
            }
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreateContactoSchema) => 
            editingId ? clienteApi.updateContacto(editingId, data) : Promise.reject('No ID'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cliente-contactos', clienteId] });
            resetForm();
        },
        onError: (error: any) => {
            const genericError = handleBackendErrors<CreateContactoSchema>(error, setError);
            if (genericError) {
                setErrorMessage(genericError);
                setOpenSnackbar(true);
            }
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => clienteApi.removeContacto(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cliente-contactos', clienteId] });
        },
        onError: (error: any) => {
            setErrorMessage('Error al eliminar el contacto');
            setOpenSnackbar(true);
        }
    });

    const resetForm = () => {
        reset({
            nombreCompleto: '',
            email: '',
            telefonoPrincipal: '',
            telefonoSecundario: '',
            rol: '',
            activo: true
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (contacto: ClienteContacto) => {
        setEditingId(contacto.clienteContactoID);
        setValue('nombreCompleto', contacto.nombreCompleto);
        setValue('email', contacto.email || '');
        setValue('telefonoPrincipal', contacto.telefonoPrincipal);
        setValue('telefonoSecundario', contacto.telefonoSecundario || '');
        setValue('rol', contacto.rol || '');
        setValue('activo', contacto.activo);
        setShowForm(true);
    };

    const onSubmit = (data: CreateContactoSchema) => {
        if (editingId) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
            }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Lista de Contactos
                </Typography>
                {!showForm && !viewOnly && (
                    <Button 
                        startIcon={<AddIcon />} 
                        variant="contained" 
                        size="small"
                        onClick={() => setShowForm(true)}
                    >
                        Agregar
                    </Button>
                )}
            </Box>
            
            {showForm ? (
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                        {editingId ? 'Editar Contacto' : 'Nuevo Contacto'}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Nombre Completo"
                                fullWidth
                                size="small"
                                {...register('nombreCompleto')}
                                error={!!errors.nombreCompleto}
                                helperText={errors.nombreCompleto?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Rol / Cargo"
                                fullWidth
                                size="small"
                                {...register('rol')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Teléfono Principal"
                                fullWidth
                                size="small"
                                {...register('telefonoPrincipal')}
                                error={!!errors.telefonoPrincipal}
                                helperText={errors.telefonoPrincipal?.message}
                            />
                        </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Teléfono Secundario"
                                fullWidth
                                size="small"
                                {...register('telefonoSecundario')}
                                error={!!errors.telefonoSecundario}
                                helperText={errors.telefonoSecundario?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12}}>
                            <TextField
                                label="Email"
                                fullWidth
                                size="small"
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                        </Grid>
                        {editingId && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="activo"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                color="success"
                                            />
                                        }
                                        label="Contacto Activo"
                                    />
                                )}
                            />
                        </Grid>)}
                        <Grid size={{ xs: 12}} display="flex" justifyContent="flex-end" gap={1}>
                            <Button onClick={resetForm} color="inherit">
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained"
                                disabled={isSubmitting || createMutation.isPending || updateMutation.isPending || (!!editingId && !isDirty)}
                            >
                                Guardar
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            ) : (
                <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                    {isLoading ? (
                        <Box p={3} textAlign="center">Cargando contactos...</Box>
                    ) : data?.data.items?.length === 0 ? (
                        <Box p={5} textAlign="center" color="text.secondary">
                            No hay contactos registrados.
                        </Box>
                    ) : (
                        data?.data.items?.map((contacto) => (
                            <ListItem 
                                key={contacto.clienteContactoID}
                                divider
                                sx={{ 
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                }}
                            >
                                <Box mr={2} color="text.secondary">
                                    <PersonIcon />
                                </Box>
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="subtitle2">
                                                {contacto.nombreCompleto}
                                            </Typography>
                                            {contacto.rol && (
                                                <Chip label={contacto.rol} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                                            )}
                                            {!contacto.activo && (
                                                <Chip label="Inactivo" size="small" color="error" sx={{ height: 20, fontSize: 10 }} />
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            {contacto.telefonoPrincipal} • {contacto.email || 'Sin email'}
                                        </Typography>
                                    }
                                />
                                {!viewOnly && (
                                    <ListItemSecondaryAction>
                                        <Box display="flex" gap={0.5}>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleEdit(contacto)}
                                                sx={{ 
                                                    color: 'text.secondary',
                                                    '&:hover': { color: 'primary.main' }
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                onClick={() => deleteMutation.mutate(contacto.clienteContactoID)}
                                                sx={{ 
                                                    color: 'text.secondary',
                                                    '&:hover': { color: 'error.main' }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </ListItemSecondaryAction>
                                )}
                            </ListItem>
                        ))
                    )}
                </List>
            )}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
