import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    MenuItem,
    FormControlLabel,
    Checkbox,
    InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createFacturaDetalleSchema, type CreateFacturaDetalleSchema } from '../../model/schema';
import { useCreateFacturaDetalle } from '../../hooks/useFacturaDetalleCrud';
import { ViajeSelectorModal } from './ViajeSelectorModal';
import type { Viaje } from '@/entities/viaje/model/types';
import { monedaApi } from '@/shared/api/moneda.api';
import { IGV_RATE } from '@/shared/constants/constantes';

interface FacturaDetalleFormProps {
    onClose: () => void;
    facturaId: number;
    monedaId: number;
    clienteId: number;
}

export function FacturaDetalleForm({ onClose, facturaId, monedaId, clienteId }: FacturaDetalleFormProps) {
    const createMutation = useCreateFacturaDetalle();
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectedViajeText, setSelectedViajeText] = useState('');

    const { control, handleSubmit, reset, setValue } = useForm<CreateFacturaDetalleSchema>({
        resolver: zodResolver(createFacturaDetalleSchema),
        defaultValues: {
            viajeID: 0,
            descripcion: '',
            monedaID: monedaId,
            subTotal: 0,
            igv: true
        }
    });

    // Watch values to calculate IGV and Total in real-time
    const subTotal = useWatch({ control, name: 'subTotal', defaultValue: 0 });
    const applyIgv = useWatch({ control, name: 'igv', defaultValue: true });
    
    const calculatedIgv = applyIgv ? Number((subTotal * IGV_RATE).toFixed(2)) : 0;
    const calculatedTotal = Number((Number(subTotal) + calculatedIgv).toFixed(2));

    useEffect(() => {
        reset({
            viajeID: 0,
            descripcion: '',
            monedaID: monedaId,
            subTotal: 0,
            igv: true
        });
        setSelectedViajeText('');
    }, [reset, monedaId]);

    const { data: monedas } = useQuery({
        queryKey: ['monedas'],
        queryFn: () => monedaApi.getSelect()
    });

    const handleViajeSelect = (viaje: Viaje) => {
        setValue('viajeID', viaje.viajeID);
        
        // Update the display text for the input
        const origenDesc = viaje.origen?.departamento || viaje.origen?.provincia || '';
        const destinoDesc = viaje.destino?.departamento || viaje.destino?.provincia || '';
        setSelectedViajeText(`Viaje #${viaje.viajeID} - Placa: ${viaje.tracto?.placa || ''} (${origenDesc} - ${destinoDesc})`);
        
        // Auto-populate description
        // Origen - Destino, Mercaderias, Medida y Peso
        const origen = viaje.origen?.departamento || '';
        const destino = viaje.destino?.departamento || '';
        

        const mercaderias = viaje.viajeMercaderia?.map(m => m.descripcion || m.mercaderia?.descripcion || '').join(', ') || 'Varios';
        const peso = viaje.peso ? `${viaje.peso} ${viaje.tipoPeso?.nombre || ''}` : '';
        const medida = `${viaje.alto}x${viaje.largo}x${viaje.ancho} ${viaje.tipoMedida?.nombre || ''}`;
        
        let desc = `Ruta: ${origen} - ${destino}, Mercadería: ${mercaderias}`;
        if (medida) desc += `, ${medida}`;
        if (peso) desc += `, Peso: ${peso}`;

        setValue('descripcion', desc, { shouldValidate: true });
    };

    const onSubmit = async (data: CreateFacturaDetalleSchema) => {
        await createMutation.mutateAsync({ facturaId, data: { ...data, descripcion: data.descripcion?.trim() } });
        onClose();
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <Controller
                        name="viajeID"
                        control={control}
                        render={({ field, fieldState: { error, isTouched } }) => (
                            <TextField
                                fullWidth
                                label="Viaje Asociado"
                                value={selectedViajeText || 'Seleccione un viaje...'}
                                error={!!error || (isTouched && field.value === 0)}
                                helperText={error?.message || (isTouched && field.value === 0 ? 'Debe seleccionar un viaje' : '')}
                                onClick={() => setIsSelectorOpen(true)}
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                        sx: { cursor: 'pointer' },
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="primary" />
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        )}
                    />
                </Grid>

                <Grid size={{ xs: 12}}>
                    <Controller
                        name="descripcion"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <TextField
                                {...field}
                                fullWidth
                                multiline
                                rows={2}
                                label="Descripción"
                                error={!!error}
                                helperText={error?.message}
                            />
                        )}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6}}>
                    <Controller
                        name="monedaID"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <TextField
                                {...field}
                                select
                                fullWidth
                                label="Moneda"
                                error={!!error}
                                helperText={error?.message}
                                disabled // Must match the Invoice currency
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
                </Grid>

                <Grid size={{ xs: 12, sm: 6}} display="flex" alignItems="center">
                    <Controller
                        name="igv"
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                                label={`Aplicar IGV (${IGV_RATE * 100}%)`}
                            />
                        )}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 4}}>
                    <Controller
                        name="subTotal"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <TextField
                                {...field}
                                type="number"
                                fullWidth
                                label="SubTotal"
                                error={!!error}
                                helperText={error?.message}
                                inputProps={{ step: "0.01", min: "0" }}
                                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        )}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 4}}>
                    <TextField
                        fullWidth
                        label="Monto IGV"
                        value={calculatedIgv}
                        disabled
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 4}}>
                    <TextField
                        fullWidth
                        label="Total Calculado"
                        value={calculatedTotal}
                        type="number"
                        inputProps={{ step: "0.01", min: "0" }}
                        onChange={(e) => {
                            const newTotal = Number(e.target.value);
                            if (!isNaN(newTotal) && newTotal >= 0) {
                                // If Total is changed manually, we calculate the SubTotal based on the IGV setting
                                const newSubTotal = applyIgv ? newTotal / (1 + IGV_RATE) : newTotal;
                                setValue('subTotal', Number(newSubTotal.toFixed(2)), { shouldValidate: true });
                            }
                        }}
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button type="submit" variant="contained" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
            </Box>

            <ViajeSelectorModal
                open={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                clienteId={clienteId}
                onSelect={handleViajeSelect}
            />
        </Box>
    );
}
