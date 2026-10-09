import { useEffect } from 'react';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Grid,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    BadgeOutlined,
    CalendarTodayOutlined,
    FitScreenOutlined,
    InfoOutlined,
    LocalGasStationOutlined,
    LocalShippingOutlined,
    RestartAlt,
    SaveOutlined,
    ScaleOutlined,
    Straighten,
    SwapHoriz,
    SwapVert,
    VerifiedOutlined,
} from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import type { SelectItem } from '@/shared/model/types';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { FlotaDocumentosList } from '../../documentos/ui/FlotaDocumentosList';
import type { CreateFlotaSchema } from '../../model/schema';
import type { useFlotaForm } from '../../hooks/useFlotaForm';
import { buildCodigoInterno, CONFIG_EJES_APLICA, isCarretaO4 } from '@entities/flota/model/constants';
import { PeruvianPlate } from '../../shared/ui/PeruvianPlate';
import { FlotaBalanzaBar } from '../../shared/ui/FlotaBalanzaBar';
import {
    convertLengthBetweenUnits,
    convertWeightBetweenUnits,
    resolveLengthUnitFromCode,
    resolveWeightUnitFromCode,
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
    onCancel?: () => void;
    isSubmitting?: boolean;
    isEdit?: boolean;
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
    onCancel,
    isSubmitting = false,
    isEdit = false,
}: FlotaCrudPageContentProps) {
    const theme = useTheme();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        getValues,
        formState: { errors, isDirty },
    } = form;

    const tipoFlota = Number(watch('tipoFlota')) || 0;
    const tipoPesoID = Number(watch('tipoPesoID')) || 0;
    const tipoMedidaID = Number(watch('tipoMedidaID')) || 0;
    const tipoCombustibleID = Number(watch('tipoCombustibleID')) || 0;
    const pesoBruto = Number(watch('pesoBruto')) || 0;
    const pesoNeto = Number(watch('pesoNeto')) || 0;
    const cargaUtil = Math.max(0, pesoBruto - pesoNeto);
    const configEjesVisible = CONFIG_EJES_APLICA.includes(tipoFlota);
    const camaUtilVisible = isCarretaO4(tipoFlota, listaFlota);
    const codigoInterno = flotaId ? buildCodigoInterno(tipoFlota, flotaId) : 'Se generará al guardar';

    const currentPlaca = watch('placa') || '';
    const currentEjes = Number(watch('ejes')) || 0;
    const currentTipoTexto = listaFlota.find((item) => item.id === tipoFlota)?.text || 'Unidad';

    // Unidad vigente derivada del código del catálogo seleccionado.
    const weightUnit: WeightUnit =
        resolveWeightUnitFromCode(listaPeso.find((option) => option.id === tipoPesoID)?.extra) ?? 'KG';
    const lengthUnit: LengthUnit =
        resolveLengthUnitFromCode(listaMedida.find((option) => option.id === tipoMedidaID)?.extra) ?? 'M';

    /** Cambia el tipo de peso y convierte los valores ya ingresados a la nueva unidad. */
    const handleWeightUnitChange = (nextId: number) => {
        if (nextId === tipoPesoID) return;
        const nextUnit = resolveWeightUnitFromCode(listaPeso.find((option) => option.id === nextId)?.extra) ?? 'KG';
        const bruto = Number(getValues('pesoBruto')) || 0;
        const tara = Number(getValues('pesoNeto')) || 0;
        setValue('pesoBruto', round2(convertWeightBetweenUnits(bruto, weightUnit, nextUnit)), { shouldDirty: true });
        setValue('pesoNeto', round2(convertWeightBetweenUnits(tara, weightUnit, nextUnit)), { shouldDirty: true });
        setValue('tipoPesoID', nextId, { shouldDirty: true, shouldValidate: true });
    };

    /** Cambia el tipo de medida y convierte las dimensiones ya ingresadas a la nueva unidad. */
    const handleLengthUnitChange = (nextId: number) => {
        if (nextId === tipoMedidaID) return;
        const nextUnit = resolveLengthUnitFromCode(listaMedida.find((option) => option.id === nextId)?.extra) ?? 'M';
        (['largo', 'ancho', 'alto', 'camaUtil'] as const).forEach((fieldName) => {
            const current = Number(getValues(fieldName)) || 0;
            setValue(fieldName, round2(convertLengthBetweenUnits(current, lengthUnit, nextUnit)), { shouldDirty: true });
        });
        setValue('tipoMedidaID', nextId, { shouldDirty: true, shouldValidate: true });
    };

    useEffect(() => {
        setValue('cargaUtil', round2(cargaUtil), { shouldDirty: false });
    }, [cargaUtil, setValue]);

    return (
        <>
            <TabPanel value={activeTab} index={0} name="flota">
                <form id="flota-form" onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, pb: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 2,
                                mb: 2.5,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    label={flotaId ? '● Unidad Activa' : '● Nueva Unidad'}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha('#10B981', 0.1),
                                        color: '#059669',
                                        fontWeight: 700,
                                        fontSize: '0.72rem',
                                        border: `1px solid ${alpha('#10B981', 0.25)}`,
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Header Banner Section */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                alignItems: { xs: 'flex-start', md: 'center' },
                                justifyContent: 'space-between',
                                gap: 2.5,
                                p: 2.5,
                                borderRadius: 3,
                                bgcolor: theme.palette.mode === 'dark' ? alpha('#1E293B', 0.6) : '#FFFFFF',
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                                mb: 3,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2.5,
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        color: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                                    }}
                                >
                                    <LocalShippingOutlined sx={{ fontSize: 32 }} />
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
                                            {flotaId ? 'Especificaciones Técnicas de la Unidad' : 'Registro de Especificaciones Técnicas'}
                                        </Typography>
                                        <Chip
                                            label={currentTipoTexto.toUpperCase()}
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                                color: 'primary.main',
                                                fontWeight: 800,
                                                fontSize: '0.68rem',
                                                letterSpacing: '0.04em',
                                                height: 22,
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Actualice las características mecánicas, configuración de ejes y balance de carga de la unidad.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Card 1: Identificación de la Unidad */}
                        <Box
                            sx={{
                                p: { xs: 2.5, md: 3 },
                                borderRadius: 3,
                                bgcolor: theme.palette.mode === 'dark' ? alpha('#1E293B', 0.6) : '#FFFFFF',
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                                mb: 3,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <BadgeOutlined sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700} color="text.primary">
                                        Identificación de la Unidad
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    Código Interno:{' '}
                                    <strong style={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                                        {codigoInterno}
                                    </strong>
                                </Typography>
                            </Box>

                            <Grid container spacing={2.5}>
                                {/* Placa con Live Preview */}
                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                                Placa de Rodaje
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: '0.68rem',
                                                    color: 'text.secondary',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.04em',
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                Oficial MTC
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <TextField
                                                fullWidth
                                                placeholder="3B5-693"
                                                disabled={viewOnly}
                                                {...register('placa')}
                                                error={!!errors.placa}
                                                helperText={errors.placa?.message}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <Typography
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    fontWeight: 800,
                                                                    mr: 1,
                                                                    fontSize: '1rem',
                                                                    fontFamily: 'monospace',
                                                                }}
                                                            >
                                                                #
                                                            </Typography>
                                                        ),
                                                        style: {
                                                            fontFamily: '"SF Mono", "Roboto Mono", Menlo, Consolas, monospace',
                                                            fontWeight: 700,
                                                            letterSpacing: '0.08em',
                                                            textTransform: 'uppercase',
                                                        },
                                                    },
                                                    htmlInput: {
                                                        maxLength: 8,
                                                    },
                                                }}
                                            />
                                            <Box sx={{ flexShrink: 0, height: '100%' }}>
                                                <PeruvianPlate placa={currentPlaca} size="md" />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Tipo de Unidad */}
                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            Tipo de Unidad
                                        </Typography>
                                        <Controller
                                            name="tipoFlota"
                                            control={control}
                                            render={({ field }) => (
                                                <FormSelect
                                                    label="Tipo de Unidad"
                                                    size="medium"
                                                    options={listaFlota}
                                                    value={Number(field.value) || 0}
                                                    onChange={(event) => {
                                                        const nextTipo = Number(event.target.value);
                                                        field.onChange(nextTipo);
                                                        if (!CONFIG_EJES_APLICA.includes(nextTipo)) {
                                                            setValue('configuracionEjesID', null, { shouldDirty: false });
                                                        }
                                                        if (!isCarretaO4(nextTipo, listaFlota)) {
                                                            setValue('camaUtil', 0, { shouldDirty: false });
                                                        }
                                                    }}
                                                    error={!!errors.tipoFlota}
                                                    helperText={errors.tipoFlota?.message}
                                                    disabled={viewOnly}
                                                />
                                            )}
                                        />
                                    </Box>
                                </Grid>

                                {/* Color Registrado con Preview Dot */}
                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            Color Registrado
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="Azul Corporativo"
                                            disabled={viewOnly}
                                            {...register('color')}
                                            error={!!errors.color}
                                            helperText={errors.color?.message}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <Box
                                                            sx={{
                                                                width: 14,
                                                                height: 14,
                                                                borderRadius: '50%',
                                                                bgcolor: '#2563EB',
                                                                mr: 1.25,
                                                                flexShrink: 0,
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                                                            }}
                                                        />
                                                    ),
                                                },
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                {/* Configuración de Ejes (Segmented Buttons + Input) */}
                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                                Configuración de Ejes
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {currentEjes} Ejes
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: 0.5,
                                                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                                                    p: 0.5,
                                                    borderRadius: 2,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    flex: 1,
                                                }}
                                            >
                                                {[2, 3, 4].map((num) => {
                                                    const isSelected = currentEjes === num;
                                                    return (
                                                        <Button
                                                            key={num}
                                                            size="small"
                                                            onClick={() => !viewOnly && setValue('ejes', num, { shouldDirty: true, shouldValidate: true })}
                                                            disabled={viewOnly}
                                                            sx={{
                                                                flex: 1,
                                                                py: 0.75,
                                                                borderRadius: 1.5,
                                                                fontWeight: 700,
                                                                fontSize: '0.8rem',
                                                                bgcolor: isSelected ? 'primary.main' : 'transparent',
                                                                color: isSelected ? 'primary.contrastText' : 'text.primary',
                                                                boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                                                                '&:hover': {
                                                                    bgcolor: isSelected ? 'primary.dark' : alpha(theme.palette.text.primary, 0.08),
                                                                },
                                                            }}
                                                        >
                                                            {num} Ejes
                                                        </Button>
                                                    );
                                                })}
                                            </Box>
                                            <TextField
                                                type="number"
                                                disabled={viewOnly}
                                                {...register('ejes')}
                                                error={!!errors.ejes}
                                                slotProps={{
                                                    htmlInput: {
                                                        min: 1,
                                                        max: 12,
                                                        style: { textAlign: 'center', fontWeight: 700, width: 44, padding: '8.5px 6px' },
                                                    },
                                                }}
                                                sx={{ width: 64 }}
                                            />
                                        </Box>
                                        {errors.ejes?.message ? (
                                            <Typography variant="caption" color="error">
                                                {errors.ejes.message}
                                            </Typography>
                                        ) : null}
                                    </Box>
                                </Grid>

                                {/* Año de Fabricación */}
                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            Año de Fabricación
                                        </Typography>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            disabled={viewOnly}
                                            {...register('anio')}
                                            error={!!errors.anio}
                                            helperText={errors.anio?.message}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <CalendarTodayOutlined sx={{ color: 'text.secondary', fontSize: 18, mr: 1 }} />
                                                    ),
                                                },
                                                htmlInput: {
                                                    min: 1980,
                                                    max: new Date().getFullYear() + 1,
                                                },
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                {/* Marca y Modelo Split */}
                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            Marca y Modelo
                                        </Typography>
                                        <Grid container spacing={1.5}>
                                            <Grid size={{ xs: 6 }}>
                                                <TextField
                                                    placeholder="VOLVO"
                                                    fullWidth
                                                    disabled={viewOnly}
                                                    {...register('marca')}
                                                    error={!!errors.marca}
                                                    helperText={errors.marca?.message}
                                                    slotProps={{
                                                        htmlInput: {
                                                            style: { textTransform: 'uppercase', fontWeight: 700 },
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <TextField
                                                    placeholder="B450"
                                                    fullWidth
                                                    disabled={viewOnly}
                                                    {...register('modelo')}
                                                    error={!!errors.modelo}
                                                    helperText={errors.modelo?.message}
                                                    slotProps={{
                                                        htmlInput: {
                                                            style: { textTransform: 'uppercase', fontWeight: 700 },
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>

                                {/* VIN */}
                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            Número de Serie / VIN
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="1HGBH41JXMN109186"
                                            disabled={viewOnly}
                                            {...register('vin')}
                                            error={!!errors.vin}
                                            helperText={errors.vin?.message || 'Identificación del chasis'}
                                            slotProps={{
                                                htmlInput: {
                                                    style: { fontFamily: 'monospace', textTransform: 'uppercase' },
                                                },
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                {/* Homologación MTC */}
                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            Homologación MTC
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="MTC-V26-9043"
                                            disabled={viewOnly}
                                            {...register('homologacionMtc')}
                                            error={!!errors.homologacionMtc}
                                            helperText={errors.homologacionMtc?.message || 'Certificado MTC'}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <VerifiedOutlined sx={{ color: 'text.secondary', fontSize: 18, mr: 1 }} />
                                                    ),
                                                },
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                {/* Configuración Ejes Tracto (si aplica) */}
                                {configEjesVisible ? (
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                                Configuración MTC (Tracto)
                                            </Typography>
                                            <Controller
                                                name="configuracionEjesID"
                                                control={control}
                                                render={({ field }) => (
                                                    <FormSelect
                                                        label="Configuración MTC (Tracto)"
                                                        size="medium"
                                                        options={listaConfigEjes}
                                                        value={Number(field.value) || 0}
                                                        onChange={(event) => field.onChange(Number(event.target.value))}
                                                        error={!!errors.configuracionEjesID}
                                                        helperText={errors.configuracionEjesID?.message}
                                                        disabled={viewOnly}
                                                    />
                                                )}
                                            />
                                        </Box>
                                    </Grid>
                                ) : null}
                            </Grid>
                        </Box>

                        {/* Card 2: Capacidad de Flete y Balanza de Pesos */}
                        <Box
                            sx={{
                                p: { xs: 2.5, md: 3 },
                                borderRadius: 3,
                                bgcolor: theme.palette.mode === 'dark' ? alpha('#1E293B', 0.6) : '#FFFFFF',
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                                mb: 3,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ScaleOutlined sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700} color="text.primary">
                                        Capacidad de Flete y Balanza de Pesos
                                    </Typography>
                                </Box>

                                {/* Toggle de Unidades de Peso */}
                                <ToggleButtonGroup
                                    value={tipoPesoID || false}
                                    exclusive
                                    size="small"
                                    onChange={(_, next) => {
                                        if (next == null) return;
                                        handleWeightUnitChange(Number(next));
                                    }}
                                    disabled={viewOnly}
                                    sx={{
                                        bgcolor: alpha(theme.palette.text.primary, 0.04),
                                        p: 0.5,
                                        borderRadius: 2,
                                        border: `1px solid ${theme.palette.divider}`,
                                        '& .MuiToggleButton-root': {
                                            border: 'none',
                                            borderRadius: '8px !important',
                                            px: 1.75,
                                            py: 0.5,
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                            color: 'text.secondary',
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.main',
                                                color: 'primary.contrastText',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                },
                                            },
                                        },
                                    }}
                                >
                                    {listaPeso.map((item) => (
                                        <ToggleButton key={item.id} value={item.id}>
                                            {item.text}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Box>

                            {/* 3 Metric Cards */}
                            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                                {/* Peso Bruto Vehicular (PBV) */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Box
                                        sx={{
                                            p: 2.25,
                                            borderRadius: 2.5,
                                            bgcolor: alpha(theme.palette.text.primary, 0.025),
                                            border: `1px solid ${theme.palette.divider}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1.25,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                                Peso Bruto Vehicular (PBV)
                                            </Typography>
                                            <Tooltip title="Límite máximo permitido en báscula por normativa MTC">
                                                <InfoOutlined sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                                            </Tooltip>
                                        </Box>
                                        <Controller
                                            name="pesoBruto"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    disabled={viewOnly}
                                                    value={Number(field.value) || 0}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        field.onChange(raw === '' ? 0 : Number(raw));
                                                    }}
                                                    error={!!errors.pesoBruto}
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: (
                                                                <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem' }}>
                                                                    {weightUnit}
                                                                </Typography>
                                                            ),
                                                            style: {
                                                                fontSize: '1.25rem',
                                                                fontWeight: 700,
                                                            },
                                                        },
                                                        htmlInput: { step: '0.01' },
                                                    }}
                                                />
                                            )}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            Límite reglamentario MTC para {currentEjes || 3} ejes
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Peso Neto / Tara */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Box
                                        sx={{
                                            p: 2.25,
                                            borderRadius: 2.5,
                                            bgcolor: alpha(theme.palette.text.primary, 0.025),
                                            border: `1px solid ${theme.palette.divider}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1.25,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                                Peso Neto / Tara
                                            </Typography>
                                            <Tooltip title="Peso de la unidad vacía sin carga comercial">
                                                <InfoOutlined sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                                            </Tooltip>
                                        </Box>
                                        <Controller
                                            name="pesoNeto"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    disabled={viewOnly}
                                                    value={Number(field.value) || 0}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        field.onChange(raw === '' ? 0 : Number(raw));
                                                    }}
                                                    error={!!errors.pesoNeto}
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: (
                                                                <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem' }}>
                                                                    {weightUnit}
                                                                </Typography>
                                                            ),
                                                            style: {
                                                                fontSize: '1.25rem',
                                                                fontWeight: 700,
                                                            },
                                                        },
                                                        htmlInput: { step: '0.01' },
                                                    }}
                                                />
                                            )}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            Peso del vehículo vacío en báscula
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Carga Útil Neta (Calculada) */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Box
                                        sx={{
                                            p: 2.25,
                                            borderRadius: 2.5,
                                            bgcolor: alpha('#10B981', 0.08),
                                            border: `1px solid ${alpha('#10B981', 0.25)}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1.25,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: '#047857' }}>
                                                Carga Útil Neta
                                            </Typography>
                                            <Chip
                                                label="AUTOMÁTICO"
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha('#10B981', 0.2),
                                                    color: '#047857',
                                                    fontWeight: 800,
                                                    fontSize: '0.62rem',
                                                    height: 20,
                                                }}
                                            />
                                        </Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                px: 1.75,
                                                height: 56,
                                                borderRadius: 1,
                                                bgcolor: 'background.paper',
                                                border: `1px solid ${alpha('#10B981', 0.2)}`,
                                            }}
                                        >
                                            <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                                                {round2(cargaUtil).toLocaleString('es-PE')}
                                            </Typography>
                                            <Typography sx={{ fontWeight: 800, color: '#059669', fontSize: '0.85rem' }}>
                                                {weightUnit}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#047857' }}>
                                            Flete útil disponible (PBV − Tara)
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Balanza Visual Horizontal */}
                            <FlotaBalanzaBar
                                pesoBruto={pesoBruto}
                                pesoNeto={pesoNeto}
                                cargaUtil={cargaUtil}
                                mode="detailed"
                                unit={weightUnit}
                            />
                        </Box>

                        {/* Card 3: Dimensiones Físicas y Combustible */}
                        <Box
                            sx={{
                                p: { xs: 2.5, md: 3 },
                                borderRadius: 3,
                                bgcolor: theme.palette.mode === 'dark' ? alpha('#1E293B', 0.6) : '#FFFFFF',
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                                mb: 3,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Straighten sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700} color="text.primary">
                                        Dimensiones Físicas y Combustible
                                    </Typography>
                                </Box>

                                {/* Toggle de Unidad de Longitud */}
                                <ToggleButtonGroup
                                    value={tipoMedidaID || false}
                                    exclusive
                                    size="small"
                                    onChange={(_, next) => {
                                        if (next == null) return;
                                        handleLengthUnitChange(Number(next));
                                    }}
                                    disabled={viewOnly}
                                    sx={{
                                        bgcolor: alpha(theme.palette.text.primary, 0.04),
                                        p: 0.5,
                                        borderRadius: 2,
                                        border: `1px solid ${theme.palette.divider}`,
                                        '& .MuiToggleButton-root': {
                                            border: 'none',
                                            borderRadius: '8px !important',
                                            px: 1.75,
                                            py: 0.5,
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                            color: 'text.secondary',
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.main',
                                                color: 'primary.contrastText',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                },
                                            },
                                        },
                                    }}
                                >
                                    {listaMedida.map((item) => (
                                        <ToggleButton key={item.id} value={item.id}>
                                            {item.text}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Box>

                            {/* Fila 1: Dimensiones */}
                            <Grid container spacing={2.5}>
                                {/* Largo Total */}
                                <Grid size={{ xs: 12, sm: 6, md: camaUtilVisible ? 3 : 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                                Largo Total
                                            </Typography>
                                            <SwapHoriz sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        </Box>
                                        <Controller
                                            name="largo"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    disabled={viewOnly}
                                                    value={Number(field.value) || 0}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        field.onChange(raw === '' ? 0 : Number(raw));
                                                    }}
                                                    error={!!errors.largo}
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: (
                                                                <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>
                                                                    {lengthUnit.toLowerCase()}
                                                                </Typography>
                                                            ),
                                                            style: { fontWeight: 600 },
                                                        },
                                                        htmlInput: { step: '0.01' },
                                                    }}
                                                />
                                            )}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            Longitud de plataforma
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Ancho Total */}
                                <Grid size={{ xs: 12, sm: 6, md: camaUtilVisible ? 3 : 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                                Ancho Total
                                            </Typography>
                                            <FitScreenOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        </Box>
                                        <Controller
                                            name="ancho"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    disabled={viewOnly}
                                                    value={Number(field.value) || 0}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        field.onChange(raw === '' ? 0 : Number(raw));
                                                    }}
                                                    error={!!errors.ancho}
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: (
                                                                <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>
                                                                    {lengthUnit.toLowerCase()}
                                                                </Typography>
                                                            ),
                                                            style: { fontWeight: 600 },
                                                        },
                                                        htmlInput: { step: '0.01' },
                                                    }}
                                                />
                                            )}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            Incluye solapas de ensanche
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Altura Plataforma */}
                                <Grid size={{ xs: 12, sm: 6, md: camaUtilVisible ? 3 : 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                                Altura Plataforma
                                            </Typography>
                                            <SwapVert sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        </Box>
                                        <Controller
                                            name="alto"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    disabled={viewOnly}
                                                    value={Number(field.value) || 0}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        field.onChange(raw === '' ? 0 : Number(raw));
                                                    }}
                                                    error={!!errors.alto}
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: (
                                                                <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>
                                                                    {lengthUnit.toLowerCase()}
                                                                </Typography>
                                                            ),
                                                            style: { fontWeight: 600 },
                                                        },
                                                        htmlInput: { step: '0.01' },
                                                    }}
                                                />
                                            )}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            Despeje de cuello de cisne
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Cama Útil (solo si aplica Carreta O4) */}
                                {camaUtilVisible ? (
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                                    Cama Útil
                                                </Typography>
                                                <Straighten sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            </Box>
                                            <Controller
                                                name="camaUtil"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        fullWidth
                                                        type="number"
                                                        disabled={viewOnly}
                                                        value={Number(field.value) || 0}
                                                        onChange={(e) => {
                                                            const raw = e.target.value;
                                                            field.onChange(raw === '' ? 0 : Number(raw));
                                                        }}
                                                        error={!!errors.camaUtil}
                                                        slotProps={{
                                                            input: {
                                                                endAdornment: (
                                                                    <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>
                                                                        {lengthUnit.toLowerCase()}
                                                                    </Typography>
                                                                ),
                                                                style: { fontWeight: 600 },
                                                            },
                                                            htmlInput: { step: '0.01' },
                                                        }}
                                                    />
                                                )}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                Longitud útil de la carreta
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ) : null}
                            </Grid>

                            {/* Fila 2: Combustible (en fila separada según requerimiento) */}
                            <Box sx={{ mt: 3, pt: 2.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
                                <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocalGasStationOutlined sx={{ color: 'primary.main', fontSize: 20 }} />
                                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                        Combustible Primario
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                        (Seleccione el tipo de motorización o combustible)
                                    </Typography>
                                </Box>

                                <ToggleButtonGroup
                                    value={tipoCombustibleID || false}
                                    exclusive
                                    size="small"
                                    onChange={(_, next) => {
                                        if (next == null) return;
                                        setValue('tipoCombustibleID', Number(next), {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        });
                                    }}
                                    disabled={viewOnly}
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                        bgcolor: 'transparent',
                                        '& .MuiToggleButtonGroup-grouped': {
                                            border: `1px solid ${theme.palette.divider} !important`,
                                            borderRadius: '8px !important',
                                            px: 2,
                                            py: 0.75,
                                            fontWeight: 600,
                                            fontSize: '0.82rem',
                                            color: 'text.secondary',
                                            bgcolor: alpha(theme.palette.text.primary, 0.02),
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.main',
                                                color: 'primary.contrastText',
                                                borderColor: 'primary.main !important',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                },
                                            },
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.text.primary, 0.05),
                                            },
                                        },
                                    }}
                                >
                                    {listaCombustible.map((item) => (
                                        <ToggleButton key={item.id} value={item.id}>
                                            {item.text}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>

                                {errors.tipoCombustibleID?.message ? (
                                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                                        {errors.tipoCombustibleID.message}
                                    </Typography>
                                ) : null}

                                {configEjesVisible ? (
                                    <Box
                                        sx={{
                                            mt: 2,
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.info.main, 0.06),
                                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary">
                                            ℹ️ La configuración de ejes es obligatoria para unidades Tracto homologadas por el MTC.
                                        </Typography>
                                    </Box>
                                ) : null}
                            </Box>
                        </Box>

                        {/* Sticky Bottom Actions Panel */}
                        <Box
                            sx={{
                                position: 'sticky',
                                bottom: 16,
                                zIndex: 20,
                                bgcolor: theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF',
                                borderRadius: 3,
                                border: `1px solid ${theme.palette.divider}`,
                                p: 2,
                                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.45)' : '0 4px 20px rgba(0,0,0,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 2,
                                mt: 3,
                            }}
                        >
                            <Button
                                startIcon={<RestartAlt sx={{ fontSize: 20 }} />}
                                onClick={() => form.reset()}
                                variant="text"
                                color="inherit"
                                disabled={viewOnly || isSubmitting}
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                    '&:hover': { color: 'text.primary' },
                                }}
                            >
                                Descartar Cambios
                            </Button>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={onCancel || (() => window.history.back())}
                                    disabled={isSubmitting}
                                    sx={{ fontWeight: 600, px: 2.5, borderRadius: 2 }}
                                >
                                    Cancelar
                                </Button>

                                {!viewOnly ? (
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={isSubmitting || (isEdit && !isDirty)}
                                        startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SaveOutlined sx={{ fontSize: 20 }} />}
                                        sx={{
                                            fontWeight: 700,
                                            px: 3,
                                            borderRadius: 2,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        }}
                                    >
                                        {isSubmitting ? 'Guardando...' : 'Guardar Especificaciones'}
                                    </Button>
                                ) : null}
                            </Box>
                        </Box>
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
