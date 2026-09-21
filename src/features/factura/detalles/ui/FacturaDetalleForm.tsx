import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    MenuItem,
    Checkbox,
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
    calculateFacturaDetalleIgv,
    calculateFacturaDetalleSubtotalFromTotal,
    calculateFacturaDetalleTotal,
    calculateSobrestadiaDias,
    createFacturaDetalleSchema,
    roundFacturaDetalleAmount,
    type CreateFacturaDetalleForm,
    type CreateFacturaDetalleFormInput,
} from '../../model/schema';
import { useCreateFacturaDetalle } from '../../hooks/useFacturaDetalleCrud';
import { ViajeSelectorModal } from './ViajeSelectorModal';
import { useFacturaDetalleFlotaOptions } from '../hooks/useFacturaDetalleFlotaOptions';
import { useFacturaDetalleTipoOptions } from '../hooks/useFacturaDetalleTipoOptions';
import type { FacturaDetalleViajeOption } from '@/entities/factura/model/types';
import type { Moneda } from '@/entities/moneda/model/types';
import { IGV_RATE, TIPO_DETALLE_CODES, TIPO_DETALLE_LABELS, type TipoDetalleCodigo } from '@entities/factura/model/constants';
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
    const [subtotalInputValue, setSubtotalInputValue] = useState('');
    const [isEditingSubtotal, setIsEditingSubtotal] = useState(false);
    const [hasEditedSubtotal, setHasEditedSubtotal] = useState(false);
    const [totalInputValue, setTotalInputValue] = useState('');
    const [isEditingTotal, setIsEditingTotal] = useState(false);
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

    const { resolveTipoDetalleId } = useFacturaDetalleTipoOptions();
    const { options: flotaOptions, isLoading: isLoadingFlotas } = useFacturaDetalleFlotaOptions(open && isSobrestadia);

    const subTotal = useWatch({ control, name: 'subTotal', defaultValue: 0 });
    const applyIgv = true;
    const displayTotal = useMemo(
        () => calculateFacturaDetalleTotal(Number(subTotal) || 0, applyIgv),
        [applyIgv, subTotal]
    );
    const displayIgv = useMemo(
        () => calculateFacturaDetalleIgv(Number(subTotal) || 0, applyIgv),
        [applyIgv, subTotal]
    );
    const displaySubTotal = useMemo(
        () => roundFacturaDetalleAmount(displayTotal - displayIgv),
        [displayIgv, displayTotal]
    );
    const displayedSubtotalValue = isEditingSubtotal
        ? subtotalInputValue
        : (displayTotal === 0 ? '' : displaySubTotal.toFixed(2));
    const displayedTotalValue = isEditingTotal
        ? totalInputValue
        : (displayTotal === 0 ? '' : displayTotal.toFixed(2));

    useEffect(() => {
        if (open) {
            reset(defaultValues);

            const resetUiTimer = window.setTimeout(() => {
                setSelectedViajeText('');
                setSubtotalInputValue('');
                setIsEditingSubtotal(false);
                setHasEditedSubtotal(false);
                setTotalInputValue('');
                setIsEditingTotal(false);
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
            const nombre = selectedMoneda.nombre;
            const codigo = 'codigo' in selectedMoneda ? selectedMoneda.codigo : undefined;
            const simbolo = 'simbolo' in selectedMoneda ? selectedMoneda.simbolo : undefined;
            if (codigo && simbolo) {
                return `${nombre} (${codigo} - ${simbolo})`;
            }
            if (simbolo) {
                return `${nombre} (${simbolo})`;
            }
            return nombre;
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

    const handleConceptoChange = (_: MouseEvent<HTMLElement>, next: TipoDetalleCodigo | null) => {
        if (!next || next === concepto) {
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
        const tipoDetalleId = resolveTipoDetalleId(data.concepto);

        try {
            await createMutation.mutateAsync({
                facturaId,
                data: buildCreateFacturaDetallePayload(data, tipoDetalleId),
            });
            onClose();
        } catch (error) {
            handleBackendErrors<CreateFacturaDetalleFormInput>(error, setError);
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
                        bgcolor: isSobrestadia ? '#fffbeb' : alpha(theme.palette.primary.main, 0.08),
                        border: 1,
                        borderColor: isSobrestadia ? '#fde68a' : alpha(theme.palette.primary.main, 0.2),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSobrestadia ? '#d97706' : 'primary.main',
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
                    {/* SECTION A: TIPO DE CONCEPTO */}
                    <Box component="section">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                Sección A • Tipo de Concepto
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                Selecciona la naturaleza del ítem
                            </Typography>
                        </Box>
                        <Box sx={{
                            p: 0.75,
                            bgcolor: alpha(theme.palette.text.primary, 0.04),
                            borderRadius: 2.5,
                            border: 1,
                            borderColor: 'divider',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 1,
                        }}>
                            <Button
                                type="button"
                                onClick={(e) => handleConceptoChange(e, TIPO_DETALLE_CODES.FLETE)}
                                startIcon={<LocalShippingIcon fontSize="small" />}
                                sx={{
                                    py: 1.25,
                                    borderRadius: 2,
                                    fontWeight: concepto === TIPO_DETALLE_CODES.FLETE ? 700 : 500,
                                    color: concepto === TIPO_DETALLE_CODES.FLETE ? 'primary.main' : 'text.secondary',
                                    bgcolor: concepto === TIPO_DETALLE_CODES.FLETE ? 'background.paper' : 'transparent',
                                    boxShadow: concepto === TIPO_DETALLE_CODES.FLETE ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
                                    border: 1,
                                    borderColor: concepto === TIPO_DETALLE_CODES.FLETE ? alpha(theme.palette.primary.main, 0.25) : 'transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: concepto === TIPO_DETALLE_CODES.FLETE ? 'background.paper' : 'action.hover',
                                    }
                                }}
                            >
                                {TIPO_DETALLE_LABELS.FLETE}
                            </Button>
                            <Button
                                type="button"
                                onClick={(e) => handleConceptoChange(e, TIPO_DETALLE_CODES.SOBRESTADIA)}
                                startIcon={<ScheduleIcon fontSize="small" />}
                                sx={{
                                    py: 1.25,
                                    borderRadius: 2,
                                    fontWeight: concepto === TIPO_DETALLE_CODES.SOBRESTADIA ? 700 : 500,
                                    color: concepto === TIPO_DETALLE_CODES.SOBRESTADIA ? 'primary.main' : 'text.secondary',
                                    bgcolor: concepto === TIPO_DETALLE_CODES.SOBRESTADIA ? 'background.paper' : 'transparent',
                                    boxShadow: concepto === TIPO_DETALLE_CODES.SOBRESTADIA ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
                                    border: 1,
                                    borderColor: concepto === TIPO_DETALLE_CODES.SOBRESTADIA ? alpha(theme.palette.primary.main, 0.25) : 'transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: concepto === TIPO_DETALLE_CODES.SOBRESTADIA ? 'background.paper' : 'action.hover',
                                    }
                                }}
                            >
                                {TIPO_DETALLE_LABELS.SOBRESTADIA}
                            </Button>
                        </Box>
                    </Box>

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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pb: 1.25, borderBottom: 1, borderColor: 'divider' }}>
                                <Box sx={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    color: 'primary.main',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    1
                                </Box>
                                <Typography variant="caption" fontWeight={800} color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Datos Operativos de la Sobrestadía
                                </Typography>
                            </Box>

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
                                        <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.725rem' }}>
                                            {isLoadingFlotas ? 'Cargando unidades...' : 'Asocie la unidad que sufrió la demora'}
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
                                                        ? '#ecfdf5'
                                                        : daysMetricStatus.type === 'error'
                                                            ? '#fef2f2'
                                                            : 'action.hover',
                                                color:
                                                    daysMetricStatus.type === 'success'
                                                        ? '#047857'
                                                        : daysMetricStatus.type === 'error'
                                                            ? '#b91c1c'
                                                            : 'text.secondary',
                                                border: 1,
                                                borderColor:
                                                    daysMetricStatus.type === 'success'
                                                        ? '#a7f3d0'
                                                        : daysMetricStatus.type === 'error'
                                                            ? '#fecaca'
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
                                                            ? '#10b981'
                                                            : daysMetricStatus.type === 'error'
                                                                ? '#ef4444'
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
                            <Box
                                sx={{
                                    pt: 2,
                                    borderTop: 1,
                                    borderColor: 'divider',
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    justifyContent: 'space-between',
                                    gap: 1.5,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        Moneda de Facturación:
                                    </Typography>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 2,
                                            border: 1,
                                            borderColor: 'divider',
                                            bgcolor: 'background.paper',
                                        }}
                                    >
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                        <Typography variant="caption" fontWeight={700} color="text.primary">
                                            {formattedCurrencyName}
                                        </Typography>
                                    </Paper>
                                </Box>
                                <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                    Heredado de la cabecera del comprobante
                                </Typography>
                            </Box>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pb: 1.25, borderBottom: 1, borderColor: 'divider' }}>
                                <Box sx={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    color: 'primary.main',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    1
                                </Box>
                                <Typography variant="caption" fontWeight={800} color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Datos Operativos del Flete
                                </Typography>
                            </Box>

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
                            <Box
                                sx={{
                                    pt: 2,
                                    borderTop: 1,
                                    borderColor: 'divider',
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    justifyContent: 'space-between',
                                    gap: 1.5,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        Moneda de Facturación:
                                    </Typography>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 2,
                                            border: 1,
                                            borderColor: 'divider',
                                            bgcolor: 'background.paper',
                                        }}
                                    >
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                        <Typography variant="caption" fontWeight={700} color="text.primary">
                                            {formattedCurrencyName}
                                        </Typography>
                                    </Paper>
                                </Box>
                                <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                    Heredado de la cabecera del comprobante
                                </Typography>
                            </Box>
                        </Paper>
                    )}

                    {/* SECTION C: LIQUIDACIÓN ECONÓMICA */}
                    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Box sx={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    bgcolor: '#d1fae5',
                                    color: '#047857',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    2
                                </Box>
                                <Typography variant="caption" fontWeight={800} color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Liquidación Económica
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                Base imponible e impuestos
                            </Typography>
                        </Box>

                        {/* Bento Grid de Cálculos Financieros */}
                        <Grid container spacing={2}>
                            {/* Card 1: Subtotal (Base Imponible) */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 3,
                                        bgcolor: 'background.paper',
                                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                                        transition: 'border-color 0.2s ease',
                                        '&:hover': {
                                            borderColor: 'text.secondary',
                                        },
                                    }}
                                >
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                Subtotal
                                            </Typography>
                                            <Chip
                                                label="Sin IGV"
                                                size="small"
                                                sx={{ height: 20, fontSize: '0.625rem', fontFamily: 'monospace', fontWeight: 600, bgcolor: 'action.hover', color: 'text.secondary' }}
                                            />
                                        </Box>
                                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.725rem' }}>
                                            Importe neto calculado
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mt: 3, pt: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
                                            {currencyDisplay}
                                        </Typography>
                                        <Controller
                                            name="subTotal"
                                            control={control}
                                            render={({ fieldState: { error } }) => (
                                                <TextField
                                                    type="number"
                                                    fullWidth
                                                    variant="standard"
                                                    error={!!error}
                                                    value={displayedSubtotalValue}
                                                    onFocus={() => {
                                                        setIsEditingSubtotal(true);
                                                        setHasEditedSubtotal(false);
                                                        setSubtotalInputValue(displayedSubtotalValue);
                                                    }}
                                                    onChange={(event) => {
                                                        const nextValue = event.target.value;
                                                        setSubtotalInputValue(nextValue);
                                                        setHasEditedSubtotal(true);

                                                        if (nextValue === '') {
                                                            setValue('subTotal', '' as CreateFacturaDetalleFormInput['subTotal'], {
                                                                shouldDirty: true,
                                                                shouldValidate: false,
                                                            });
                                                            return;
                                                        }

                                                        const parsedSubtotal = Number(nextValue);
                                                        if (Number.isNaN(parsedSubtotal)) {
                                                            return;
                                                        }

                                                        setValue('subTotal', parsedSubtotal, {
                                                            shouldDirty: true,
                                                            shouldValidate: false,
                                                        });
                                                    }}
                                                    onBlur={async () => {
                                                        setIsEditingSubtotal(false);
                                                        if (hasEditedSubtotal) {
                                                            await trigger('subTotal');
                                                        }
                                                    }}
                                                    inputProps={{
                                                        step: '0.01',
                                                        min: '0',
                                                        style: {
                                                            fontSize: '1.5rem',
                                                            fontWeight: 700,
                                                            fontFamily: 'monospace',
                                                            padding: 0,
                                                        },
                                                    }}
                                                    InputProps={{ disableUnderline: true }}
                                                />
                                            )}
                                        />
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Card 2: IGV 18% */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 3,
                                        bgcolor: 'background.paper',
                                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                                        transition: 'border-color 0.2s ease',
                                        '&:hover': {
                                            borderColor: 'text.secondary',
                                        },
                                    }}
                                >
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                IGV ({IGV_RATE * 100}%)
                                            </Typography>
                                            <Controller
                                                name="igv"
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        checked={field.value}
                                                        disabled
                                                        size="small"
                                                        sx={{ p: 0 }}
                                                    />
                                                )}
                                            />
                                        </Box>
                                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.725rem' }}>
                                            Obligatorio para el detalle de factura
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mt: 3, pt: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
                                            {currencyDisplay}
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 700,
                                                fontFamily: 'monospace',
                                                color: 'text.primary',
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {displayIgv.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Card 3: Total Final (Highlight azul primario) */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        borderRadius: 3,
                                        border: 2,
                                        borderColor: errors.subTotal ? 'error.main' : alpha(theme.palette.primary.main, 0.4),
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" fontWeight={800} color={errors.subTotal ? 'error.main' : 'primary.main'} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                Total Final
                                            </Typography>
                                            <Chip
                                                label="Total a pagar"
                                                size="small"
                                                color={errors.subTotal ? 'error' : 'primary'}
                                                sx={{ height: 20, fontSize: '0.625rem', fontWeight: 700 }}
                                            />
                                        </Box>
                                        <Typography variant="caption" color={errors.subTotal ? 'error.main' : 'primary.main'} sx={{ opacity: 0.8, fontSize: '0.725rem' }}>
                                            Puedes editar el monto final directamente
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mt: 3, pt: 1.5, borderTop: 1, borderColor: alpha(theme.palette.primary.main, 0.2), display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={800} color={errors.subTotal ? 'error.main' : 'primary.main'}>
                                            {currencyDisplay}
                                        </Typography>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            error={!!errors.subTotal}
                                            variant="standard"
                                            value={displayedTotalValue}
                                            onFocus={() => setIsEditingTotal(true)}
                                            onChange={(event) => {
                                                const nextValue = event.target.value;
                                                setTotalInputValue(nextValue);

                                                if (nextValue === '') {
                                                    setValue('subTotal', '' as CreateFacturaDetalleFormInput['subTotal'], {
                                                        shouldDirty: true,
                                                        shouldValidate: false,
                                                    });
                                                    return;
                                                }

                                                const parsedTotal = Number(nextValue);
                                                if (Number.isNaN(parsedTotal)) {
                                                    return;
                                                }

                                                setValue(
                                                    'subTotal',
                                                    calculateFacturaDetalleSubtotalFromTotal(parsedTotal, applyIgv),
                                                    {
                                                        shouldDirty: true,
                                                        shouldValidate: false,
                                                    }
                                                );
                                            }}
                                            onBlur={async () => {
                                                setIsEditingTotal(false);
                                                setTotalInputValue(displayTotal === 0 ? '' : displayTotal.toFixed(2));
                                                await trigger('subTotal');
                                            }}
                                            inputProps={{
                                                step: '0.01',
                                                min: '0',
                                                style: {
                                                    fontSize: '1.625rem',
                                                    fontWeight: 900,
                                                    fontFamily: 'monospace',
                                                    color: errors.subTotal ? theme.palette.error.main : theme.palette.primary.main,
                                                    padding: 0,
                                                },
                                            }}
                                            InputProps={{ disableUnderline: true }}
                                        />
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>

                        {errors.subTotal?.message && (
                            <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block', fontWeight: 600 }}>
                                {errors.subTotal.message}
                            </Typography>
                        )}
                    </Box>
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
