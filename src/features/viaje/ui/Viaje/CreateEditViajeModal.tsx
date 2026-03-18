import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Grid, TextField, Tabs, Tab, Typography, Switch, FormControlLabel } from '@mui/material';
import { FormProvider, Controller } from 'react-hook-form';
import type { Viaje } from '@/entities/viaje/model/types';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { UbigeoSelect } from '@/shared/components/ui/UbigeoSelect';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';
import { handleAddressKeyDown } from '@/shared/utils/input-validators';
import { ViajeMercaderia } from '../../ui/ViajeMercaderia/Index';
import { ViajeGasto } from '../../ui/ViajeGasto/Index';
import { ViajeGuia } from '../../ui/ViajeGuia/Index';
import { ViajeIncidente } from '../../ui/ViajeIncidente/Index';
import { ViajePermiso } from '../../ui/ViajePermiso/Index';
import { ViajeEscolta } from '../ViajeEscolta/Index';
import { ESTADO_VIAJE_ID } from '@/shared/constants/constantes';
import { useViajeForm, TAB_INDICES } from '../../hooks/useViajeForm';

interface Props {
    open: boolean;
    onClose: () => void;
    viaje?: Viaje | null;
    isViewOnly?: boolean;
}

export function CreateEditViajeModal({ open, onClose, viaje, isViewOnly = false }: Props) {
    const {
        methods,
        activeTab,
        handleTabChange,
        onSubmit,
        showConfirmDialog,
        setShowConfirmDialog,
        pendingData,
        handleConfirmSave,
        mutation,
        options,
        requiereEscolta,
        requierePermiso
    } = useViajeForm({ open, onClose, viaje });

    const { 
        clientes, tractos, carretas, colaboradores, 
        tiposMedida, tiposPeso, tiposGasto, monedas,
        tiposGuia, tiposIncidente, mercaderias, estados
    } = options;

    const { register, handleSubmit, formState: { errors }, control } = methods;

    return (
        <Dialog open={open} maxWidth="xl" fullWidth>
            <DialogTitle>{viaje ? (isViewOnly ? 'Detalle de Viaje' : 'Editar Viaje') : 'Nuevo Viaje'}</DialogTitle>
            <DialogContent>
                <FormProvider {...methods}>
                    <form id="viaje-form" onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                                <Tab label="General" value={TAB_INDICES.GENERAL} />
                                <Tab label="Mercadería" value={TAB_INDICES.MERCADERIA} />
                                <Tab label="Guías" value={TAB_INDICES.GUIAS} />
                                <Tab label="Gastos" value={TAB_INDICES.GASTOS} />
                                <Tab label="Incidentes" value={TAB_INDICES.INCIDENTES} />
                                {requierePermiso && <Tab label="Permisos" value={TAB_INDICES.PERMISOS} />}
                                {requiereEscolta && <Tab label="Escolta" value={TAB_INDICES.ESCOLTA} />}
                            </Tabs>
                        </Box>

                        <TabPanel value={activeTab} index={TAB_INDICES.GENERAL}>
                            <Grid container spacing={2}>
                                {/* Row 1: Clientes & Recursos */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormSelect
                                        label="Cliente"
                                        registration={register('clienteID', { valueAsNumber: true })}
                                        options={clientes || []}
                                        defaultValue={viaje?.viajeID ? viaje.clienteID : 0}
                                        error={!!errors.clienteID}
                                        helperText={errors.clienteID?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormSelect
                                        label="Conductor"
                                        registration={register('colaboradorID', { valueAsNumber: true })}
                                        options={colaboradores || []}
                                        defaultValue={viaje?.viajeID ? viaje.colaboradorID : 0}
                                        error={!!errors.colaboradorID}
                                        helperText={errors.colaboradorID?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <FormSelect
                                        label="Tracto"
                                        registration={register('tractoID', { valueAsNumber: true })}
                                        options={tractos || []}
                                        defaultValue={viaje?.viajeID ? viaje.tractoID : 0}
                                        error={!!errors.tractoID}
                                        helperText={errors.tractoID?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField
                                        label="Ejes Tracto"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        {...register('ejesTracto', { valueAsNumber: true })}
                                        error={!!errors.ejesTracto}
                                        helperText={errors.ejesTracto?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 3 }}>
                                    <FormSelect
                                        label="Carreta"
                                        registration={register('carretaID', { valueAsNumber: true })}
                                        options={carretas || []}
                                        defaultValue={viaje?.viajeID ? (viaje.carretaID ?? 0) : 0}
                                        error={!!errors.carretaID}
                                        helperText={errors.carretaID?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField
                                        label="Ejes Carreta"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        {...register('ejesCarreta', { valueAsNumber: true })}
                                        error={!!errors.ejesCarreta}
                                        helperText={errors.ejesCarreta?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormDatePicker
                                        label="Fecha Carga"
                                        registration={register('fechaCarga')}
                                        error={!!errors.fechaCarga}
                                        helperText={errors.fechaCarga?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormSelect
                                        label="Estado"
                                        registration={register('estadoID', { valueAsNumber: true })}
                                        options={estados || []}
                                        defaultValue={viaje?.viajeID ? viaje.estadoID : 0}
                                        error={!!errors.estadoID}
                                        helperText={errors.estadoID?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>

                                {/* Row 2: Ruta */}
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, color: 'primary.main' }}>Ruta</Typography>
                                </Grid>
                                
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
                                        <Typography variant="caption" color="textSecondary">Origen</Typography>
                                        <Controller
                                            name="origenID"
                                            control={control}
                                            render={({ field }) => (
                                                <UbigeoSelect 
                                                    label="Origen"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    error={!!errors.origenID}
                                                    helperText={errors.origenID?.message}
                                                    disabled={isViewOnly}
                                                />
                                            )}
                                        />
                                        <TextField 
                                            label="Dirección Origen (Detalle)" 
                                            fullWidth 
                                            size="small" 
                                            sx={{ mt: 1 }}
                                            {...register('direccionOrigen')}
                                            onKeyDown={handleAddressKeyDown}
                                            disabled={isViewOnly}
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
                                        <Typography variant="caption" color="textSecondary">Destino</Typography>
                                        <Controller
                                            name="destinoID"
                                            control={control}
                                            render={({ field }) => (
                                                <UbigeoSelect 
                                                    label="Destino"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    error={!!errors.destinoID}
                                                    helperText={errors.destinoID?.message}
                                                    disabled={isViewOnly}
                                                />
                                            )}
                                        />
                                        <TextField 
                                            label="Dirección Destino (Detalle)" 
                                            fullWidth 
                                            size="small" 
                                            sx={{ mt: 1 }}
                                            {...register('direccionDestino')}
                                            onKeyDown={handleAddressKeyDown}
                                            disabled={isViewOnly}
                                        />
                                    </Box>
                                </Grid>

                                {/* Fechas y Kilometrajes */}
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, color: 'primary.main' }}>Seguimiento</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <FormDatePicker
                                        label="Fecha Partida"
                                        registration={register('fechaPartida')}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <FormDatePicker
                                        label="Fecha Llegada"
                                        registration={register('fechaLlegada')}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <FormDatePicker
                                        label="Fecha Descarga"
                                        registration={register('fechaDescarga')}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <FormDatePicker
                                        label="Fecha Llegada Base"
                                        registration={register('fechaLlegadaBase')}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <TextField
                                        label="Km Inicio"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        {...register('kmInicio', { valueAsNumber: true })}
                                        error={!!errors.kmInicio}
                                        helperText={errors.kmInicio?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <TextField
                                        label="Km Llegada"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        {...register('kmLlegada', { valueAsNumber: true })}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <TextField
                                        label="Km Llegada Base"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        {...register('kmLlegadaBase', { valueAsNumber: true })}
                                        disabled={isViewOnly}
                                    />
                                </Grid>

                                {/* Row 3: Config Carga & Servicios */}
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, color: 'primary.main' }}>Configuración de Carga</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <FormSelect
                                        label="U. Medida"
                                        registration={register('tipoMedidaID', { valueAsNumber: true })}
                                        options={tiposMedida || []}
                                        defaultValue={viaje?.viajeID ? viaje.tipoMedidaID : 0}
                                        error={!!errors.tipoMedidaID}
                                        helperText={errors.tipoMedidaID?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <FormSelect
                                        label="U. Peso"
                                        registration={register('tipoPesoID', { valueAsNumber: true })}
                                        options={tiposPeso || []}
                                        defaultValue={viaje?.viajeID ? viaje.tipoPesoID : 0}
                                        error={!!errors.tipoPesoID}
                                        helperText={errors.tipoPesoID?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <TextField
                                        label="Peso"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        inputProps={{ step: "0.01" }}
                                        {...register('peso', { valueAsNumber: true })}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="textSecondary">Dimensiones (Largo x Ancho x Alto)</Typography>
                                    <Box display="flex" gap={2}>
                                        <TextField
                                            label="Largo"
                                            type="number"
                                            fullWidth
                                            size="small"
                                            inputProps={{ step: "0.01" }}
                                            {...register('largo', { valueAsNumber: true })}
                                            disabled={isViewOnly}
                                        />
                                        <TextField
                                            label="Ancho"
                                            type="number"
                                            fullWidth
                                            size="small"
                                            inputProps={{ step: "0.01" }}
                                            {...register('ancho', { valueAsNumber: true })}
                                            disabled={isViewOnly}
                                        />
                                        <TextField
                                            label="Alto"
                                            type="number"
                                            fullWidth
                                            size="small"
                                            inputProps={{ step: "0.01" }}
                                            {...register('alto', { valueAsNumber: true })}
                                            disabled={isViewOnly}
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }} display="flex" alignItems="center" gap={2}>
                                    <Controller
                                        name="requiereEscolta"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={<Switch checked={field.value} onChange={field.onChange} disabled={isViewOnly} />}
                                                label="Requiere Escolta"
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="requierePermiso"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={<Switch checked={field.value} onChange={field.onChange} disabled={isViewOnly} />}
                                                label="Requiere Permisos"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
                                    {!isViewOnly && (
                                        <Button 
                                            type="submit" 
                                            variant="contained"
                                            disabled={mutation.isPending}
                                        >
                                            {mutation.isPending ? 'Guardando...' : 'Guardar'}
                                        </Button>
                                    )}
                                </Grid>
                            </Grid>
                        </TabPanel>

                        <TabPanel value={activeTab} index={TAB_INDICES.MERCADERIA}>
                            <ViajeMercaderia 
                                viewOnly={isViewOnly} 
                                tiposMedida={tiposMedida || []} 
                                tiposPeso={tiposPeso || []} 
                                mercaderias={mercaderias || []}
                                viajeId={viaje?.viajeID || 0}
                            />
                        </TabPanel>

                        <TabPanel value={activeTab} index={TAB_INDICES.GUIAS}>
                            <ViajeGuia
                                viewOnly={isViewOnly}
                                tiposGuia={tiposGuia || []}
                                viajeId={viaje?.viajeID}
                            />
                        </TabPanel>

                        <TabPanel value={activeTab} index={TAB_INDICES.GASTOS}>
                            <ViajeGasto 
                                viewOnly={isViewOnly} 
                                tiposGasto={tiposGasto || []} 
                                monedas={monedas || []}
                                viajeId={viaje?.viajeID}
                            />
                        </TabPanel>

                        <TabPanel value={activeTab} index={TAB_INDICES.INCIDENTES}>
                            <ViajeIncidente
                                viewOnly={isViewOnly}
                                tiposIncidente={tiposIncidente || []}
                                viajeId={viaje?.viajeID || 0}
                            />
                        </TabPanel>

                        {requierePermiso && (
                            <TabPanel value={activeTab} index={TAB_INDICES.PERMISOS}>
                                <ViajePermiso viajeId={viaje?.viajeID} viewOnly={isViewOnly} />
                            </TabPanel>
                        )}

                        {requiereEscolta && (
                            <TabPanel value={activeTab} index={TAB_INDICES.ESCOLTA}>
                                <ViajeEscolta 
                                    viewOnly={isViewOnly} 
                                    viajeId={viaje?.viajeID}
                                    flotas={tractos || []} // Assuming tractos list is suitable for escolta vehicles or I should merge carretas too? Escolta usually uses smaller vehicles (camionetas), which might be in Flota but not filtered as Tracto.
                                    // For now using tractos as placeholder or I should request 'all' flotas.
                                    colaboradores={colaboradores || []}
                                />
                            </TabPanel>
                        )}
                    </form>
                </FormProvider>
            </DialogContent>
            <DialogActions>
                <Button  onClick={onClose} variant="contained" color="inherit" >Cerrar</Button>
            </DialogActions>

            <ConfirmDialog
                open={showConfirmDialog}
                severity={pendingData?.estadoID === ESTADO_VIAJE_ID.CANCELADO ? 'error' : 'info'}
                title={pendingData?.estadoID === ESTADO_VIAJE_ID.CANCELADO ? 'Confirmar Cancelación' : 'Confirmar Finalización'}
                content={pendingData?.estadoID === ESTADO_VIAJE_ID.CANCELADO 
                    ? "Una vez cancelado el viaje no podrá editarse." 
                    : "Una vez completado el registro no podrá editarse, ¿desea continuar con el registro?"}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirmSave}
                isLoading={mutation.isPending}
            />
        </Dialog>
    );
}
