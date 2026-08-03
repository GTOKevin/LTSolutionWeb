import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    MenuItem,
    Checkbox,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Paper,
    alpha,
    useTheme
} from '@mui/material';
import { Search as SearchIcon, LocalShipping as LocalShippingIcon } from '@mui/icons-material';
import { useForm, Controller, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
    buildFacturaDetalleDefaultValues,
    calculateFacturaDetalleIgv,
    calculateFacturaDetalleSubtotalFromTotal,
    calculateFacturaDetalleTotal,
    createFacturaDetalleSchema,
    roundFacturaDetalleAmount,
    type CreateFacturaDetalleForm,
    type CreateFacturaDetalleFormInput,
} from '../../model/schema';
import { useCreateFacturaDetalle } from '../../hooks/useFacturaDetalleCrud';
import { ViajeSelectorModal } from './ViajeSelectorModal';
import type { FacturaDetalleViajeOption } from '@/entities/factura/model/types';
import type { Moneda } from '@/entities/moneda/model/types';
import { IGV_RATE } from '@entities/factura/model/constants';
import { monedaApi } from '@entities/moneda/api/moneda.api';
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

    const { control, handleSubmit, reset, setValue, trigger, formState: { errors } } = useForm<CreateFacturaDetalleFormInput, unknown, CreateFacturaDetalleForm>({
        resolver: zodResolver(createFacturaDetalleSchema),
        defaultValues,
    });

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

    const { data: monedas } = useQuery({
        queryKey: ['monedas'],
        queryFn: () => monedaApi.getSelect()
    });

    const currencyDisplay = resolveCurrencyDisplay(moneda);

    const handleViajeSelect = (viaje: FacturaDetalleViajeOption) => {
        setValue('viajeID', viaje.viajeID);
        setSelectedViajeText(`Viaje: ${viaje.codigo}, Placa: ${viaje.tractoPlaca}, (${viaje.origenDescripcion} - ${viaje.destinoDescripcion})`);
        setValue('descripcion', viaje.descripcionDetalleSugerida, { shouldValidate: true });
    };

    const onSubmit: SubmitHandler<CreateFacturaDetalleForm> = async (data) => {
        await createMutation.mutateAsync({
            facturaId,
            data: {
                viajeID: data.viajeID,
                monedaID: data.monedaID,
                subTotal: data.subTotal,
                igv: data.igv,
                descripcion: data.descripcion?.trim() || undefined,
            }
        });
        onClose();
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
                sx: { borderRadius: 3, boxShadow: '0 24px 40px -12px rgba(25, 28, 29, 0.06)' }
            }}
        >
            <DialogTitle sx={{ 
                p: 3, 
                pb: 2, 
                bgcolor: alpha(theme.palette.background.default, 0.5),
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                <LocalShippingIcon color="primary" />
                <Typography component="span" variant="h6" fontWeight="bold">Agregar Detalle de Viaje</Typography>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
                <Box component="form" id="detalle-form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Seleccionar Viaje</Typography>
                            <Controller
                                name="viajeID"
                                control={control}
                                render={({ field, fieldState: { error, isTouched } }) => (
                                    <TextField
                                        fullWidth
                                        placeholder="Ej: VJ-2023-001 o Callao-Lurin"
                                        value={selectedViajeText || ''}
                                        error={!!error || (isTouched && field.value === 0)}
                                        helperText={error?.message || (isTouched && field.value === 0 ? 'Debe seleccionar un viaje' : '')}
                                        onClick={() => setIsSelectorOpen(true)}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                                sx: { cursor: 'pointer', bgcolor: 'background.default', borderRadius: 2 },
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon color="action" />
                                                    </InputAdornment>
                                                )
                                            }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 8}}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Descripción (Opcional)</Typography>
                            <Controller
                                name="descripcion"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={5}
                                        placeholder="Detalles adicionales del flete..."
                                        error={!!error}
                                        helperText={error?.message}
                                        sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4}}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Moneda</Typography>
                            <Controller
                                name="monedaID"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                        disabled // Must match the Invoice currency
                                        sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                    >
                                        <MenuItem value={0} disabled>Seleccione Moneda</MenuItem>
                                        {monedas?.map((m) => (
                                            <MenuItem key={m.id} value={m.id}>
                                                {m.text}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                Heredado de la cabecera
                            </Typography>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: 'background.default' }}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Subtotal</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h5" color="text.secondary" fontWeight="bold">{currencyDisplay}</Typography>
                                <Controller
                                    name="subTotal"
                                    control={control}
                                    render={({ fieldState: { error } }) => (
                                        <TextField
                                            type="number"
                                            fullWidth
                                            variant="standard"
                                            error={!!error}
                                            helperText={error?.message}
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
                                            inputProps={{ step: "0.01", min: "0", style: { fontSize: '1.5rem', fontWeight: 'bold' } }}
                                            InputProps={{ disableUnderline: true }}
                                        />
                                    )}
                                />
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>IGV ({IGV_RATE * 100}%)</Typography>
                                <Controller
                                    name="igv"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox 
                                            checked={field.value} 
                                            disabled
                                            size="small" 
                                        />
                                    )}
                                />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                Obligatorio para el detalle de factura.
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 2 }}>
                                <Typography variant="body1" color="text.secondary" fontWeight="medium">{currencyDisplay}</Typography>
                                <Typography variant="h5" color="text.secondary" fontWeight="bold">{displayIgv.toFixed(2)}</Typography>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Typography variant="caption" fontWeight="bold" color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Total Final</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                <Typography variant="h6" color={errors.subTotal ? 'error.main' : 'primary.main'} fontWeight="bold">{currencyDisplay}</Typography>
                                <TextField
                                    type="number"
                                    fullWidth
                                    error={!!errors.subTotal}
                                    helperText={errors.subTotal?.message ?? 'Puedes editar el total final; el subtotal e IGV se recalculan automáticamente.'}
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
                                    inputProps={{ step: '0.01', min: '0', style: { fontSize: '2.125rem', fontWeight: 'bold', color: errors.subTotal ? theme.palette.error.main : theme.palette.primary.main } }}
                                    InputProps={{ disableUnderline: true }}
                                />
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2, px: 3 }}>Cancelar</Button>
                <Button 
                    type="submit" 
                    form="detalle-form" 
                    variant="contained" 
                    disabled={createMutation.isPending}
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    {createMutation.isPending ? 'Guardando...' : 'Confirmar Registro'}
                </Button>
            </DialogActions>

            <ViajeSelectorModal
                open={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                clienteId={clienteId}
                onSelect={handleViajeSelect}
            />
        </Dialog>
    );
}
