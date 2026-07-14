import { useEffect, useState } from 'react';
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
import { useForm, Controller, useWatch, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createFacturaDetalleSchema, type CreateFacturaDetalleSchema } from '../../model/schema';
import { useCreateFacturaDetalle } from '../../hooks/useFacturaDetalleCrud';
import { ViajeSelectorModal } from './ViajeSelectorModal';
import type { Viaje } from '@/entities/viaje/model/types';
import { monedaApi } from '@entities/moneda/api/moneda.api';
import { IGV_RATE } from '@entities/factura/model/constants';

interface FacturaDetalleFormProps {
    open: boolean;
    onClose: () => void;
    facturaId: number;
    monedaId: number;
    clienteId: number;
}

export function FacturaDetalleForm({ open, onClose, facturaId, monedaId, clienteId }: FacturaDetalleFormProps) {
    const theme = useTheme();
    const createMutation = useCreateFacturaDetalle();
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectedViajeText, setSelectedViajeText] = useState('');

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateFacturaDetalleSchema>({
        resolver: zodResolver(createFacturaDetalleSchema) as Resolver<CreateFacturaDetalleSchema>,
        defaultValues: {
            viajeID: 0,
            descripcion: '',
            monedaID: monedaId,
            subTotal: 0,
            igv: true,
            total: 0
        }
    });

    // Watch values
    const subTotal = useWatch({ control, name: 'subTotal', defaultValue: 0 });
    const total = useWatch({ control, name: 'total', defaultValue: 0 });
    const applyIgv = useWatch({ control, name: 'igv', defaultValue: true });
    
    const displayIgv = applyIgv ? Math.round((total - subTotal) * 100) / 100 : 0;

    const [localTotal, setLocalTotal] = useState<string>('');
    const [isTypingTotal, setIsTypingTotal] = useState(false);

    useEffect(() => {
        if (open) {
            reset({
                viajeID: 0,
                descripcion: '',
                monedaID: monedaId,
                subTotal: 0,
                igv: true,
                total: 0
            });

            const resetUiTimer = window.setTimeout(() => {
                setSelectedViajeText('');
                setLocalTotal('');
                setIsTypingTotal(false);
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [open, reset, monedaId]);

    const { data: monedas } = useQuery({
        queryKey: ['monedas'],
        queryFn: () => monedaApi.getSelect()
    });

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

    const onSubmit: SubmitHandler<CreateFacturaDetalleSchema> = async (data) => {
        await createMutation.mutateAsync({ facturaId, data: { ...data, descripcion: data.descripcion?.trim() } });
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
                                        {monedas?.data?.map((m) => (
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
                                <Typography variant="h5" color="text.secondary" fontWeight="bold">S/</Typography>
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
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                field.onChange(val === '' ? '' : Number(val));
                                                if (val !== '') {
                                                    const newSub = parseFloat(val);
                                                    const newTot = applyIgv ? Math.round((newSub * (1 + IGV_RATE)) * 100) / 100 : newSub;
                                                    setValue('total', newTot, { shouldValidate: true });
                                                } else {
                                                    setValue('total', 0, { shouldValidate: true });
                                                }
                                            }}
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
                                            onChange={(e) => {
                                                field.onChange(e);
                                                const newIgv = e.target.checked;
                                                const currentSub = subTotal;
                                                const newTot = newIgv ? Math.round((currentSub * (1 + IGV_RATE)) * 100) / 100 : currentSub;
                                                setValue('total', newTot, { shouldValidate: true });
                                            }} 
                                            size="small" 
                                        />
                                    )}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 2 }}>
                                <Typography variant="body1" color="text.secondary" fontWeight="medium">S/</Typography>
                                <Typography variant="h5" color="text.secondary" fontWeight="bold">{displayIgv.toFixed(2)}</Typography>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Typography variant="caption" fontWeight="bold" color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Total Final</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                <Typography variant="h6" color={errors.total ? 'error.main' : 'primary.main'} fontWeight="bold">S/</Typography>
                                <TextField
                                    type="number"
                                    name='total'
                                    fullWidth
                                    error={!!errors.total}
                                    helperText={errors.total?.message}
                                    variant="standard"
                                    value={isTypingTotal ? localTotal : (total === 0 ? '' : total.toFixed(2))}
                                    inputProps={{ step: "0.01", min: "0", style: { fontSize: '2.125rem', fontWeight: 'bold', color: errors.total ? theme.palette.error.main : theme.palette.primary.main } }}
                                    InputProps={{ disableUnderline: true }}
                                    onFocus={() => setIsTypingTotal(true)}
                                    onBlur={() => {
                                        setIsTypingTotal(false);
                                        setLocalTotal(total === 0 ? '' : total.toFixed(2));
                                    }}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setLocalTotal(val);
                                        if (val === '') {
                                            setValue('subTotal', 0, { shouldValidate: true });
                                            setValue('total', 0, { shouldValidate: true });
                                        } else {
                                            const newTotal = parseFloat(val);
                                            const newSubTotal = applyIgv ? Math.round((newTotal / (1 + IGV_RATE)) * 100) / 100 : newTotal;
                                            setValue('subTotal', newSubTotal, { shouldValidate: true });
                                            setValue('total', newTotal, { shouldValidate: true });
                                        }
                                    }}
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
