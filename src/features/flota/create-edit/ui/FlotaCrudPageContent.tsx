import { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    LinearProgress,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import type { SelectItem } from '@/shared/model/types';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { FlotaDocumentosList } from '../../documentos/ui/FlotaDocumentosList';
import type { CreateFlotaSchema } from '../../model/schema';
import type { useFlotaForm } from '../../hooks/useFlotaForm';
import { buildCodigoInterno, CONFIG_EJES_APLICA } from '@entities/flota/model/constants';
import { WeightField } from './WeightField';
import { LengthField } from './LengthField';
import {
    LENGTH_UNITS,
    WEIGHT_UNITS,
    round2,
    type LengthUnit,
    type WeightUnit,
} from '@shared/utils/format-utils';

interface FlotaCrudPageContentProps {
    activeTab: number;
    form: ReturnType<typeof useFlotaForm>['form'];
    onSubmit: (data: CreateFlotaSchema) => void;
    effectiveFlotaId: number | null;
    flotaId?: number | null;
    listaFlota: SelectItem[];
    listaPeso: SelectItem[];
    listaMedida: SelectItem[];
    listaCombustible: SelectItem[];
    listaConfigEjes: SelectItem[];
    viewOnly?: boolean;
}

export function FlotaCrudPageContent({
    activeTab,
    form,
    onSubmit,
    effectiveFlotaId,
    flotaId,
    listaFlota,
    listaPeso,
    listaMedida,
    listaCombustible,
    listaConfigEjes,
    viewOnly = false,
}: FlotaCrudPageContentProps) {
    const theme = useTheme();
    const [weightUnit, setWeightUnit] = useState<WeightUnit>('KG');
    const [lengthUnit, setLengthUnit] = useState<LengthUnit>('M');

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = form;

    const tipoFlota = Number(watch('tipoFlota')) || 0;
    const pesoBruto = Number(watch('pesoBruto')) || 0;
    const pesoNeto = Number(watch('pesoNeto')) || 0;
    const cargaUtil = Math.max(0, pesoBruto - pesoNeto);
    const distribucion = pesoBruto > 0 ? Math.min(100, (cargaUtil / pesoBruto) * 100) : 0;
    const configEjesVisible = CONFIG_EJES_APLICA.includes(tipoFlota);
    const codigoInterno = flotaId ? buildCodigoInterno(tipoFlota, flotaId) : 'Se generará al guardar';

    // Carga útil autocalculada = PBV - Tara.
    useEffect(() => {
        setValue('cargaUtil', round2(cargaUtil), { shouldDirty: false });
    }, [cargaUtil, setValue]);

    return (
        <>
            <TabPanel value={activeTab} index={0} name="flota">
                <form id="flota-form" onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                    Identificación
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Código Interno"
                                    fullWidth
                                    value={codigoInterno}
                                    disabled
                                    InputLabelProps={{ shrink: true }}
                                    helperText="Derivado del tipo de unidad y el identificador"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Placa"
                                    fullWidth
                                    {...register('placa')}
                                    error={!!errors.placa}
                                    helperText={errors.placa?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="tipoFlota"
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label="Tipo Unidad"
                                            size='medium'
                                            options={listaFlota}
                                            value={Number(field.value) || 0}
                                            onChange={(event) => {
                                                const nextTipo = Number(event.target.value);
                                                field.onChange(nextTipo);
                                                // La configuración de ejes solo aplica a Tracto (101).
                                                if (!CONFIG_EJES_APLICA.includes(nextTipo)) {
                                                    setValue('configuracionEjesID', null, { shouldDirty: false });
                                                }
                                            }}
                                            error={!!errors.tipoFlota}
                                            helperText={errors.tipoFlota?.message}
                                            disabled={viewOnly}
                                        />
                                    )}
                                />
                            </Grid>

                            {configEjesVisible ? (
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Controller
                                        name="configuracionEjesID"
                                        control={control}
                                        render={({ field }) => (
                                            <FormSelect
                                                label="Configuración de Ejes"
                                                size='medium'
                                                options={listaConfigEjes}
                                                value={Number(field.value) || 0}
                                                onChange={(event) => field.onChange(Number(event.target.value))}
                                                error={!!errors.configuracionEjesID}
                                                helperText={errors.configuracionEjesID?.message}
                                                disabled={viewOnly}
                                            />
                                        )}
                                    />
                                </Grid>
                            ) : null}

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Color"
                                    fullWidth
                                    {...register('color')}
                                    error={!!errors.color}
                                    helperText={errors.color?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Año"
                                    type="number"
                                    fullWidth
                                    {...register('anio')}
                                    error={!!errors.anio}
                                    helperText={errors.anio?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Marca"
                                    fullWidth
                                    {...register('marca')}
                                    error={!!errors.marca}
                                    helperText={errors.marca?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Modelo"
                                    fullWidth
                                    {...register('modelo')}
                                    error={!!errors.modelo}
                                    helperText={errors.modelo?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="VIN"
                                    fullWidth
                                    {...register('vin')}
                                    error={!!errors.vin}
                                    helperText={errors.vin?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Homologación MTC"
                                    fullWidth
                                    {...register('homologacionMtc')}
                                    error={!!errors.homologacionMtc}
                                    helperText={errors.homologacionMtc?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Ejes"
                                    type="number"
                                    fullWidth
                                    {...register('ejes')}
                                    error={!!errors.ejes}
                                    helperText={errors.ejes?.message}
                                    disabled={viewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, mt: 2 }}>
                                    Capacidad de Flete / Balanza
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <ToggleButtonGroup
                                    value={weightUnit}
                                    exclusive
                                    size="small"
                                    onChange={(_, next: WeightUnit | null) => {
                                        if (next) setWeightUnit(next);
                                    }}
                                >
                                    {WEIGHT_UNITS.map((unit) => (
                                        <ToggleButton key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="tipoPesoID"
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label="Tipo Peso"
                                            size='medium'
                                            options={listaPeso}
                                            value={Number(field.value) || 0}
                                            onChange={(event) => field.onChange(Number(event.target.value))}
                                            error={!!errors.tipoPesoID}
                                            helperText={errors.tipoPesoID?.message}
                                            disabled={viewOnly}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <WeightField
                                    control={control}
                                    name="pesoBruto"
                                    label="PBV / Peso Bruto"
                                    unit={weightUnit}
                                    disabled={viewOnly}
                                    error={!!errors.pesoBruto}
                                    helperText={errors.pesoBruto?.message}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <WeightField
                                    control={control}
                                    name="pesoNeto"
                                    label="Tara / Peso Neto"
                                    unit={weightUnit}
                                    disabled={viewOnly}
                                    error={!!errors.pesoNeto}
                                    helperText={errors.pesoNeto?.message}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <WeightField
                                    control={control}
                                    name="cargaUtil"
                                    label="Carga Útil (auto)"
                                    unit={weightUnit}
                                    disabled
                                    error={!!errors.cargaUtil}
                                    helperText="Calculada automáticamente = PBV − Tara"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ pt: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Distribución de carga
                                        </Typography>
                                        <Typography variant="caption" fontWeight={700}>
                                            {distribucion.toFixed(0)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={distribucion}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1, mt: 2 }}>
                                    Dimensiones y Combustible
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <ToggleButtonGroup
                                    value={lengthUnit}
                                    exclusive
                                    size="small"
                                    onChange={(_, next: LengthUnit | null) => {
                                        if (next) setLengthUnit(next);
                                    }}
                                >
                                    {LENGTH_UNITS.map((unit) => (
                                        <ToggleButton key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <LengthField
                                    control={control}
                                    name="largo"
                                    label="Largo"
                                    unit={lengthUnit}
                                    disabled={viewOnly}
                                    error={!!errors.largo}
                                    helperText={errors.largo?.message}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <LengthField
                                    control={control}
                                    name="ancho"
                                    label="Ancho"
                                    unit={lengthUnit}
                                    disabled={viewOnly}
                                    error={!!errors.ancho}
                                    helperText={errors.ancho?.message}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <LengthField
                                    control={control}
                                    name="alto"
                                    label="Alto"
                                    unit={lengthUnit}
                                    disabled={viewOnly}
                                    error={!!errors.alto}
                                    helperText={errors.alto?.message}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="tipoMedidaID"
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label="Tipo Medida"
                                            size='medium'
                                            options={listaMedida}
                                            value={Number(field.value) || 0}
                                            onChange={(event) => field.onChange(Number(event.target.value))}
                                            error={!!errors.tipoMedidaID}
                                            helperText={errors.tipoMedidaID?.message}
                                            disabled={viewOnly}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="tipoCombustibleID"
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label="Combustible"
                                            size='medium'
                                            options={listaCombustible}
                                            value={Number(field.value) || 0}
                                            onChange={(event) => field.onChange(Number(event.target.value))}
                                            error={!!errors.tipoCombustibleID}
                                            helperText={errors.tipoCombustibleID?.message}
                                            disabled={viewOnly}
                                        />
                                    )}
                                />
                            </Grid>

                            {configEjesVisible ? (
                                <Grid size={{ xs: 12 }}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.info.main, 0.06),
                                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary">
                                            La configuración de ejes es obligatoria para unidades Tracto.
                                        </Typography>
                                    </Box>
                                </Grid>
                            ) : null}
                        </Grid>
                    </Box>
                </form>
            </TabPanel>

            <TabPanel value={activeTab} index={1} name="flota">
                {effectiveFlotaId ? (
                    <Box sx={{ px: 3, py: 3 }}>
                        <FlotaDocumentosList flotaId={effectiveFlotaId} viewOnly={viewOnly} />
                    </Box>
                ) : null}
            </TabPanel>
        </>
    );
}
