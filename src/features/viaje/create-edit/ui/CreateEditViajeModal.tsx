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
import { ViajeMercaderia } from '../../ui/ViajeMercaderia/ViajeMercaderia';
import { ViajeGasto } from '../../ui/ViajeGasto/ViajeGasto';
import { ViajeGuia } from '../../ui/ViajeGuia/ViajeGuia';
import { ViajeIncidente } from '../../ui/ViajeIncidente/ViajeIncidente';
import { ViajePermiso } from '../../ui/ViajePermiso/ViajePermiso';
import { ViajeEscolta } from '../../ui/ViajeEscolta/ViajeEscolta';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
    
    const { 
        clientes, tractos, carretas, colaboradores, 
        tiposMedida, tiposPeso, tiposGasto, monedas,
        tiposGuia, tiposIncidente, mercaderias, estados
    } = useViajeOptions();

    const methods = useForm<CreateViajeDto>({
        resolver: zodResolver(viajeSchema) as any, // Cast to any or appropriate type because Zod's .optional() creates | undefined which sometimes conflicts with | null in strict mode, though we fixed schema. The remaining conflict might be due to deep nesting or complex types.
        defaultValues: {
            estadoID: 1,
            requiereEscolta: false,
            requierePermiso: false
        }
    });

    const { register, handleSubmit, reset, formState: { errors }, control, watch } = methods;
    
    // Watch fields to toggle tabs visibility or status
    const requiereEscolta = watch('requiereEscolta');
    const requierePermiso = watch('requierePermiso');

    // Mutation for create/update
    const mutation = useMutation<number | void, Error, CreateViajeDto>({
        mutationFn: (data: CreateViajeDto) => {
            if (viaje?.viajeID) {
                return viajeApi.update(viaje.viajeID, { ...data, viajeID: viaje.viajeID });
            }
            return viajeApi.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['viajes'] });
            onClose();
        },
        onError: (error) => {
            console.error("Error saving viaje:", error);
            // Handle error feedback (toast/snackbar)
        }
    });

    useEffect(() => {
        if (open) {
            if (viaje) {
                reset({
                    ...viaje,
                    clienteID: viaje.clienteID || 0,
                    colaboradorID: viaje.colaboradorID || 0,
                    cotizacionID: viaje.cotizacionID ?? undefined,
                    tractoID: viaje.tractoID || 0,
                    carretaID: viaje.carretaID || 0,
                    estadoID: viaje.estadoID || 1,
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
                    peso: viaje.peso ?? undefined
                });
            } else {
                reset({
                    estadoID: 1,
                    requiereEscolta: false,
                    requierePermiso: false,
                    fechaCarga: getCurrentDateISO(),
                    clienteID: 0,
                    colaboradorID: 0,
                    tractoID: 0,
                    carretaID: 0,
                    tipoMedidaID: 0,
                    tipoPesoID: 0
                });
            }
            setActiveTab(0);
        }
    }, [open, viaje, reset]);

    const onSubmit = (data: CreateViajeDto) => {
        // ID 204 corresponds to 'Completado', ID 203 to 'Cancelado'
        if (data.estadoID === 204 || data.estadoID === 203) {
            setPendingData(data);
            setShowConfirmDialog(true);
        } else {
            mutation.mutate(data);
        }
    };

    const handleConfirmSave = () => {
        if (pendingData) {
            mutation.mutate(pendingData);
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
                                
                                <Grid size={{ xs: 12, md: 4 }}>
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
                                <Grid size={{ xs: 12, md: 4 }}>
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
                                <Grid size={{ xs: 12, md: 4 }}>
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
                                <Grid size={{ xs: 12, md: 4 }}>
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
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <TextField
                                        label="Km Inicio"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        {...register('kmInicio', { valueAsNumber: true })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <TextField
                                        label="Km Llegada"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        {...register('kmLlegada', { valueAsNumber: true })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 4 }}>
                                    <TextField
                                        label="Km Llegada Base"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        {...register('kmLlegadaBase', { valueAsNumber: true })}
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
                                        />
                                        <TextField
                                            label="Ancho"
                                            type="number"
                                            fullWidth
                                            size="small"
                                            inputProps={{ step: "0.01" }}
                                            {...register('ancho', { valueAsNumber: true })}
                                        />
                                        <TextField
                                            label="Alto"
                                            type="number"
                                            fullWidth
                                            size="small"
                                            inputProps={{ step: "0.01" }}
                                            {...register('alto', { valueAsNumber: true })}
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }} display="flex" alignItems="center" gap={2}>
                                    <Controller
                                        name="requiereEscolta"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={<Switch checked={field.value} onChange={field.onChange} />}
                                                label="Requiere Escolta"
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="requierePermiso"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={<Switch checked={field.value} onChange={field.onChange} />}
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
                <Button  onClick={onClose}>Cerrar</Button>
            </DialogActions>

            <ConfirmDialog
                open={showConfirmDialog}
                severity={pendingData?.estadoID === 203 ? 'error' : 'info'}
                title={pendingData?.estadoID === 203 ? 'Confirmar Cancelación' : 'Confirmar Finalización'}
                content={pendingData?.estadoID === 203 
                    ? "Una vez cancelado el viaje no podrá editarse." 
                    : "Una vez completado el registro no podrá editarse, ¿desea continuar con el registro?"}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirmSave}
                isLoading={mutation.isPending}
            />
        </Dialog>
    );
}
