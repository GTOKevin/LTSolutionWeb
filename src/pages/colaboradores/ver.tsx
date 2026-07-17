import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    MenuItem,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { colaboradorApi } from '@/entities/colaborador/api/colaborador.api';
import { useColaboradorForm } from '@/features/colaborador/hooks/useColaboradorForm';
import { COLABORADOR_QUERY_KEYS } from '@/features/colaborador/model/query-keys';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { LicenciaList } from '@/features/colaborador/licencias/ui/LicenciaList';
import { ColaboradorDocumentoList } from '@/features/colaborador/documentos/ui/ColaboradorDocumentoList';
import { ColaboradorPagoList } from '@/features/colaborador/pagos/ui/ColaboradorPagoList';
import { handleAddressKeyDown, handleLettersOnlyKeyDown, handleNumbersOnlyKeyDown } from '@/shared/utils/input-validators';

export function ColaboradorVerPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const params = useParams();

    const colaboradorId = Number(params.id);

    const { data: colaborador, isLoading, isError, refetch } = useQuery({
        queryKey: COLABORADOR_QUERY_KEYS.detail(colaboradorId),
        queryFn: () => colaboradorApi.getById(colaboradorId).then((r) => r.data),
        enabled: Number.isFinite(colaboradorId) && colaboradorId > 0
    });

    const {
        form: {
            register,
            handleSubmit,
            control,
            formState: { errors }
        },
        onSubmit,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        effectiveId,
        canEditDetails,
        roles,
        generos,
        monedas
    } = useColaboradorForm({
        colaboradorToEdit: colaborador ?? null,
        onSuccess: () => {},
        onClose: () => navigate('/app/colaboradores'),
        open: true
    });

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };
    const loadErrorMessage = isError ? 'No se pudo cargar el colaborador solicitado. Reintente la consulta o vuelva al listado.' : null;

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
                                    Detalle del Colaborador
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Gestión de información personal, licencias y documentos
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
                            {isLoading && (
                                <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
                                    <CircularProgress />
                                </Box>
                            )}

                            {!isLoading && (loadErrorMessage || (activeTab === 0 && errorMessage)) ? (
                                <Box sx={{ p: 3, pb: 0 }}>
                                    <Alert
                                        severity="error"
                                        onClose={() => setErrorMessage(null)}
                                        action={
                                            loadErrorMessage ? (
                                                <Button color="inherit" size="small" onClick={() => refetch()}>
                                                    Reintentar
                                                </Button>
                                            ) : undefined
                                        }
                                    >
                                        {loadErrorMessage ?? errorMessage}
                                    </Alert>
                                </Box>
                            ) : null}

                            {!isLoading && !loadErrorMessage && (
                                <>
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
                                                            disabled
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
                                                            disabled
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
                                                            disabled
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
                                                                    disabled
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
                                                            disabled
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
                                                            disabled
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <TextField
                                                            label="Email"
                                                            fullWidth
                                                            {...register('email')}
                                                            error={!!errors.email}
                                                            helperText={errors.email?.message}
                                                            disabled
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
                                                            disabled
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
                                                                    disabled
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
                                                            disabled
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
                                                                    disabled
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
                                                            disabled
                                                        />
                                                    </Grid>

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
                                                                            disabled
                                                                        />
                                                                    }
                                                                    label="Colaborador Activo"
                                                                />
                                                            )}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </form>
                                    </TabPanel>

                                    <TabPanel value={activeTab} index={1} name="colaborador">
                                        <Box sx={{ px: 3, py: 3 }}>
                                            {effectiveId ? (
                                                <LicenciaList colaboradorId={effectiveId} viewOnly />
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
                                                <ColaboradorDocumentoList colaboradorId={effectiveId} viewOnly />
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
                                                <ColaboradorPagoList colaboradorId={effectiveId} viewOnly />
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
                                        <Button
                                            onClick={() => navigate('/app/colaboradores')}
                                            color="inherit"
                                            variant="outlined"
                                        >
                                            Cerrar
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

        </>
    );
}
