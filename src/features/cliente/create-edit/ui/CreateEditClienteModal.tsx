import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControlLabel,
    Switch,
    Typography,
    Divider,
    Box,
    useTheme,
    alpha,
    Tabs,
    Tab
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import { createClienteSchema } from '../../model/schema';
import type { CreateClienteSchema } from '../../model/schema';
import { useEffect, useState } from 'react';
import type { Cliente } from '@entities/cliente/model/types';
import { ClienteContactosList } from '../../contactos/ui/ClienteContactosModal';

interface CreateEditClienteModalProps {
    open: boolean;
    onClose: () => void;
    clienteToEdit?: Cliente | null;
    onSuccess: (clienteId: number) => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`cliente-tabpanel-${index}`}
            aria-labelledby={`cliente-tab-${index}`}
            {...other}
            style={{ height: '100%' }}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export function CreateEditClienteModal({ open, onClose, clienteToEdit, onSuccess }: CreateEditClienteModalProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(0);
    const [createdClientId, setCreatedClientId] = useState<number | null>(null);
    
    const isEdit = !!clienteToEdit;
    const effectiveClienteId = clienteToEdit?.clienteID || createdClientId;
    const canEditContacts = !!effectiveClienteId;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<CreateClienteSchema>({
        resolver: zodResolver(createClienteSchema),
        defaultValues: {
            activo: true
        }
    });

    useEffect(() => {
        if (open) {
            setActiveTab(0);
            setCreatedClientId(null);
            if (clienteToEdit) {
                reset({
                    ruc: clienteToEdit.ruc,
                    razonSocial: clienteToEdit.razonSocial,
                    direccionLegal: clienteToEdit.direccionLegal || '',
                    direccionFiscal: clienteToEdit.direccionFiscal || '',
                    contactoPrincipal: clienteToEdit.contactoPrincipal,
                    telefono: clienteToEdit.telefono || '',
                    email: clienteToEdit.email || '',
                    activo: clienteToEdit.activo
                });
            } else {
                reset({
                    ruc: '',
                    razonSocial: '',
                    direccionLegal: '',
                    direccionFiscal: '',
                    contactoPrincipal: '',
                    telefono: '',
                    email: '',
                    activo: true
                });
            }
        }
    }, [open, clienteToEdit, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateClienteSchema) => {
            if (isEdit && clienteToEdit) {
                return clienteApi.update(clienteToEdit.clienteID, data).then(() => clienteToEdit.clienteID);
            }
            // If we have a createdClientId, we are effectively editing it, but the prop isEdit is false.
            // However, the form submits to this mutation.
            // If we already created it (createdClientId exists) and user clicks save again on tab 0, 
            // we should probably update it.
            if (createdClientId) {
                return clienteApi.update(createdClientId, data).then(() => createdClientId);
            }
            return clienteApi.create(data);
        },
        onSuccess: (id) => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            onSuccess(id);
            
            if (!isEdit && !createdClientId) {
                // First time creation
                setCreatedClientId(id);
                // Enable contacts tab and switch to it? Or just enable?
                // User requirement: "una vez creado el cliente, se debe habilitar el submenu de Contactos"
                // Let's switch to it to show progress.
                setActiveTab(1); 
            } else {
                // Edit mode or subsequent save
                onClose();
            }
        }
    });

    const onSubmit = (data: CreateClienteSchema) => {
        mutation.mutate(data);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, minHeight: '80vh' }
            }}
        >
            <DialogTitle sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                pb: 0
            }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {isEdit || createdClientId ? 'Gestión de Cliente' : 'Nuevo Cliente'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {isEdit || createdClientId ? 'Administre la información y contactos del cliente' : 'Complete la información para registrar un nuevo cliente'}
                    </Typography>
                </Box>
                
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="Datos Generales" />
                    <Tab label="Contactos" disabled={!canEditContacts} />
                </Tabs>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
                <CustomTabPanel value={activeTab} index={0}>
                    <form id="cliente-form" onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ px: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={12}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                        Datos Generales
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="RUC"
                                        fullWidth
                                        {...register('ruc')}
                                        error={!!errors.ruc}
                                        helperText={errors.ruc?.message}
                                        disabled={isEdit || !!createdClientId}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Razón Social"
                                        fullWidth
                                        {...register('razonSocial')}
                                        error={!!errors.razonSocial}
                                        helperText={errors.razonSocial?.message}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Dirección Legal"
                                        fullWidth
                                        {...register('direccionLegal')}
                                        error={!!errors.direccionLegal}
                                        helperText={errors.direccionLegal?.message}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Dirección Fiscal"
                                        fullWidth
                                        {...register('direccionFiscal')}
                                        error={!!errors.direccionFiscal}
                                        helperText={errors.direccionFiscal?.message}
                                    />
                                </Grid>

                                <Grid size={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, mt: 1 }}>
                                        Información de Contacto
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Contacto Principal (Nombre)"
                                        fullWidth
                                        {...register('contactoPrincipal')}
                                        error={!!errors.contactoPrincipal}
                                        helperText={errors.contactoPrincipal?.message}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Email Corporativo"
                                        fullWidth
                                        {...register('email')}
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Teléfono"
                                        fullWidth
                                        {...register('telefono')}
                                        error={!!errors.telefono}
                                        helperText={errors.telefono?.message}
                                    />
                                </Grid>
                                {isEdit && (
                                <Grid size={{ xs: 12, md: 6 }} display="flex" alignItems="center">
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
                                                label="Cliente Activo"
                                            />
                                        )}
                                    />
                                </Grid>
                                )}
                            </Grid>
                        </Box>
                    </form>
                </CustomTabPanel>

                <CustomTabPanel value={activeTab} index={1}>
                    <Box sx={{ px: 3, height: '100%' }}>
                        {effectiveClienteId && <ClienteContactosList clienteId={effectiveClienteId} />}
                    </Box>
                </CustomTabPanel>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={onClose} color="inherit">
                    {activeTab === 0 ? 'Cancelar' : 'Cerrar'}
                </Button>
                {activeTab === 0 && (
                    <Button 
                        type="submit" 
                        form="cliente-form"
                        variant="contained" 
                        disabled={isSubmitting || mutation.isPending}
                    >
                        {isEdit || createdClientId ? 'Guardar Cambios' : 'Registrar y Continuar'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
