import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Box,
    useTheme,
    alpha,
    MenuItem,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { usuarioApi } from '@entities/usuario/api/usuario.api';
import { rolUsuarioApi } from '@entities/rol-usuario/api/rol-usuario.api';
import { estadoApi } from '@shared/api/estado.api';
import { colaboradorApi } from '@entities/colaborador/api/colaborador.api';
import { createUsuarioSchemaFull, editUsuarioSchemaFull, type CreateUsuarioSchema, type UsuarioFormSchema } from '../../model/schema';
import { useEffect, useState } from 'react';
import type { Usuario } from '@entities/usuario/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { Visibility, VisibilityOff, LockReset, Info, Close as CloseIcon } from '@mui/icons-material';
import { handleNoSpacesKeyDown } from '@shared/utils/input-validators';

interface CreateEditUsuarioModalProps {
    open: boolean;
    onClose: () => void;
    usuarioToEdit?: Usuario | null;
    onSuccess: (id: number) => void;
    viewOnly?: boolean;
}

export function CreateEditUsuarioModal({ open, onClose, usuarioToEdit, onSuccess, viewOnly = false }: CreateEditUsuarioModalProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    
    const isEdit = !!usuarioToEdit;

    // Queries for Selects
    const { data: roles } = useQuery({
        queryKey: ['roles-usuario-select'],
        queryFn: () => rolUsuarioApi.getSelect(),
        enabled: open
    });

    const { data: estados } = useQuery({
        queryKey: ['estados-usuario-select'],
        queryFn: () => estadoApi.getSelect(),
        enabled: open
    });

    const { data: colaboradores } = useQuery({
        queryKey: ['colaboradores-select-available', usuarioToEdit?.colaboradorID],
        queryFn: () => colaboradorApi.getSelectAvailable(usuarioToEdit?.colaboradorID),
        enabled: open
    });

    const listaRoles = roles?.data || [];
    const listaEstados = estados?.data || [];
    const listaColaboradores = colaboradores?.data || [];

    const {
        register,
        handleSubmit,
        reset,
        setError,
        setValue,
        control,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(isEdit ? editUsuarioSchemaFull : createUsuarioSchemaFull),
        defaultValues: {
            estadoID: 1, // Default active
            rolUsuarioID: 0,
            colaboradorID: 0
        }
    });

    useEffect(() => {
        if (open) {
            setErrorMessage(null);
            setShowPassword(false);
            if (usuarioToEdit) {
                reset({
                    nombre: usuarioToEdit.nombre,
                    email: usuarioToEdit.email || '',
                    rolUsuarioID: usuarioToEdit.rolUsuarioID,
                    estadoID: usuarioToEdit.estadoID,
                    colaboradorID: usuarioToEdit.colaboradorID || 0,
                    clave: '' // Password not populated on edit
                });
            } else {
                reset({
                    nombre: '',
                    email: '',
                    rolUsuarioID: 0,
                    estadoID: 1, // Default Activo
                    colaboradorID: 0,
                    clave: ''
                });
            }
        }
    }, [open, usuarioToEdit, reset]);

    const mutation = useMutation({
        mutationFn: async (data: UsuarioFormSchema) => {
            if (isEdit && usuarioToEdit) {
                const updateData = {
                    ...data,
                    clave: data.clave || ''
                };
                await usuarioApi.update(usuarioToEdit.usuarioID, updateData as any);
                return usuarioToEdit.usuarioID;
            }
            const response= await usuarioApi.create(data as any);
            return response;
        },
        onSuccess: (id) => {
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
            onSuccess(id);
            onClose();
        },
        onError: (error: any) => {
            const genericError = handleBackendErrors<CreateUsuarioSchema>(error, setError);
            if (genericError) {
                setErrorMessage(genericError);
            }
        }
    });

    const onSubmit = (data: UsuarioFormSchema) => {
        mutation.mutate(data);
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const generateSecurePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let pass = "";
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setValue('clave', pass);
        setShowPassword(true);
    };

    // Helper component for Section Header
    const SectionHeader = ({ number, title }: { number: string, title: string }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
            }}>
                {number}
            </Box>
            <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
                {title}
            </Typography>
        </Box>
    );

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
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
                            {viewOnly ? 'Detalle del Usuario' : (isEdit ? 'Crear / Editar Usuario' : 'Crear / Editar Usuario')}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 3, mt:3,mb:3}}>
                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                        {errorMessage}
                    </Alert>
                )}

                <form id="usuario-form" onSubmit={(e) => {
                    e.stopPropagation();
                    handleSubmit(onSubmit)(e);
                }} noValidate>
                    
                    {/* Section 1: Credenciales */}
                    <Box sx={{ mb: 4 }}>
                        <SectionHeader number="1" title="Credenciales" />
                        <Grid container spacing={2}>
                            <Grid size={{xs:12,md:6}}>
                                <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                    Nombre de Usuario
                                </Typography>
                                <TextField
                                    placeholder="ej: jdoe_logistica"
                                    fullWidth
                                    {...register('nombre')}
                                    onKeyDown={handleNoSpacesKeyDown}
                                    error={!!errors.nombre}
                                    helperText={errors.nombre?.message}
                                    disabled={viewOnly}
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>
                            <Grid size={{xs:12,md:6}}>
                                <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                    Email Corporativo
                                </Typography>
                                <TextField
                                    placeholder="usuario@logisegura.com"
                                    fullWidth
                                    {...register('email')}
                                    onKeyDown={handleNoSpacesKeyDown}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    disabled={viewOnly}
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>
                            {!isEdit && (
                                <Grid size={{xs:12}}>
                                    <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                        Contraseña
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Box sx={{ flex: 1, position: 'relative' }}>
                                            <TextField
                                                type={showPassword ? 'text' : 'password'}
                                                fullWidth
                                                placeholder="••••••••"
                                                {...register('clave')}
                                                onKeyDown={handleNoSpacesKeyDown}
                                                error={!!errors.clave}
                                                helperText={errors.clave?.message}
                                                disabled={viewOnly}
                                                InputProps={{
                                                    sx: { borderRadius: 2 },
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleTogglePasswordVisibility}
                                                                edge="end"
                                                            >
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Box>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={generateSecurePassword}
                                            startIcon={<LockReset />}
                                            disabled={viewOnly}
                                            sx={{ 
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: theme.palette.primary.main,
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap',
                                                px: 2,
                                                borderRadius: 2
                                            }}
                                        >
                                            Generar Segura
                                        </Button>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Box>

                    {/* Section 2: Permisos */}
                    <Box sx={{ mb: 4 }}>
                        <SectionHeader number="2" title="Permisos y Estado" />
                        <Grid container spacing={3} alignItems="flex-end">
                            <Grid size={{xs:12,md:6}}>
                                <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                    Rol del Usuario
                                </Typography>
                                <Controller
                                    name="rolUsuarioID"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            fullWidth
                                            error={!!errors.rolUsuarioID}
                                            helperText={errors.rolUsuarioID?.message}
                                            disabled={viewOnly}
                                            InputProps={{
                                                sx: { borderRadius: 2 }
                                            }}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        >
                                            <MenuItem value={0} disabled>Seleccione un rol</MenuItem>
                                            {listaRoles.map((role) => (
                                                <MenuItem key={role.id} value={role.id}>
                                                    {role.text}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid size={{xs:12,md:6}}>
                                <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                    Estado de la cuenta
                                </Typography>
                                <Controller
                                    name="estadoID"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            fullWidth
                                            error={!!errors.estadoID}
                                            helperText={errors.estadoID?.message}
                                            disabled={viewOnly}
                                            InputProps={{
                                                sx: { borderRadius: 2 }
                                            }}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        >
                                            <MenuItem value={0} disabled>Seleccione un estado</MenuItem>
                                            {listaEstados.map((estado) => (
                                                <MenuItem key={estado.id} value={estado.id}>
                                                    {estado.text}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Section 3: Vinculación */}
                    <Box>
                        <SectionHeader number="3" title="Vinculación de Personal" />
                        <Grid container spacing={2}>
                            <Grid size={{xs:12}}>
                                <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                    Vincular a Colaborador (ID)
                                </Typography>
                                <Controller
                                    name="colaboradorID"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            fullWidth
                                            error={!!errors.colaboradorID}
                                            helperText={errors.colaboradorID?.message}
                                            disabled={viewOnly || (isEdit && !!usuarioToEdit?.colaboradorID)}
                                            InputProps={{
                                                sx: { borderRadius: 2 }
                                            }}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        >
                                            <MenuItem value={0}>Ninguno</MenuItem>
                                            {listaColaboradores.map((colab) => (
                                                <MenuItem key={colab.id} value={colab.id}>
                                                    {colab.text}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid size={{xs:12}}>
                                <Alert 
                                    icon={<Info fontSize="inherit" />} 
                                    severity="info"
                                    sx={{ 
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.info.main, 0.1),
                                        color: theme.palette.info.dark,
                                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                                    }}
                                >
                                    <strong>Nota importante:</strong> Al vincular, el usuario heredará automáticamente los permisos y datos del colaborador seleccionado.
                                </Alert>
                            </Grid>
                        </Grid>
                    </Box>
                </form>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.5), borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button 
                    onClick={onClose} 
                    disabled={isSubmitting}
                    sx={{ 
                        color: 'text.primary',
                        fontWeight: 'bold',
                        px: 3
                    }}
                >
                    Cancelar
                </Button>
                {!viewOnly && (
                    <Button 
                        type="submit" 
                        form="usuario-form" 
                        variant="contained" 
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <span className="material-symbols-outlined" style={{ fontSize: 18 }}></span>}
                        sx={{ 
                            px: 4, 
                            fontWeight: 'bold', 
                            boxShadow: 'none',
                            borderRadius: 2
                        }}
                    >
                        Guardar Usuario
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
