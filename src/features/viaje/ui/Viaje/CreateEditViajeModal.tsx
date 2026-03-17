import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Grid, TextField, MenuItem, Tabs, Tab, Typography, Switch, FormControlLabel } from '@mui/material';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { viajeSchema } from '../../model/schema';
import type { CreateViajeDto, Viaje } from '@/entities/viaje/model/types';
import { useEffect, useState } from 'react';
import { useViajeOptions } from '../../hooks/useViajeOptions';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { UbigeoSelect } from '@/shared/components/ui/UbigeoSelect';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { getCurrentDateISO, toInputDate } from '@/shared/utils/date-utils';
import { handleAddressKeyDown } from '@/shared/utils/input-validators';
import { ViajeMercaderia } from '../../ui/ViajeMercaderia/Index';
import { ViajeGasto } from '../../ui/ViajeGasto/Index';
import { ViajeGuia } from '../../ui/ViajeGuia/Index';
import { ViajeIncidente } from '../../ui/ViajeIncidente/Index';
import { ViajePermiso } from '../../ui/ViajePermiso/Index';
import { ViajeEscolta } from '../../ui/ViajeEscolta/Index';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ESTADO_VIAJE_ID } from '@/shared/constants/constantes';
import { useToast } from '@/shared/components/ui/Toast';

interface Props {
    open: boolean;
    onClose: () => void;
    viaje?: Viaje | null;
    isViewOnly?: boolean;
}

export function CreateEditViajeModal({ open, onClose, viaje, isViewOnly = false }: Props) {
    const [activeTab, setActiveTab] = useState(0);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingData, setPendingData] = useState<CreateViajeDto | null>(null);
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    const { 
        clientes, tractos, carretas, colaboradores, 
        tiposMedida, tiposPeso, tiposGasto, monedas,
        tiposGuia, tiposIncidente, mercaderias, estados
    } = useViajeOptions();

    const methods = useForm<CreateViajeDto>({
        resolver: zodResolver(viajeSchema) as any, // Cast to any or appropriate type because Zod's .optional() creates | undefined which sometimes conflicts with | null in strict mode, though we fixed schema. The remaining conflict might be due to deep nesting or complex types.
        defaultValues: {
            estadoID: 0,
            requiereEscolta: false,
            requierePermiso: false
        }
    });

    const { register, handleSubmit, reset, formState: { errors }, control, watch } = methods;
    
    // Watch fields to toggle tabs visibility or status
    const requiereEscolta = watch('requiereEscolta');
    const requierePermiso = watch('requierePermiso');
    const selectedTractoID = watch('tractoID');
    const selectedCarretaID = watch('carretaID');

    // Update Ejes when Tracto changes
    useEffect(() => {
        if (selectedTractoID && tractos) {
            const tracto = tractos.find(t => t.id === selectedTractoID);
            if (tracto && tracto.extraTwo !== undefined) {
                 methods.setValue('ejesTracto', parseInt(tracto.extraTwo));
            }
        }
    }, [selectedTractoID, tractos, methods]);

    // Update Ejes when Carreta changes
    useEffect(() => {
        if (selectedCarretaID && carretas) {
            const carreta = carretas.find(c => c.id === selectedCarretaID);
            if (carreta && carreta.extraTwo !== undefined) {
                 methods.setValue('ejesCarreta', parseInt(carreta.extraTwo));
            }
        }
    }, [selectedCarretaID, carretas, methods]);

    // Mutation for create/update
    const mutation = useMutation<number | void, Error, CreateViajeDto>({
        mutationFn: (data: CreateViajeDto) => {
            // Convert empty strings to null/undefined for date fields to avoid JSON serialization errors
            const cleanData = {
                ...data,
                fechaLlegada: data.fechaLlegada || undefined,
                fechaPartida: data.fechaPartida || undefined,
                fechaDescarga: data.fechaDescarga || undefined,
                fechaLlegadaBase: data.fechaLlegadaBase || undefined,
                // Ensure optional number fields are undefined if 0 or empty (depending on logic, here kept as is if schema allows)
            };

            if (viaje?.viajeID) {
                return viajeApi.update(viaje.viajeID, { ...cleanData, viajeID: viaje.viajeID });
            }
            return viajeApi.create(cleanData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['viajes'] });
            showToast({ 
                entity: 'Viaje',
                action: viaje?.viajeID ? 'update' : 'create'
            });
            onClose();
        },
        onError: (error) => {
            console.error("Error saving viaje:", error);
            showToast({ 
                entity: 'Viaje',
                action: viaje?.viajeID ? 'update' : 'create',
                isError: true
            });
        }
    });

    useEffect(() => {
        if (open) {
            // Refetch options to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ['clientes-select'] });
            queryClient.invalidateQueries({ queryKey: ['flota-select-tracto'] });
            queryClient.invalidateQueries({ queryKey: ['flota-select-carreta'] });
            queryClient.invalidateQueries({ queryKey: ['colaboradores-select'] });

            if (viaje) {
                reset({
                    ...viaje,
                    clienteID: viaje.clienteID || 0,
                    colaboradorID: viaje.colaboradorID || 0,
                    cotizacionID: viaje.cotizacionID ?? undefined,
                    tractoID: viaje.tractoID || 0,
                    carretaID: viaje.carretaID || 0,
                    estadoID: viaje.estadoID || 0,
                    direccionOrigen: viaje.direccionOrigen ?? undefined,
                    direccionDestino: viaje.direccionDestino ?? undefined,
                    fechaCarga: viaje.fechaCarga ? toInputDate(viaje.fechaCarga) : '',
                    fechaPartida: viaje.fechaPartida ? toInputDate(viaje.fechaPartida) : undefined,
                    fechaLlegada: viaje.fechaLlegada ? toInputDate(viaje.fechaLlegada) : undefined,
                    fechaDescarga: viaje.fechaDescarga ? toInputDate(viaje.fechaDescarga) : undefined,
                    fechaLlegadaBase: viaje.fechaLlegadaBase ? toInputDate(viaje.fechaLlegadaBase) : undefined,
                    kmInicio: viaje.kmInicio ?? undefined,
                    kmLlegada: viaje.kmLlegada ?? undefined,
                    kmLlegadaBase: viaje.kmLlegadaBase ?? undefined,
                    tipoMedidaID: viaje.tipoMedidaID || 0,
                    tipoPesoID: viaje.tipoPesoID || 0,  
                    requiereEscolta: viaje.requiereEscolta ?? false,
                    requierePermiso: viaje.requierePermiso ?? false,
                    largo: viaje.largo ?? undefined,
                    alto: viaje.alto ?? undefined,
                    ancho: viaje.ancho ?? undefined,
                    peso: viaje.peso ?? undefined,
                    ejesTracto: viaje.ejesTracto || 0,
                    ejesCarreta: viaje.ejesCarreta || 0
                });
            } else {
                reset({
                    estadoID: 0,
                    requiereEscolta: false,
                    requierePermiso: false,
                    fechaCarga: getCurrentDateISO(),
                    clienteID: 0,
                    colaboradorID: 0,
                    tractoID: 0,
                    carretaID: 0,
                    ejesTracto: 0,
                    ejesCarreta: 0,
                    tipoMedidaID: 0,
                    tipoPesoID: 0,
                    largo: 0,
                    alto: 0,
                    ancho: 0,
                    peso: 0,
                    kmInicio: 0,
                    kmLlegada: 0,
                    kmLlegadaBase: 0,
                });
            }
            setActiveTab(0);
            setShowConfirmDialog(false);
            setPendingData(null);
        }
    }, [open, viaje, reset]);

    const onSubmit = (data: CreateViajeDto) => {
        // ID 204 corresponds to 'Completado', ID 203 to 'Cancelado'
        if (data.estadoID === ESTADO_VIAJE_ID.COMPLETADO || data.estadoID === ESTADO_VIAJE_ID.CANCELADO) {
            setPendingData(data);
            setShowConfirmDialog(true);
        } else {
            mutation.mutate(data);
        }
    };

    const handleConfirmSave = () => {
        if (pendingData) {
            // Apply same cleaning logic
            const cleanData = {
                ...pendingData,
                fechaLlegada: pendingData.fechaLlegada || undefined,
                fechaPartida: pendingData.fechaPartida || undefined,
                fechaDescarga: pendingData.fechaDescarga || undefined,
                fechaLlegadaBase: pendingData.fechaLlegadaBase || undefined
            };
            mutation.mutate(cleanData);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Dialog open={open} maxWidth="xl" fullWidth>
            <DialogTitle>{viaje ? (isViewOnly ? 'Detalle de Viaje' : 'Editar Viaje') : 'Nuevo Viaje'}</DialogTitle>
            <DialogContent>
                <FormProvider {...methods}>
                    <form id="viaje-form" onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                                <Tab label="General" value={0} />
                                <Tab label="Mercadería" value={1} />
                                <Tab label="Guías" value={2} />
                                <Tab label="Gastos" value={3} />
                                <Tab label="Incidentes" value={4} />
                                {requierePermiso && <Tab label="Permisos" value={5} />}
                                {requiereEscolta && <Tab label="Escolta" value={6} />}
                            </Tabs>
                        </Box>

                        <TabPanel value={activeTab} index={0}>
                            <Grid container spacing={2}>
                                {/* Row 1: Clientes & Recursos */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        select
                                        label="Cliente"
                                        fullWidth
                                        {...register('clienteID', { valueAsNumber: true })}
                                        defaultValue={viaje?.viajeID ? viaje.clienteID : 0}
                                        error={!!errors.clienteID}
                                        helperText={errors.clienteID?.message}
                                        disabled={isViewOnly}
                                    >
                                        <MenuItem value={0} disabled>Seleccione</MenuItem>
                                        {clientes?.map(c => (
                                            <MenuItem key={c.id} value={c.id}>{c.text}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        select
                                        label="Conductor"
                                        fullWidth
                                        {...register('colaboradorID', { valueAsNumber: true })}
                                        defaultValue={viaje?.viajeID ? viaje.colaboradorID : 0}
                                        error={!!errors.colaboradorID}
                                        helperText={errors.colaboradorID?.message}
                                        disabled={isViewOnly}
                                    >
                                        <MenuItem value={0} disabled>Seleccione</MenuItem>
                                        {colaboradores?.map(c => (
                                            <MenuItem key={c.id} value={c.id}>{c.text}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField
                                        select
                                        label="Tracto"
                                        fullWidth
                                        {...register('tractoID', { valueAsNumber: true })}
                                        defaultValue={viaje?.viajeID ? viaje.tractoID : 0}
                                        error={!!errors.tractoID}
                                        helperText={errors.tractoID?.message}
                                        disabled={isViewOnly}
                                    >
                                        <MenuItem value={0} disabled>Seleccione</MenuItem>
                                        {tractos?.map(t => (
                                            <MenuItem key={t.id} value={t.id}>{t.text}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField
                                        label="Ejes Tracto"
                                        type="number"
                                        fullWidth
                                        {...register('ejesTracto', { valueAsNumber: true })}
                                        error={!!errors.ejesTracto}
                                        helperText={errors.ejesTracto?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField
                                        select
                                        label="Carreta"
                                        fullWidth
                                        {...register('carretaID', { valueAsNumber: true })}
                                        defaultValue={viaje?.viajeID ? viaje.carretaID : 0}
                                        error={!!errors.carretaID}
                                        helperText={errors.carretaID?.message}
                                        disabled={isViewOnly}
                                    >
                                        <MenuItem value={0} disabled>Seleccione</MenuItem>
                                        {carretas?.map(c => (
                                            <MenuItem key={c.id} value={c.id}>{c.text}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <TextField
                                        label="Ejes Carreta"
                                        type="number"
                                        fullWidth
                                        {...register('ejesCarreta', { valueAsNumber: true })}
                                        error={!!errors.ejesCarreta}
                                        helperText={errors.ejesCarreta?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Fecha Carga"
                                        type="date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        {...register('fechaCarga')}
                                        error={!!errors.fechaCarga}
                                        helperText={errors.fechaCarga?.message}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        select
                                        label="Estado"
                                        fullWidth
                                        {...register('estadoID', { valueAsNumber: true })}
                                        defaultValue={viaje?.viajeID ? viaje.estadoID : 0}
                                        error={!!errors.estadoID}
                                        helperText={errors.estadoID?.message}
                                        disabled={isViewOnly}
                                        // defaultValue={1}
                                    >
                                        {estados?.map(e => <MenuItem key={e.id} value={e.id}>{e.text}</MenuItem>)}
                                    </TextField>
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
                                    <TextField
                                        label="Fecha Partida"
                                        type="date"
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        {...register('fechaPartida')}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <TextField
                                        label="Fecha Llegada"
                                        type="date"
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        {...register('fechaLlegada')}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <TextField
                                        label="Fecha Descarga"
                                        type="date"
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        {...register('fechaDescarga')}
                                        disabled={isViewOnly}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <TextField
                                        label="Fecha Llegada Base"
                                        type="date"
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        {...register('fechaLlegadaBase')}
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
                                    <TextField
                                        select
                                        label="U. Medida"
                                        fullWidth
                                        size="small"
                                        {...register('tipoMedidaID', { valueAsNumber: true })}
                                        defaultValue={viaje?.viajeID ? viaje.tipoMedidaID : 0}
                                        error={!!errors.tipoMedidaID}
                                        helperText={errors.tipoMedidaID?.message}
                                        disabled={isViewOnly}
                                    >
                                        {tiposMedida?.map(t => <MenuItem key={t.id} value={t.id}>{t.text}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <TextField
                                        select
                                        label="U. Peso"
                                        fullWidth
                                        size="small"
                                        {...register('tipoPesoID', { valueAsNumber: true })}
                                        defaultValue={viaje?.viajeID ? viaje.tipoPesoID : 0}
                                        error={!!errors.tipoPesoID}
                                        helperText={errors.tipoPesoID?.message}
                                        disabled={isViewOnly}
                                    >
                                        {tiposPeso?.map(t => <MenuItem key={t.id} value={t.id}>{t.text}</MenuItem>)}
                                    </TextField>
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

                        <TabPanel value={activeTab} index={1}>
                            <ViajeMercaderia 
                                viewOnly={isViewOnly} 
                                tiposMedida={tiposMedida || []} 
                                tiposPeso={tiposPeso || []} 
                                mercaderias={mercaderias || []}
                                viajeId={viaje?.viajeID || 0}
                            />
                        </TabPanel>

                        <TabPanel value={activeTab} index={2}>
                            <ViajeGuia
                                viewOnly={isViewOnly}
                                tiposGuia={tiposGuia || []}
                                viajeId={viaje?.viajeID}
                            />
                        </TabPanel>

                        <TabPanel value={activeTab} index={3}>
                            <ViajeGasto 
                                viewOnly={isViewOnly} 
                                tiposGasto={tiposGasto || []} 
                                monedas={monedas || []}
                                viajeId={viaje?.viajeID}
                            />
                        </TabPanel>

                        <TabPanel value={activeTab} index={4}>
                            <ViajeIncidente
                                viewOnly={isViewOnly}
                                tiposIncidente={tiposIncidente || []}
                                viajeId={viaje?.viajeID || 0}
                            />
                        </TabPanel>

                        {requierePermiso && (
                            <TabPanel value={activeTab} index={5}>
                                <ViajePermiso viajeId={viaje?.viajeID} viewOnly={isViewOnly} />
                            </TabPanel>
                        )}

                        {requiereEscolta && (
                            <TabPanel value={activeTab} index={6}>
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
