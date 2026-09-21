import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Grid,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Paper,
    Chip,
    IconButton,
    InputAdornment,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Search as SearchIcon,
    LocalShipping as LocalShippingIcon,
    Schedule as ScheduleIcon,
    Close as CloseIcon,
    InfoOutlined as InfoOutlinedIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import { useForm, Controller, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
    buildCreateFacturaDetallePayload,
    buildFacturaDetalleDefaultValues,
    calculateSobrestadiaDias,
    createFacturaDetalleSchema,
    type CreateFacturaDetalleForm,
    type CreateFacturaDetalleFormInput,
} from '../../model/schema';
import { useCreateFacturaDetalle } from '../../hooks/useFacturaDetalleCrud';
import { ViajeSelectorModal } from './ViajeSelectorModal';
import { FacturaDetalleConceptoSelector } from './FacturaDetalleConceptoSelector';
import { FacturaDetalleLiquidacionSection } from './FacturaDetalleLiquidacionSection';
import { FacturaDetalleMonedaHeredada } from './FacturaDetalleMonedaHeredada';
import { FacturaDetalleSectionHeader } from './FacturaDetalleSectionHeader';
import { useFacturaDetalleFlotaOptions } from '../hooks/useFacturaDetalleFlotaOptions';
import { useFacturaDetalleTipoOptions } from '../hooks/useFacturaDetalleTipoOptions';
import type { FacturaDetalleViajeOption } from '@/entities/factura/model/types';
import type { Moneda } from '@/entities/moneda/model/types';
import { TIPO_DETALLE_CODES, TIPO_DETALLE_LABELS, type TipoDetalleCodigo } from '@entities/factura/model/constants';
import { monedaApi } from '@entities/moneda/api/moneda.api';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';
import { handleBackendErrors } from '@/shared/utils/form-validation';
import { resolveCurrencyDisplay } from '@/shared/utils/format-utils';

interface FacturaDetalleFormProps {
    open: boolean;
    onClose: () => void;
    facturaId: number;
    monedaId: number;
    clienteId: number;
    moneda?: Moneda;
}

export function FacturaDetalleForm({
    open,
    onClose,
    facturaId,
    monedaId,
    clienteId,
    moneda,
}: FacturaDetalleFormProps) {
    const theme = useTheme();
    const createMutation = useCreateFacturaDetalle();
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectedViajeText, setSelectedViajeText] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const defaultValues = useMemo(() => buildFacturaDetalleDefaultValues(monedaId), [monedaId]);

    const { control, handleSubmit, reset, setValue, setError, clearErrors, trigger, formState: { errors } } = useForm<CreateFacturaDetalleFormInput, unknown, CreateFacturaDetalleForm>({
        resolver: zodResolver(createFacturaDetalleSchema),
        defaultValues,
    });

    const concepto = useWatch({ control, name: 'concepto' });
    const isSobrestadia = concepto === TIPO_DETALLE_CODES.SOBRESTADIA;
    const fechaInicioSobrestadia = useWatch({ control, name: 'fechaInicioSobrestadia' });
    const fechaFinSobrestadia = useWatch({ control, name: 'fechaFinSobrestadia' });
    const diasSobrestadia = useWatch({ control, name: 'diasSobrestadia' });

    const { resolveTipoDetalleId, getTipoDetalleLabel, isLoading: isLoadingTipos } = useFacturaDetalleTipoOptions();
    const getConceptoLabel = useMemo(
        () => (codigo: TipoDetalleCodigo) => getTipoDetalleLabel(codigo) ?? TIPO_DETALLE_LABELS[codigo],
        [getTipoDetalleLabel]
    );
    const {
        options: flotaOptions,
        isLoading: isLoadingFlotas,
        errorMessage: flotaOptionsError,
    } = useFacturaDetalleFlotaOptions(open && isSobrestadia);

    useEffect(() => {
        if (open) {
            reset(defaultValues);

            const resetUiTimer = window.setTimeout(() => {
                setSelectedViajeText('');
                setErrorMessage(null);
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [defaultValues, open, reset]);

    // La sobreestadía calcula sus días de forma inclusiva (fin - inicio + 1).
    useEffect(() => {
        if (!isSobrestadia) {
            return;
        }

        const dias = calculateSobrestadiaDias(fechaInicioSobrestadia, fechaFinSobrestadia);
        setValue('diasSobrestadia', dias, {
            shouldValidate: dias !== null,
            shouldDirty: dias !== null,
        });
    }, [fechaInicioSobrestadia, fechaFinSobrestadia, isSobrestadia, setValue]);

    const { data: monedas } = useQuery({
        queryKey: ['monedas'],
        queryFn: () => monedaApi.getSelect()
    });

    const selectedMoneda = useMemo(() => {
        if (moneda) return moneda;
        return monedas?.find((m) => m.id === monedaId);
    }, [moneda, monedas, monedaId]);

    const formattedCurrencyName = useMemo(() => {
        if (selectedMoneda) {
            if ('nombre' in selectedMoneda) {
                const { nombre, codigo, simbolo } = selectedMoneda;
                if (codigo && simbolo) {
                    return `${nombre} (${codigo} - ${simbolo})`;
                }
                if (simbolo) {
                    return `${nombre} (${simbolo})`;
                }
                return nombre;
            }

            return selectedMoneda.text;
        }
        return resolveCurrencyDisplay(moneda);
    }, [selectedMoneda, moneda]);

    const currencyDisplay = resolveCurrencyDisplay(moneda);

    // Estado visual para el chip de la métrica de días
    const daysMetricStatus = useMemo(() => {
        if (!fechaInicioSobrestadia && !fechaFinSobrestadia) {
            return {
                type: 'idle' as const,
                text: 'Sin fechas seleccionadas',
            };
        }
        if (!fechaInicioSobrestadia || !fechaFinSobrestadia) {
            return {
                type: 'pending' as const,
                text: 'Requiere ambas fechas',
            };
        }
        if (diasSobrestadia === null || diasSobrestadia === undefined) {
            return {
                type: 'error' as const,
                text: 'Fechas inconsistentes',
            };
        }
        return {
            type: 'success' as const,
            text: 'Calculado automático',
        };
    }, [fechaInicioSobrestadia, fechaFinSobrestadia, diasSobrestadia]);

    const handleConceptoChange = (next: TipoDetalleCodigo) => {
        if (next === concepto) {
            return;
        }

        setValue('concepto', next, { shouldDirty: true, shouldValidate: false });

        if (next === TIPO_DETALLE_CODES.SOBRESTADIA) {
            setValue('viajeID', 0, { shouldDirty: true, shouldValidate: false });
            setSelectedViajeText('');
        } else {
            setValue('flotaID', 0, { shouldDirty: true, shouldValidate: false });
            setValue('fechaInicioSobrestadia', '', { shouldDirty: true, shouldValidate: false });
            setValue('fechaFinSobrestadia', '', { shouldDirty: true, shouldValidate: false });
            setValue('diasSobrestadia', null, { shouldDirty: true, shouldValidate: false });
        }

        // Evita mostrar errores prematuros (p. ej. monto mínimo) al solo cambiar de concepto.
        clearErrors(['viajeID', 'flotaID', 'fechaInicioSobrestadia', 'fechaFinSobrestadia', 'diasSobrestadia', 'descripcion']);
    };

    const handleViajeSelect = (viaje: FacturaDetalleViajeOption) => {
        setValue('viajeID', viaje.viajeID);
        setSelectedViajeText(`Viaje: ${viaje.codigo}, Placa: ${viaje.tractoPlaca}, (${viaje.origenDescripcion} - ${viaje.destinoDescripcion})`);
        setValue('descripcion', viaje.descripcionDetalleSugerida, { shouldValidate: true });
    };

    const onSubmit: SubmitHandler<CreateFacturaDetalleForm> = async (data) => {
        setErrorMessage(null);

        const tipoDetalleId = resolveTipoDetalleId(data.concepto);
        if (!tipoDetalleId) {
            setErrorMessage(
                isLoadingTipos
                    ? 'Cargando tipos de detalle, intente nuevamente en un momento.'
                    : 'No se pudo resolver el tipo de detalle desde el catálogo. Verifique la configuración del maestro e intente nuevamente.'
            );
            return;
        }

        try {
            await createMutation.mutateAsync({
                facturaId,
                data: buildCreateFacturaDetallePayload(data, tipoDetalleId),
            });
            onClose();
        } catch (error) {
            const genericError = handleBackendErrors<CreateFacturaDetalleFormInput>(error, setError);
            if (genericError) {
                setErrorMessage(genericError);
            }
        }
    };

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (reason === 'backdropClick') return;
                onClose();
            }}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3.5,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden',
                }
            }}
        >
            {/* BEGIN: ModalHeader */}
            <DialogTitle sx={{
                p: { xs: 2.5, sm: 3 },
                pb: 2,
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2.5,
                        bgcolor: isSobrestadia ? alpha(theme.palette.warning.main, 0.12) : alpha(theme.palette.primary.main, 0.08),
                        border: 1,
                        borderColor: isSobrestadia ? alpha(theme.palette.warning.main, 0.4) : alpha(theme.palette.primary.main, 0.2),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSobrestadia ? theme.palette.warning.dark : 'primary.main',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    }}>
                        {isSobrestadia ? (
                            <ScheduleIcon sx={{ fontSize: 24 }} />
                        ) : (
                            <LocalShippingIcon sx={{ fontSize: 24 }} />
                        )}
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.2 }}>
                            Agregar Detalle de Factura
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            Gestión de cargos operativos y sobreestadías
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="small"
                    aria-label="Cerrar modal"
                    sx={{
                        color: 'text.secondary',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            color: 'text.primary',
                        }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            {/* END: ModalHeader */}

            {/* BEGIN: ModalBody */}
            <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, overflowY: 'auto', maxHeight: 'calc(88vh - 130px)' }}>
                <Box
                    component="form"
                    id="detalle-form"
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}
                >
                    {errorMessage && (
                        <Alert severity="error" onClose={() => setErrorMessage(null)}>
                            {errorMessage}
                        </Alert>
                    )}

                    {/* SECTION A: TIPO DE CONCEPTO */}
                    <FacturaDetalleConceptoSelector
                        value={concepto}
                        onChange={handleConceptoChange}
                        getLabel={getConceptoLabel}
                    />

                    {/* SECTION B: DATOS OPERATIVOS */}
                    {isSobrestadia ? (
                        /* SECTION B SOBRESTADÍA: Estructura Modular 3 Columnas y Métrica de Días */
                        <Paper
                            elevation={0}
                            component="section"
                            sx={{
                                p: { xs: 2.5, sm: 3 },
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.background.default, 0.65),
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2.5,
                            }}
                        >
                            {/* Subheader Sección B */}
                            <FacturaDetalleSectionHeader index={1} title="Datos Operativos de la Sobrestadía" />

                            {/* Fila 1: Grid Armonioso 3 Campos (Tracto 50%, Fecha Inicio 25%, Fecha Fin 25%) */}
                            <Grid container spacing={2}>
                                {/* Campo 1: Tracto / Carreta (50% = 6 cols) */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            Tracto / Carreta
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', textTransform: 'lowercase' }}>
                                            (opcional)
                                        </Typography>
                                    </Box>
                                    <Controller
                                        name="flotaID"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <TextField
                                                {...field}
                                                value={field.value ?? 0}
                                                select
                                                fullWidth
                                                size="small"
                                                error={!!error}
                                                disabled={isLoadingFlotas}
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                    }
                                                }}
                                            >
                                                <MenuItem value={0}>Sin asignar</MenuItem>
                                                {flotaOptions.map((flota) => (
                                                    <MenuItem key={flota.id} value={flota.id}>
                                                        {flota.text}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                                        <InfoOutlinedIcon sx={{ fontSize: 14, color: flotaOptionsError ? 'error.main' : 'text.disabled', flexShrink: 0 }} />
                                        <Typography
                                            variant="caption"
                                            color={flotaOptionsError ? 'error.main' : 'text.secondary'}
                                            sx={{ fontSize: '0.725rem' }}
                                        >
                                            {isLoadingFlotas
                                                ? 'Cargando unidades...'
                                                : flotaOptionsError ?? 'Asocie la unidad que sufrió la demora'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Campo 2: Fecha Inicio (25% = 3 cols) */}
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        Fecha Inicio
                                    </Typography>
                                    <Controller
                                        name="fechaInicioSobrestadia"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormDatePicker
                                                label=""
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                error={!!error}
                                                helperText={error?.message}
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>

                                {/* Campo 3: Fecha Fin (25% = 3 cols) */}
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        Fecha Fin
                                    </Typography>
                                    <Controller
                                        name="fechaFinSobrestadia"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormDatePicker
                                                label=""
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                error={!!error}
                                                helperText={error?.message}
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            {/* Fila 2: Días Computados (25% = 3 cols) + Descripción Sustento (75% = 9 cols) */}
                            <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
                                {/* Badge / Tarjeta Métrica de Días Computados */}
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            height: '100%',
                                            minHeight: 128,
                                            borderRadius: 2.5,
                                            border: 1,
                                            borderColor: 'divider',
                                            bgcolor: 'background.paper',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                                        }}
                                    >
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.675rem' }}>
                                            Días de Demora
                                        </Typography>
                                        <Box sx={{ my: 0.75, display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: '2.5rem',
                                                    fontWeight: 900,
                                                    lineHeight: 1,
                                                    color: daysMetricStatus.type === 'error' ? 'error.main' : 'primary.main',
                                                    fontFamily: 'monospace',
                                                }}
                                            >
                                                {diasSobrestadia !== null && diasSobrestadia !== undefined ? diasSobrestadia : '0'}
                                            </Typography>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                                días
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.75,
                                                px: 1.25,
                                                py: 0.35,
                                                borderRadius: 99,
                                                fontSize: '0.675rem',
                                                fontWeight: 600,
                                                bgcolor:
                                                    daysMetricStatus.type === 'success'
                                                        ? alpha(theme.palette.success.main, 0.12)
                                                        : daysMetricStatus.type === 'error'
                                                            ? alpha(theme.palette.error.main, 0.08)
                                                            : 'action.hover',
                                                color:
                                                    daysMetricStatus.type === 'success'
                                                        ? theme.palette.success.dark
                                                        : daysMetricStatus.type === 'error'
                                                            ? theme.palette.error.dark
                                                            : 'text.secondary',
                                                border: 1,
                                                borderColor:
                                                    daysMetricStatus.type === 'success'
                                                        ? alpha(theme.palette.success.main, 0.35)
                                                        : daysMetricStatus.type === 'error'
                                                            ? alpha(theme.palette.error.main, 0.3)
                                                            : 'divider',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    bgcolor:
                                                        daysMetricStatus.type === 'success'
                                                            ? theme.palette.success.main
                                                            : daysMetricStatus.type === 'error'
                                                                ? theme.palette.error.main
                                                                : 'text.disabled',
                                                }}
                                            />
                                            {daysMetricStatus.text}
                                        </Box>
                                        {errors.diasSobrestadia?.message && (
                                            <Typography variant="caption" color="error.main" sx={{ mt: 0.5, fontSize: '0.675rem' }}>
                                                {errors.diasSobrestadia.message}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>

                                {/* Textarea Descripción / Sustento */}
                                <Grid size={{ xs: 12, md: 9 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            Descripción / Sustento del Detalle <Typography component="span" color="error.main">*</Typography>
                                        </Typography>
                                        <Chip
                                            label="Requerido"
                                            size="small"
                                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'action.hover', color: 'text.secondary' }}
                                        />
                                    </Box>
                                    <Controller
                                        name="descripcion"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <TextField
                                                {...field}
                                                value={field.value ?? ''}
                                                fullWidth
                                                multiline
                                                rows={4}
                                                required
                                                placeholder="Especifique el motivo detallado de la sobreestadía (ej. demora en descarga en almacén cliente, trámite de balanza, etc.)..."
                                                error={!!error}
                                                helperText={error?.message}
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            {/* Fila 3: Selector Moneda Heredada */}
                            <FacturaDetalleMonedaHeredada currencyName={formattedCurrencyName} />
                        </Paper>
                    ) : (
                        /* SECTION B FLETE: Selección de Viaje y Descripción */
                        <Paper
                            elevation={0}
                            component="section"
                            sx={{
                                p: { xs: 2.5, sm: 3 },
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.background.default, 0.65),
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2.5,
                            }}
                        >
                            <FacturaDetalleSectionHeader index={1} title="Datos Operativos del Flete" />

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            Seleccionar Viaje <Typography component="span" color="error.main">*</Typography>
                                        </Typography>
                                        <Chip
                                            label="Requerido"
                                            size="small"
                                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'action.hover', color: 'text.secondary' }}
                                        />
                                    </Box>
                                    <Controller
                                        name="viajeID"
                                        control={control}
                                        render={({ field, fieldState: { error, isTouched } }) => (
                                            <TextField
                                                fullWidth
                                                placeholder="Haga clic para buscar y asociar un viaje..."
                                                value={selectedViajeText || ''}
                                                error={!!error || (isTouched && !field.value)}
                                                helperText={error?.message || (isTouched && !field.value ? 'Debe seleccionar un viaje' : '')}
                                                onClick={() => setIsSelectorOpen(true)}
                                                slotProps={{
                                                    input: {
                                                        readOnly: true,
                                                        sx: { cursor: 'pointer', bgcolor: 'background.paper', borderRadius: 2 },
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <SearchIcon color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            Descripción / Detalles Adicionales
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', textTransform: 'lowercase' }}>
                                            (opcional)
                                        </Typography>
                                    </Box>
                                    <Controller
                                        name="descripcion"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <TextField
                                                {...field}
                                                value={field.value ?? ''}
                                                fullWidth
                                                multiline
                                                rows={3}
                                                placeholder="Detalles adicionales del flete..."
                                                error={!!error}
                                                helperText={error?.message}
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            {/* Moneda heredada */}
                            <FacturaDetalleMonedaHeredada currencyName={formattedCurrencyName} />
                        </Paper>
                    )}

                    {/* SECTION C: LIQUIDACIÓN ECONÓMICA */}
                    <FacturaDetalleLiquidacionSection
                        control={control}
                        setValue={setValue}
                        trigger={trigger}
                        errors={errors}
                        currencyDisplay={currencyDisplay}
                    />
                </Box>
            </DialogContent>
            {/* END: ModalBody */}

            {/* BEGIN: ModalFooter */}
            <DialogActions sx={{
                p: { xs: 2, sm: 2.5 },
                px: { xs: 2.5, sm: 3.5 },
                bgcolor: alpha(theme.palette.text.primary, 0.02),
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 1.5,
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    color="inherit"
                    fullWidth={false}
                    sx={{
                        borderRadius: 2.5,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        borderColor: 'divider',
                        color: 'text.secondary',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'text.secondary',
                        }
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    form="detalle-form"
                    variant="contained"
                    disabled={createMutation.isPending}
                    startIcon={<CheckCircleOutlineIcon />}
                    sx={{
                        borderRadius: 2.5,
                        px: 3.5,
                        py: 1,
                        fontWeight: 700,
                        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {createMutation.isPending ? 'Guardando...' : 'Confirmar Registro'}
                </Button>
            </DialogActions>
            {/* END: ModalFooter */}

            <ViajeSelectorModal
                open={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                clienteId={clienteId}
                onSelect={handleViajeSelect}
            />
        </Dialog>
    );
}
