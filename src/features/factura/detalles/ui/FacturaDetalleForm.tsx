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
    calculateFacturaDetalleTotal,
    createFacturaDetalleSchema,
    type CreateFacturaDetalleForm,
    type CreateFacturaDetalleFormInput,
} from '../../model/schema';
import { useCreateFacturaDetalle } from '../../hooks/useFacturaDetalleCrud';
import { ViajeSelectorModal } from './ViajeSelectorModal';
import type { Viaje } from '@/entities/viaje/model/types';
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
    const defaultValues = useMemo(() => buildFacturaDetalleDefaultValues(monedaId), [monedaId]);

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateFacturaDetalleFormInput, unknown, CreateFacturaDetalleForm>({
        resolver: zodResolver(createFacturaDetalleSchema),
        defaultValues,
    });

    const subTotal = useWatch({ control, name: 'subTotal', defaultValue: 0 });
    const applyIgv = useWatch({ control, name: 'igv', defaultValue: true });
    const displayTotal = useMemo(
        () => calculateFacturaDetalleTotal(Number(subTotal) || 0, applyIgv),
        [applyIgv, subTotal]
    );
    const displayIgv = useMemo(
        () => calculateFacturaDetalleIgv(Number(subTotal) || 0, applyIgv),
        [applyIgv, subTotal]
    );
    
    useEffect(() => {
        if (open) {
            reset(defaultValues);

            const resetUiTimer = window.setTimeout(() => {
                setSelectedViajeText('');
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

    const handleViajeSelect = (viaje: Viaje) => {
        setValue('viajeID', viaje.viajeID);
        
        // Update the display text for the input
        const origenDesc = viaje.origen?.departamento || viaje.origen?.provincia || '';
        const destinoDesc = viaje.destino?.departamento || viaje.destino?.provincia || '';
        setSelectedViajeText(`Viaje: ${viaje.codigo}, Placa: ${viaje.tracto?.placa || ''}, (${origenDesc} - ${destinoDesc})`);
        
        // Auto-populate description
        // Origen - Destino, Mercaderias, Medida y Peso
        const origen = viaje.origen?.departamento || '';
        const destino = viaje.destino?.departamento || '';
        

        const mercaderias = viaje.viajeMercaderia?.map(m => m.descripcion || m.mercaderia?.descripcion || '').join(', ') || 'Varios';
        const peso = viaje.peso ? `${viaje.peso} ${viaje.tipoPeso?.nombre || ''}` : '';
        const medida = `${viaje.alto}x${viaje.largo}x${viaje.ancho} ${viaje.tipoMedida?.nombre || ''}`;
        
        let desc = `Ruta: ${origen} - ${destino}\nMercadería: ${mercaderias}\n`;
        if (medida) desc += `${medida}\n`;
        if (peso) desc += `Peso: ${peso}`;

        setValue('descripcion', desc, { shouldValidate: true });
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
                                    render={({ field, fieldState: { error } }) => (
                                        <TextField
                                            {...field}
                                            type="number"
                                            fullWidth
                                            variant="standard"
                                            error={!!error}
                                            helperText={error?.message}
                                            inputProps={{ step: "0.01", min: "0", style: { fontSize: '1.5rem', fontWeight: 'bold' } }}
                                            InputProps={{ disableUnderline: true }}
                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
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
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            size="small" 
                                        />
                                    )}
                                />
                            </Box>
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
                                    type="text"
                                    fullWidth
                                    error={!!errors.subTotal}
                                    helperText={errors.subTotal?.message ?? 'Total calculado automáticamente según subtotal e IGV.'}
                                    variant="standard"
                                    value={displayTotal === 0 ? '' : displayTotal.toFixed(2)}
                                    inputProps={{ style: { fontSize: '2.125rem', fontWeight: 'bold', color: errors.subTotal ? theme.palette.error.main : theme.palette.primary.main } }}
                                    InputProps={{ disableUnderline: true, readOnly: true }}
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
