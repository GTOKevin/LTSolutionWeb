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
    DialogActions,
    Tabs,
    Tab
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rolUsuarioSchema, type RolUsuarioSchema } from '../../model/schema';
import { useEffect, useState } from 'react';
import type { RolUsuario } from '@entities/rol-usuario/model/types';
import { handleBackendErrors } from '@shared/utils/form-validation';
import { handleLettersOnlyKeyDown } from '@shared/utils/input-validators';
import { useCreateRolUsuario, useUpdateRolUsuario } from '../../hooks/useRolUsuarioCrud';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { PermisosMatrix } from './PermisosMatrix';

interface CreateEditRolUsuarioModalProps {
    open: boolean;
    onClose: () => void;
    rolToEdit?: RolUsuario | null;
    onSuccess: (id?: number) => void;
    viewOnly?: boolean;
}

export function CreateEditRolUsuarioModal({ open, onClose, rolToEdit, onSuccess, viewOnly = false }: CreateEditRolUsuarioModalProps) {
    const theme = useTheme();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    
    const isEdit = !!rolToEdit;

    const {
        register,
        handleSubmit,
        reset,
        setError,
        control,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(rolUsuarioSchema),
        defaultValues: {
            nombre: '',
            descripcion: '',
            estado: true,
            permisosIds: []
        }
    });

    const createMutation = useCreateRolUsuario();
    const updateMutation = useUpdateRolUsuario();

    useEffect(() => {
        if (open) {
            if (rolToEdit) {
                reset({
                    nombre: rolToEdit.nombre,
                    descripcion: rolToEdit.descripcion || '',
                    estado: rolToEdit.estado,
                    permisosIds: rolToEdit.permisosIds || []
                });
            } else {
                reset({
                    nombre: '',
                    descripcion: '',
                    estado: true,
                    permisosIds: []
                });
            }

            const resetUiTimer = window.setTimeout(() => {
                setErrorMessage(null);
                setActiveTab(0);
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [open, rolToEdit, reset]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const onSubmit = (data: RolUsuarioSchema) => {
        if (isEdit && rolToEdit) {
            updateMutation.mutate(
                { id: rolToEdit.rolUsuarioID, data },
                {
                    onSuccess: () => {
                        onSuccess();
                        onClose();
                    },
                    onError: (error: unknown) => {
                        const genericError = handleBackendErrors<RolUsuarioSchema>(error, setError);
                        if (genericError) {
                            setErrorMessage(genericError);
                        }
                    }
                }
            );
        } else {
            createMutation.mutate(
                data,
                {
                    onSuccess: () => {
                        onSuccess();
                        onClose();
                    },
                    onError: (error: unknown) => {
                        const genericError = handleBackendErrors<RolUsuarioSchema>(error, setError);
                        if (genericError) {
                            setErrorMessage(genericError);
                        }
                    }
                }
            );
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
                pb: 0
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {viewOnly ? 'Detalle de Rol' : isEdit ? 'Editar Rol' : 'Crear Rol'}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                    <Tab label="Datos Generales" />
                    <Tab label="Permisos" />
                </Tabs>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0, minHeight: '300px' }}>
                {errorMessage && (
                    <Box sx={{ p: 2, pb: 0 }}>
                        <Alert severity="error" onClose={() => setErrorMessage(null)}>
                            {errorMessage}
                        </Alert>
                    </Box>
                )}

                <form id="rol-form" onSubmit={(e) => {
                    e.stopPropagation();
                    handleSubmit(onSubmit)(e);
                }} noValidate>
                    <TabPanel value={activeTab} index={0} name="rol-info">
                        <Box sx={{ p: 3 }}>
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
                                        disabled={isEdit || viewOnly}
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
                                        disabled={viewOnly}
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
                                                        disabled={viewOnly}
                                                    />
                                                }
                                                label={field.value ? "Activo" : "Inactivo"}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </TabPanel>
                    
                    <TabPanel value={activeTab} index={1} name="rol-permisos">
                        <Box sx={{ p: 3 }}>
                            <Controller
                                name="permisosIds"
                                control={control}
                                render={({ field }) => (
                                    <PermisosMatrix 
                                        rolId={rolToEdit?.rolUsuarioID}
                                        selectedIds={field.value || []}
                                        onChange={field.onChange}
                                        disabled={viewOnly}
                                    />
                                )}
                            />
                        </Box>
                    </TabPanel>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    {viewOnly ? 'Cerrar' : 'Cancelar'}
                </Button>
                {!viewOnly ? (
                    <Button 
                        type="submit"
                        form="rol-form"
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{ 
                            borderRadius: 2, 
                            textTransform: 'none', 
                            fontWeight: 600,
                            px: 4
                        }}
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                ) : null}
            </DialogActions>
        </Dialog>
    );
}
