import { Box, Grid, TextField, Typography, Switch, FormControlLabel, Button } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { UbigeoSelect } from '@/shared/components/ui/UbigeoSelect';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';
import { handleAddressKeyDown } from '@/shared/utils/input-validators';
import type { SelectItem } from '@/shared/model/types';
import type { Viaje } from '@/entities/viaje/model/types';

interface Props {
    viaje?: Viaje | null;
    isViewOnly: boolean;
    options: {
        clientes?: SelectItem[];
        tractos?: SelectItem[];
        carretas?: SelectItem[];
        colaboradores?: SelectItem[];
        tiposMedida?: SelectItem[];
        tiposPeso?: SelectItem[];
        estados?: SelectItem[];
    };
    isPending: boolean;
}

export function ViajeCreateEdit({ viaje, isViewOnly, options, isPending }: Props) {
    const { register, control, formState: { errors } } = useFormContext();
    const { clientes, tractos, carretas, colaboradores, tiposMedida, tiposPeso, estados } = options;

    return (
        <Grid container spacing={2}>
            {/* Row 1: Clientes & Recursos */}
            <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                    label="Cliente"
                    registration={register('clienteID', { valueAsNumber: true })}
                    options={clientes || []}
                    defaultValue={viaje?.viajeID ? viaje.clienteID : 0}
                    error={!!errors.clienteID}
                    helperText={errors.clienteID?.message as string}
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
                    helperText={errors.colaboradorID?.message as string}
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
                    helperText={errors.tractoID?.message as string}
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
                    helperText={errors.ejesTracto?.message as string}
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
                    helperText={errors.carretaID?.message as string}
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
                    helperText={errors.ejesCarreta?.message as string}
                    disabled={isViewOnly}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <FormDatePicker
                    label="Fecha Carga"
                    registration={register('fechaCarga')}
                    error={!!errors.fechaCarga}
                    helperText={errors.fechaCarga?.message as string}
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
                    helperText={errors.estadoID?.message as string}
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
                                helperText={errors.origenID?.message as string}
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
                                helperText={errors.destinoID?.message as string}
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
                    helperText={errors.kmInicio?.message as string}
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
                    helperText={errors.tipoMedidaID?.message as string}
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
                    helperText={errors.tipoPesoID?.message as string}
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
                        disabled={isPending}
                    >
                        {isPending ? 'Guardando...' : 'Guardar'}
                    </Button>
                )}
            </Grid>
        </Grid>
    );
}