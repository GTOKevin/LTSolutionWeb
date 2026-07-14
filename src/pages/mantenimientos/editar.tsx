import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Tab,
    Tabs,
    TextField,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import { DirectionsCar as CarIcon, VisibilityOff as HiddenIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { mantenimientoApi } from '@/entities/mantenimiento/api/mantenimiento.api';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { useMantenimientoForm } from '@/features/mantenimiento/hooks/useMantenimientoForm';
import { MantenimientoDetalleList } from '@/features/mantenimiento/detalles/ui/MantenimientoDetalleList';

export function MantenimientoEditarPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const params = useParams();

    const mantenimientoId = Number(params.id);

    const { data: mantenimiento, isLoading } = useQuery({
        queryKey: ['mantenimiento', mantenimientoId],
        queryFn: () => mantenimientoApi.getById(mantenimientoId),
        enabled: Number.isFinite(mantenimientoId) && mantenimientoId > 0
    });

    const {
        form,
        isSubmitting,
        onSubmit,
        handleConfirmSave,
        activeTab,
        setActiveTab,
        errorMessage,
        setErrorMessage,
        confirmationOpen,
        setConfirmationOpen,
        effectiveId,
        canEditDetails,
        isEdit,
        createdId,
        listaFlotas,
        listaTiposServicio,
        listaEstados
    } = useMantenimientoForm({
        mantenimientoToEdit: mantenimiento ?? null,
        onSuccess: () => {},
        onClose: () => navigate('/app/mantenimientos'),
        open: true
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty }
    } = form;

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

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
                                    Gestión de Mantenimiento
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Complete los detalles para iniciar un nuevo registro o actualizarlo
                                </Typography>
                            </Box>

                            <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                                <Tab label="Datos de Ingreso" />
                                <Tab label="Detalles / Insumos" disabled={!canEditDetails} />
                            </Tabs>
                        </Box>

                        <Box sx={{ p: 0 }}>
                            {isLoading && (
                                <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
                                    <CircularProgress />
                                </Box>
                            )}

                            {!isLoading && activeTab === 0 && errorMessage && (
                                <Box sx={{ p: 3, pb: 0 }}>
                                    <Alert severity="error" onClose={() => setErrorMessage(null)}>
                                        {errorMessage}
                                    </Alert>
                                </Box>
                            )}

                            {!isLoading && (
                                <>
                                    <TabPanel value={activeTab} index={0} name="mantenimiento">
                                        <form id="mantenimiento-form" onSubmit={handleSubmit(onSubmit)}>
                                            <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                                                <Box sx={{ mb: 3 }}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        fontWeight="bold"
                                                        color="text.primary"
                                                        sx={{
                                                            mb: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: 1
                                                        }}
                                                    >
                                                        <CarIcon fontSize="small" color="primary" />
                                                        Identificación de Unidad
                                                    </Typography>
                                                    <Grid container spacing={3}>
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <TextField
                                                                select
                                                                label="Unidad"
                                                                fullWidth
                                                                {...register('flotaID')}
                                                                defaultValue={mantenimiento?.flotaID ?? 0}
                                                                error={!!errors.flotaID}
                                                                helperText={errors.flotaID?.message}
                                                            >
                                                                <MenuItem value={0} disabled>
                                                                    Seleccione una unidad...
                                                                </MenuItem>
                                                                {listaFlotas.map((item) => (
                                                                    <MenuItem key={item.id} value={item.id}>
                                                                        {item.text}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        </Grid>
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <TextField
                                                                select
                                                                label="Tipo de Servicio"
                                                                fullWidth
                                                                {...register('tipoServicioID')}
                                                                defaultValue={mantenimiento?.tipoServicioID ?? 0}
                                                                error={!!errors.tipoServicioID}
                                                                helperText={errors.tipoServicioID?.message}
                                                            >
                                                                <MenuItem value={0} disabled>
                                                                    Seleccione tipo...
                                                                </MenuItem>
                                                                {listaTiposServicio.map((item) => (
                                                                    <MenuItem key={item.id} value={item.id}>
                                                                        {item.text}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        </Grid>
                                                    </Grid>
                                                </Box>

                                                <Box sx={{ mb: 3 }}>
                                                    <SectionHeader
                                                        number="2"
                                                        title="Detalles de Ingreso"
                                                        themeColor={theme.palette.primary.main}
                                                    />
                                                    <Grid container spacing={3}>
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <TextField
                                                                label="Fecha de Ingreso"
                                                                type="date"
                                                                fullWidth
                                                                {...register('fechaIngreso')}
                                                                error={!!errors.fechaIngreso}
                                                                helperText={errors.fechaIngreso?.message}
                                                                InputLabelProps={{ shrink: true }}
                                                            />
                                                        </Grid>
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <TextField
                                                                label="Kilometraje Ingreso"
                                                                type="number"
                                                                fullWidth
                                                                {...register('kmIngreso')}
                                                                error={!!errors.kmIngreso}
                                                                helperText={errors.kmIngreso?.message}
                                                                InputProps={{
                                                                    endAdornment: (
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                bgcolor: 'action.hover',
                                                                                px: 1,
                                                                                py: 0.5,
                                                                                borderRadius: 1
                                                                            }}
                                                                        >
                                                                            KM
                                                                        </Typography>
                                                                    )
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid size={{ xs: 12 }}>
                                                            <TextField
                                                                label="Motivo de Ingreso / Observaciones"
                                                                multiline
                                                                rows={3}
                                                                fullWidth
                                                                {...register('motivoIngreso')}
                                                                error={!!errors.motivoIngreso}
                                                                helperText={errors.motivoIngreso?.message}
                                                            />
                                                        </Grid>
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <TextField
                                                                select
                                                                label="Estado"
                                                                fullWidth
                                                                {...register('estadoID')}
                                                                defaultValue={mantenimiento?.estadoID ?? 0}
                                                                error={!!errors.estadoID}
                                                                helperText={errors.estadoID?.message}
                                                            >
                                                                <MenuItem value={0} disabled>
                                                                    Seleccione estado...
                                                                </MenuItem>
                                                                {listaEstados
                                                                    .filter((item) => {
                                                                        if (isEdit || createdId) return true;
                                                                        const name = item.text.toUpperCase();
                                                                        return name !== 'COMPLETADO';
                                                                    })
                                                                    .map((item) => (
                                                                        <MenuItem key={item.id} value={item.id}>
                                                                            {item.text}
                                                                        </MenuItem>
                                                                    ))}
                                                            </TextField>
                                                        </Grid>
                                                    </Grid>
                                                </Box>

                                                {(isEdit || createdId) && (
                                                    <Box
                                                        sx={{
                                                            mb: 3,
                                                            p: 2,
                                                            bgcolor: 'action.hover',
                                                            borderRadius: 2,
                                                            border: '1px dashed',
                                                            borderColor: 'divider'
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="subtitle2"
                                                            color="text.secondary"
                                                            sx={{
                                                                mb: 2,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}
                                                        >
                                                            <HiddenIcon fontSize="small" />
                                                            Cierre y Diagnóstico (Opcional)
                                                        </Typography>
                                                        <Grid container spacing={3}>
                                                            <Grid size={{ xs: 12, md: 6 }}>
                                                                <TextField
                                                                    label="Fecha de Salida"
                                                                    type="date"
                                                                    fullWidth
                                                                    {...register('fechaSalida')}
                                                                    error={!!errors.fechaSalida}
                                                                    helperText={errors.fechaSalida?.message}
                                                                    InputLabelProps={{ shrink: true }}
                                                                />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, md: 6 }}>
                                                                <TextField
                                                                    label="Kilometraje Salida"
                                                                    type="number"
                                                                    fullWidth
                                                                    {...register('kmSalida')}
                                                                    error={!!errors.kmSalida}
                                                                    helperText={errors.kmSalida?.message}
                                                                />
                                                            </Grid>
                                                            <Grid size={{ xs: 12 }}>
                                                                <TextField
                                                                    label="Diagnóstico Mecánico"
                                                                    multiline
                                                                    rows={2}
                                                                    fullWidth
                                                                    {...register('diagnosticoMecanico')}
                                                                    error={!!errors.diagnosticoMecanico}
                                                                    helperText={errors.diagnosticoMecanico?.message}
                                                                />
                                                            </Grid>
                                                            <Grid size={{ xs: 12 }}>
                                                                <TextField
                                                                    label="Solución"
                                                                    multiline
                                                                    rows={2}
                                                                    fullWidth
                                                                    {...register('solucion')}
                                                                    error={!!errors.solucion}
                                                                    helperText={errors.solucion?.message}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                )}
                                            </Box>
                                        </form>
                                    </TabPanel>

                                    <TabPanel value={activeTab} index={1} name="mantenimiento">
                                        {effectiveId && (
                                            <Box sx={{ px: 3, py: 3 }}>
                                                <MantenimientoDetalleList
                                                    mantenimientoId={effectiveId}
                                                    viewOnly={false}
                                                    mantenimientoInfo={mantenimiento}
                                                />
                                            </Box>
                                        )}
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
                                            onClick={() => navigate('/app/mantenimientos')}
                                            variant="outlined"
                                            color="inherit"
                                            disabled={isSubmitting}
                                        >
                                            {activeTab === 1 ? 'Cerrar' : 'Cancelar'}
                                        </Button>

                                        {activeTab === 0 && (
                                            <Button
                                                type="submit"
                                                form="mantenimiento-form"
                                                variant="contained"
                                                disabled={isSubmitting || (isEdit && !isDirty)}
                                                startIcon={
                                                    isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
                                                }
                                            >
                                                {isEdit || createdId ? 'Guardar Cambios' : 'Guardar Ingreso'}
                                            </Button>
                                        )}
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
                <DialogTitle>Confirmar Finalización</DialogTitle>
                <DialogContent>
                    <Typography>
                        Una vez se ha completado el registro, no podrá realizar modificaciones sobre
                        este registro y sus detalles.
                        <br />
                        <br />
                        ¿Está seguro de guardar?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmationOpen(false)} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmSave} variant="contained" color="primary">
                        Confirmar y Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

