import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Typography,
    Box,
    useTheme,
    alpha,
    Tabs,
    Tab,
    Alert,
    Button,
    CircularProgress,
    MenuItem
} from '@mui/material';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { MantenimientoDetalleList } from '../../detalles/ui/MantenimientoDetalleList';
import { 
    DirectionsCar as CarIcon, 
    VisibilityOff as HiddenIcon
} from '@mui/icons-material';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { useMantenimientoForm } from '../../hooks/useMantenimientoForm';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';

interface CreateEditMantenimientoModalProps {
    open: boolean;
    onClose: () => void;
    mantenimientoToEdit?: Mantenimiento | null;
    onSuccess: (id: number) => void;
    viewOnly?: boolean;
}

export function CreateEditMantenimientoModal({ 
    open, 
    onClose, 
    mantenimientoToEdit, 
    onSuccess, 
    viewOnly = false 
}: CreateEditMantenimientoModalProps) {
    const theme = useTheme();

    const {
        form: {
            register,
            handleSubmit,
            formState: { errors, isDirty }
        },
        mutation,
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
        mantenimientoToEdit,
        onSuccess,
        onClose,
        open
    });

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={(_, reason) => {
                    if (reason && reason === 'backdropClick') return;
                    onClose();
                }}
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
                        {viewOnly ? 'Detalle de Mantenimiento' : (isEdit || createdId ? 'Gestión de Mantenimiento' : 'Registrar Ingreso a Taller')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {viewOnly ? 'Información del registro' : 'Complete los detalles para iniciar un nuevo registro o actualizarlo'}
                    </Typography>
                </Box>

                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="Datos de Ingreso" />
                    <Tab label="Detalles / Insumos" disabled={!canEditDetails} />
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

                <TabPanel value={activeTab} index={0} name="mantenimiento">
                    <form id="mantenimiento-form" onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ px: 3 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
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
                                            defaultValue={isEdit && mantenimientoToEdit ? mantenimientoToEdit.flotaID : 0}
                                            error={!!errors.flotaID}
                                            helperText={errors.flotaID?.message}
                                            disabled={viewOnly}
                                        >
                                            <MenuItem value={0} disabled>Seleccione una unidad...</MenuItem>
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
                                            defaultValue={isEdit && mantenimientoToEdit ? mantenimientoToEdit.tipoServicioID : 0}
                                            error={!!errors.tipoServicioID}
                                            helperText={errors.tipoServicioID?.message}
                                            disabled={viewOnly}
                                        >
                                            <MenuItem value={0} disabled>Seleccione tipo...</MenuItem>
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
                                <SectionHeader number="2" title="Detalles de Ingreso" themeColor={theme.palette.primary.main} />
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="Fecha de Ingreso"
                                            type="date"
                                            fullWidth
                                            {...register('fechaIngreso')}
                                            error={!!errors.fechaIngreso}
                                            helperText={errors.fechaIngreso?.message}
                                            disabled={viewOnly}
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
                                            disabled={viewOnly}
                                            InputProps={{
                                                endAdornment: <Typography variant="caption" sx={{ bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}>KM</Typography>
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
                                            disabled={viewOnly}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            select
                                            label="Estado"
                                            fullWidth
                                            {...register('estadoID')}
                                            defaultValue={isEdit && mantenimientoToEdit ? mantenimientoToEdit.estadoID : 0}
                                            error={!!errors.estadoID}
                                            helperText={errors.estadoID?.message}
                                            disabled={viewOnly}
                                        >
                                            <MenuItem value={0} disabled>Seleccione estado...</MenuItem>
                                            {listaEstados.filter(item => {
                                                if (isEdit || createdId) return true; // Show all states if editing or created
                                                const name = item.text.toUpperCase();
                                                return name !== 'COMPLETADO'; // Hide Completed/Finalized for new
                                            }).map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.text}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Box>

                            {(isEdit || createdId) && (
                                <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                                disabled={viewOnly}
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
                                                disabled={viewOnly}
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
                                                disabled={viewOnly}
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
                                                disabled={viewOnly}
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
                        <Box sx={{ px: 3, height: 500 }}>
                            <MantenimientoDetalleList 
                                mantenimientoId={effectiveId} 
                                viewOnly={viewOnly} 
                                mantenimientoInfo={mantenimientoToEdit}
                            />
                        </Box>
                    )}
                </TabPanel>
            </DialogContent>

            <DialogActions sx={{
                p: 3,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                gap: 2
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    color="inherit"
                    disabled={mutation.isPending}
                >
                    {viewOnly || activeTab === 1 ? 'Cerrar' : 'Cancelar'}
                </Button>

                {!viewOnly && activeTab === 0 && (
                    <Button
                        type="submit"
                        form="mantenimiento-form"
                        variant="contained"
                        disabled={mutation.isPending || (isEdit && !isDirty)}
                        startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isEdit || createdId ? 'Guardar Cambios' : 'Guardar Ingreso'}
                    </Button>
                )}
            </DialogActions></Dialog>

            <Dialog
                open={confirmationOpen}
                onClose={() => setConfirmationOpen(false)}
            >
                <DialogTitle>Confirmar Finalización</DialogTitle>
                <DialogContent>
                    <Typography>
                        Una vez se ha completado el registro (Estado Finalizado), no podrá realizar modificaciones sobre este registro y sus detalles.
                        <br /><br />
                        ¿Está seguro de guardar?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmationOpen(false)} color="inherit">Cancelar</Button>
                    <Button onClick={handleConfirmSave} variant="contained" color="primary">Confirmar y Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
