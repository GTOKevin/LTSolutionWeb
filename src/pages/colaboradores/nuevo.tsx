import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    MenuItem,
    Snackbar,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useColaboradorForm } from '@/features/colaborador/hooks/useColaboradorForm';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { LicenciaList } from '@/features/colaborador/licencias/ui/LicenciaList';
import { ColaboradorDocumentoList } from '@/features/colaborador/documentos/ui/ColaboradorDocumentoList';
import { ColaboradorPagoList } from '@/features/colaborador/pagos/ui/ColaboradorPagoList';
import { handleAddressKeyDown, handleLettersOnlyKeyDown, handleNumbersOnlyKeyDown } from '@/shared/utils/input-validators';

export function ColaboradorNuevoPage() {
    const theme = useTheme();
    const navigate = useNavigate();

    const {
        form: {
            register,
            handleSubmit,
            control,
            formState: { errors, isDirty }
        },
        isSubmitting,
        onSubmit,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        openSnackbar,
        setOpenSnackbar,
        effectiveId,
        canEditDetails,
        isEdit,
        createdId,
        roles,
        generos,
        monedas
    } = useColaboradorForm({
        colaboradorToEdit: null,
        onSuccess: () => {},
        onClose: () => navigate('/app/colaboradores'),
        open: true
    });

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const title = createdId ? 'Gestión de Colaborador' : 'Nuevo Colaborador';
    const subtitle = 'Gestión de información personal, licencias y documentos';

    return (
        <>
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

                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                textColor="primary"
                                indicatorColor="primary"
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab label="Datos Personales" />
                                <Tab label="Licencias" disabled={!canEditDetails} />
                                <Tab label="Documentos" disabled={!canEditDetails} />
                                <Tab label="Pagos" disabled={!canEditDetails} />
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

                            <TabPanel value={activeTab} index={0} name="colaborador">
                                <form id="colab-form" onSubmit={handleSubmit(onSubmit)}>
                                    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight="bold"
                                                    color="primary"
                                                    sx={{ mb: 1 }}
                                                >
                                                    Información Básica
                                                </Typography>
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    label="Nombres"
                                                    fullWidth
                                                    {...register('nombres')}
                                                    onKeyDown={handleLettersOnlyKeyDown}
                                                    error={!!errors.nombres}
                                                    helperText={errors.nombres?.message}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    label="Primer Apellido"
                                                    fullWidth
                                                    {...register('primerApellido')}
                                                    onKeyDown={handleLettersOnlyKeyDown}
                                                    error={!!errors.primerApellido}
                                                    helperText={errors.primerApellido?.message}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    label="Segundo Apellido"
                                                    fullWidth
                                                    {...register('segundoApellido')}
                                                    onKeyDown={handleLettersOnlyKeyDown}
                                                    error={!!errors.segundoApellido}
                                                    helperText={errors.segundoApellido?.message}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Controller
                                                    name="tipoGeneroID"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            select
                                                            label="Género"
                                                            fullWidth
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                            value={field.value || 0}
                                                            error={!!errors.tipoGeneroID}
                                                            helperText={errors.tipoGeneroID?.message}
                                                        >
                                                            <MenuItem value={0} disabled>
                                                                Seleccione
                                                            </MenuItem>
                                                            {generos?.data?.map((g) => (
                                                                <MenuItem key={g.id} value={g.id}>
                                                                    {g.text}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    )}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    label="Fecha Nacimiento"
                                                    type="date"
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    {...register('fechaNacimiento')}
                                                    error={!!errors.fechaNacimiento}
                                                    helperText={errors.fechaNacimiento?.message}
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12 }}>
                                                <Divider sx={{ my: 1 }} />
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight="bold"
                                                    color="primary"
                                                    sx={{ mb: 1, mt: 1 }}
                                                >
                                                    Contacto y Dirección
                                                </Typography>
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    label="Teléfono"
                                                    fullWidth
                                                    {...register('telefono')}
                                                    onKeyDown={handleNumbersOnlyKeyDown}
                                                    error={!!errors.telefono}
                                                    helperText={errors.telefono?.message}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    label="Email"
                                                    fullWidth
                                                    {...register('email')}
                                                    error={!!errors.email}
                                                    helperText={errors.email?.message}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    label="Dirección"
                                                    fullWidth
                                                    {...register('direccion')}
                                                    onKeyDown={handleAddressKeyDown}
                                                    error={!!errors.direccion}
                                                    helperText={errors.direccion?.message}
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12 }}>
                                                <Divider sx={{ my: 1 }} />
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight="bold"
                                                    color="primary"
                                                    sx={{ mb: 1, mt: 1 }}
                                                >
                                                    Datos Laborales
                                                </Typography>
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Controller
                                                    name="rolColaboradorID"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            select
                                                            label="Rol / Cargo"
                                                            fullWidth
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                            value={field.value || 0}
                                                            error={!!errors.rolColaboradorID}
                                                            helperText={errors.rolColaboradorID?.message}
                                                        >
                                                            <MenuItem value={0} disabled>
                                                                Seleccione
                                                            </MenuItem>
                                                            {roles?.data?.map((r) => (
                                                                <MenuItem key={r.id} value={r.id}>
                                                                    {r.text}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    )}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    label="Fecha Ingreso"
                                                    type="date"
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    {...register('fechaIngreso')}
                                                    error={!!errors.fechaIngreso}
                                                    helperText={errors.fechaIngreso?.message}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Controller
                                                    name="monedaID"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            select
                                                            label="Moneda Pago"
                                                            fullWidth
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                            value={field.value || 0}
                                                            error={!!errors.monedaID}
                                                            helperText={errors.monedaID?.message}
                                                        >
                                                            <MenuItem value={0} disabled>
                                                                Seleccione
                                                            </MenuItem>
                                                            {monedas?.data?.map((r) => (
                                                                <MenuItem key={r.id} value={r.id}>
                                                                    {r.text}
                                                                </MenuItem>
                                                            ))}
                                                        </TextField>
                                                    )}
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    label="Salario Base"
                                                    type="number"
                                                    fullWidth
                                                    {...register('salario', { valueAsNumber: true })}
                                                />
                                            </Grid>

                                            {isEdit && (
                                                <Grid size={{ xs: 12 }} display="flex" alignItems="center">
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
                                                                label="Colaborador Activo"
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                </form>
                            </TabPanel>

                            <TabPanel value={activeTab} index={1} name="colaborador">
                                <Box sx={{ px: 3, py: 3 }}>
                                    {effectiveId ? (
                                        <LicenciaList colaboradorId={effectiveId} viewOnly={false} />
                                    ) : (
                                        <Box p={3} textAlign="center" color="text.secondary">
                                            Guarde el colaborador para agregar licencias
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>

                            <TabPanel value={activeTab} index={2} name="colaborador">
                                <Box sx={{ px: 3, py: 3 }}>
                                    {effectiveId ? (
                                        <ColaboradorDocumentoList colaboradorId={effectiveId} viewOnly={false} />
                                    ) : (
                                        <Box p={3} textAlign="center" color="text.secondary">
                                            Guarde el colaborador para agregar documentos
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>

                            <TabPanel value={activeTab} index={3} name="colaborador">
                                <Box sx={{ px: 3, py: 3 }}>
                                    {effectiveId ? (
                                        <ColaboradorPagoList colaboradorId={effectiveId} viewOnly={false} />
                                    ) : (
                                        <Box p={3} textAlign="center" color="text.secondary">
                                            Guarde el colaborador para agregar pagos
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>

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
                                <Button onClick={() => navigate('/app/colaboradores')} color="inherit" variant="outlined">
                                    {activeTab === 0 ? 'Cancelar' : 'Cerrar'}
                                </Button>
                                {activeTab === 0 && (
                                    <Button
                                        type="submit"
                                        form="colab-form"
                                        variant="contained"
                                        disabled={isSubmitting || (isEdit && !isDirty)}
                                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                                    >
                                        {isEdit || createdId ? 'Guardar Cambios' : 'Registrar'}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

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

