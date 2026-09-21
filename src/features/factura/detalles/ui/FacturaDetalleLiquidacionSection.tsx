import { useMemo, useState } from 'react';
import {
    Box,
    Checkbox,
    Chip,
    Grid,
    Paper,
    TextField,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Controller,
    useWatch,
    type Control,
    type FieldErrors,
    type UseFormSetValue,
    type UseFormTrigger,
} from 'react-hook-form';
import {
    calculateFacturaDetalleIgv,
    calculateFacturaDetalleSubtotalFromTotal,
    calculateFacturaDetalleTotal,
    roundFacturaDetalleAmount,
    type CreateFacturaDetalleForm,
    type CreateFacturaDetalleFormInput,
} from '../../model/schema';
import { IGV_RATE } from '@entities/factura/model/constants';

interface FacturaDetalleLiquidacionSectionProps {
    control: Control<CreateFacturaDetalleFormInput, unknown, CreateFacturaDetalleForm>;
    setValue: UseFormSetValue<CreateFacturaDetalleFormInput>;
    trigger: UseFormTrigger<CreateFacturaDetalleFormInput>;
    errors: FieldErrors<CreateFacturaDetalleFormInput>;
    currencyDisplay: string;
}


export function FacturaDetalleLiquidacionSection({
    control,
    setValue,
    trigger,
    errors,
    currencyDisplay,
}: FacturaDetalleLiquidacionSectionProps) {
    const theme = useTheme();
    const [subtotalInputValue, setSubtotalInputValue] = useState('');
    const [isEditingSubtotal, setIsEditingSubtotal] = useState(false);
    const [hasEditedSubtotal, setHasEditedSubtotal] = useState(false);
    const [totalInputValue, setTotalInputValue] = useState('');
    const [isEditingTotal, setIsEditingTotal] = useState(false);

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

    return (
        <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.success.main, 0.18),
                        color: theme.palette.success.dark,
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
    );
}
