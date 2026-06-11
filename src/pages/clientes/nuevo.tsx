import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Grid,
    Tab,
    Tabs,
    TextField,
    Typography,
    alpha,
    useTheme,
    Divider,
    FormControlLabel,
    Switch
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { useClienteForm } from '@/features/cliente/hooks/useClienteForm';
import { ClienteContactosList } from '@/features/cliente/contactos/ui/ClienteContactosModal';
import { handleLettersOnlyKeyDown, handleNumbersOnlyKeyDown } from '@shared/utils/input-validators';

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

export function ClienteNuevoPage() {
    const theme = useTheme();
    const navigate = useNavigate();

    const {
        form,
        activeTab,
        errorMessage,
        setErrorMessage,
        handleTabChange,
        onSubmit,
        isEdit,
        createdClientId,
        effectiveClienteId,
        canEditContacts,
        isSubmitting
    } = useClienteForm({
        open: true,
        onClose: () => navigate('/app/clientes'),
        onSuccess: () => {},
        clienteToEdit: null
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty }
    } = form;

    const title = createdClientId ? 'Gestión de Cliente' : 'Nuevo Cliente';
    const subtitle = createdClientId ? 'Administre la información y contactos del cliente' : 'Complete la información para registrar un nuevo cliente';

    return (
        <Box
            sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: theme.palette.mode === 'dark' ? '#101922' : '#f6f7f8',
                p: { xs: 2, md: 3 },
                position: 'relative',
                pb: { xs: 10, md: 3 }
            }}
        >
            <Box
                sx={{
                    maxWidth: 1600,
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 2, md: 3 }
                }}
            >
                <Box
                    sx={{
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            px: 3,
                            pt: 2,
                            pb: 0
                        }}
                    >
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {subtitle}
                            </Typography>
                        </Box>

                        <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                            <Tab label="Datos Generales" />
                            <Tab label="Contactos" disabled={!canEditContacts} />
                        </Tabs>
                    </Box>

                    <Box sx={{ p: 0 }}>
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
                                                onKeyDown={handleLettersOnlyKeyDown}
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
                                                onKeyDown={handleNumbersOnlyKeyDown}
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
                                {effectiveClienteId && <ClienteContactosList clienteId={effectiveClienteId} viewOnly={false} />}
                            </Box>
                        </CustomTabPanel>

                        <Box
                            sx={{
                                p: 3,
                                borderTop: `1px solid ${theme.palette.divider}`,
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 2
                            }}
                        >
                            <Button
                                onClick={() => navigate('/app/clientes')}
                                variant="outlined"
                                color="inherit"
                                disabled={isSubmitting}
                            >
                                {activeTab === 1 ? 'Cerrar' : 'Cancelar'}
                            </Button>

                            {activeTab === 0 && (
                                <Button
                                    type="submit"
                                    form="cliente-form"
                                    variant="contained"
                                    disabled={isSubmitting || (isEdit && !isDirty)}
                                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                                >
                                    {isEdit || createdClientId ? 'Guardar Cambios' : 'Registrar y Continuar'}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
