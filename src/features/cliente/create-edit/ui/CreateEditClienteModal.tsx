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
    Tab,
    Alert,
    Snackbar
} from '@mui/material';
import { Controller } from 'react-hook-form';
import type { Cliente } from '@entities/cliente/model/types';
import { ClienteContactosList } from '../../contactos/ui/ClienteContactosModal';
import { useClienteForm } from '../../hooks/useClienteForm';

interface CreateEditClienteModalProps {
    open: boolean;
    onClose: () => void;
    clienteToEdit?: Cliente | null;
    onSuccess: (clienteId: number) => void;
    viewOnly?: boolean;
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

export function CreateEditClienteModal({ open, onClose, clienteToEdit, onSuccess, viewOnly = false }: CreateEditClienteModalProps) {
    const theme = useTheme();
    
    const {
        form,
        activeTab,
        errorMessage,
        openSnackbar,
        setErrorMessage,
        setOpenSnackbar,
        handleTabChange,
        onSubmit,
        isEdit,
        createdClientId,
        effectiveClienteId,
        canEditContacts,
        mutation
    } = useClienteForm({ open, onClose, onSuccess, clienteToEdit });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting, isDirty }
    } = form;

    return (
        <>
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, minHeight: '80vh' }
            }}
        >
            <DialogTitle component="div" sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                pb: 0
            }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {viewOnly ? 'Detalle del Cliente' : (isEdit || createdClientId ? 'Gestión de Cliente' : 'Nuevo Cliente')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {viewOnly ? 'Visualización de información del cliente' : (isEdit || createdClientId ? 'Administre la información y contactos del cliente' : 'Complete la información para registrar un nuevo cliente')}
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
                {activeTab === 0 && errorMessage && (
                     <Box sx={{ p: 3, pb: 0 }}>
                        <Alert severity="error" onClose={() => setErrorMessage(null)}>
                            {errorMessage}
                        </Alert>
                     </Box>
                )}
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
                                        disabled={viewOnly || isEdit || !!createdClientId}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Razón Social"
                                        fullWidth
                                        {...register('razonSocial')}
                                        error={!!errors.razonSocial}
                                        helperText={errors.razonSocial?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Dirección Legal"
                                        fullWidth
                                        {...register('direccionLegal')}
                                        error={!!errors.direccionLegal}
                                        helperText={errors.direccionLegal?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Dirección Fiscal"
                                        fullWidth
                                        {...register('direccionFiscal')}
                                        error={!!errors.direccionFiscal}
                                        helperText={errors.direccionFiscal?.message}
                                        disabled={viewOnly}
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
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Email Corporativo"
                                        fullWidth
                                        {...register('email')}
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        disabled={viewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Teléfono"
                                        fullWidth
                                        {...register('telefono')}
                                        error={!!errors.telefono}
                                        helperText={errors.telefono?.message}
                                        disabled={viewOnly}
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
                                                        disabled={viewOnly}
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
                        {effectiveClienteId && <ClienteContactosList clienteId={effectiveClienteId} viewOnly={viewOnly} />}
                    </Box>
                </CustomTabPanel>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={onClose} color="inherit">
                    {activeTab === 0 ? (viewOnly ? 'Cerrar' : 'Cancelar') : 'Cerrar'}
                </Button>
                {activeTab === 0 && !viewOnly && (
                    <Button 
                        type="submit" 
                        form="cliente-form"
                        variant="contained" 
                        disabled={isSubmitting || mutation.isPending || (isEdit && !isDirty)}
                    >
                        {isEdit || createdClientId ? 'Guardar Cambios' : 'Registrar y Continuar'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
        <Snackbar 
            open={openSnackbar} 
            autoHideDuration={6000} 
            onClose={() => setOpenSnackbar(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
                {errorMessage}
            </Alert>
        </Snackbar>
        </>
    );
}
