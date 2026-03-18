import { 
    Box, Button, Typography, Paper, TextField, Grid, Checkbox, FormControlLabel,
    useTheme, alpha, CircularProgress
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateViajeGastoDto, ViajeGasto } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { useCreateViajeGasto, useUpdateViajeGasto } from '@/features/viaje/hooks/useViajeGastos';
import { viajeGastoSchema, type ViajeGastoFormData } from '../../model/schema';
import { getCurrentDateISO, toInputDate } from '@/shared/utils/date-utils';
import { SubFormHeader } from '@/shared/components/ui/SubFormHeader';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';
import { MONEDA_ID } from '@/shared/constants/constantes';

interface Props {
    viajeId: number;
    tiposGasto: SelectItem[];
    monedas: SelectItem[]; 
    gasto?: ViajeGasto | null;
    onCancel?: () => void;
}

export function ViajeGastoCreateEdit({ viajeId, tiposGasto, monedas, gasto, onCancel }: Props) {
    const theme = useTheme();
    const createMutation = useCreateViajeGasto();
    const updateMutation = useUpdateViajeGasto();

    const isEditing = !!gasto;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    const { control, register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ViajeGastoFormData>({
        resolver: zodResolver(viajeGastoSchema),
        defaultValues: {
            gastoID: 0,
            fechaGasto: getCurrentDateISO(),
            monedaID: MONEDA_ID.SOLES, // Default PEN
            monto: 0,
            comprobante: false,
            numeroComprobante: '',
            descripcion: '',
            combustible: false,
            galones: 0
        }
    });

    const hasComprobante = watch('comprobante');
    const isCombustible = watch('combustible');
    const selectedGastoID = watch('gastoID');
    const selectedMonedaID = watch('monedaID');

    // Determine if currency should be restricted to Soles (Combustible/Peaje)
    const selectedGasto = tiposGasto.find(t => t.id === selectedGastoID);
    const selectedGastoText = selectedGasto?.text.toLowerCase() || '';
    const isRestrictedCurrency = selectedGastoText.includes('combustible') || 
                                 selectedGastoText.includes('diesel') || 
                                 selectedGastoText.includes('petroleo') || 
                                 selectedGastoText.includes('peaje');

    useEffect(() => {
        if (selectedGastoID && tiposGasto.length > 0) {
            const gasto = tiposGasto.find(t => t.id === selectedGastoID);
            if (gasto) {
                const text = gasto.text.toLowerCase();
                const isFuel = text.includes('combustible') || text.includes('diesel') || text.includes('petroleo');
                const isToll = text.includes('peaje');
                
                setValue('combustible', isFuel);

                // Force Soles if Fuel or Toll
                if (isFuel || isToll) {
                    setValue('monedaID', MONEDA_ID.SOLES);
                }

                if (!isFuel) {
                    setValue('galones', 0);
                }
            }
        }
    }, [selectedGastoID, tiposGasto, setValue]);

    useEffect(() => {
        if (gasto) {
            reset({
                gastoID: gasto.gastoID,
                fechaGasto: gasto.fechaGasto ? toInputDate(gasto.fechaGasto) : getCurrentDateISO(),
                monedaID: gasto.monedaID,
                monto: Number(gasto.monto),
                comprobante: gasto.comprobante,
                numeroComprobante: gasto.numeroComprobante || '',
                descripcion: gasto.descripcion || '',
                combustible: gasto.combustible || false,
                galones: Number(gasto.galones || 0)
            });
        } else {
            reset({
                gastoID: 0,
                fechaGasto: getCurrentDateISO(),
                monedaID: MONEDA_ID.SOLES,
                monto: 0,
                comprobante: false,
                numeroComprobante: '',
                descripcion: '',
                combustible: false,
                galones: 0
            });
        }
    }, [gasto, reset]);

    const onSubmit = async (data: ViajeGastoFormData) => {
        if (!viajeId) return;

        try {
            const payload: CreateViajeGastoDto = {
                ...data,
                numeroComprobante: data.numeroComprobante || undefined,
                descripcion: data.descripcion || undefined
            };

            if (isEditing && gasto) {
                await updateMutation.mutateAsync({ 
                    id: gasto.viajeGastoID, 
                    data: payload, 
                    viajeId 
                });
            } else {
                await createMutation.mutateAsync({ viajeId, data: payload });
            }
            
            reset({
                gastoID: 0,
                fechaGasto: getCurrentDateISO(),
                monedaID: MONEDA_ID.SOLES,
                monto: 0,
                comprobante: false,
                numeroComprobante: '',
                descripcion: ''
            });
            
            if (onCancel) onCancel();
        } catch (error) {
            console.error("Error saving gasto:", error);
        }
    };

    return (
        <Paper 
            elevation={0}
            sx={{ 
                p: 3, 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(isEditing ? theme.palette.warning.main : theme.palette.primary.main, 0.02)
            }}
        >
            <SubFormHeader 
                isEditing={isEditing}
                titleAdd="Agregar Gasto"
                titleEdit="Editar Gasto"
                onCancel={onCancel}
            />

            <Grid container spacing={2}>
                <Grid size={{xs:12, sm:6, md:3}}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                        Tipo de Gasto
                    </Typography>
                    <FormSelect
                        label=""
                        registration={register('gastoID', { valueAsNumber: true })}
                        options={tiposGasto}
                        value={selectedGastoID || 0}
                        onChange={(e) => setValue('gastoID', Number(e.target.value))}
                        error={!!errors.gastoID}
                        helperText={errors.gastoID?.message}
                        sx={{ bgcolor: 'background.paper' }}
                    />
                </Grid>

                <Grid size={{xs:12, sm:6, md:3}}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                        Fecha Gasto
                    </Typography>
                    <FormDatePicker
                        label=""
                        registration={register('fechaGasto')}
                        error={!!errors.fechaGasto}
                        helperText={errors.fechaGasto?.message}
                        sx={{ bgcolor: 'background.paper' }}
                    />
                </Grid>

                <Grid size={{xs:12, md:3}}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                        Moneda
                    </Typography>
                    <FormSelect
                        label=""
                        registration={register('monedaID', { valueAsNumber: true })}
                        options={monedas}
                        value={selectedMonedaID || 0}
                        onChange={(e) => setValue('monedaID', Number(e.target.value))}
                        disabled={isRestrictedCurrency}
                        error={!!errors.monedaID}
                        helperText={errors.monedaID?.message}
                        sx={{ bgcolor: 'background.paper' }}
                    />
                </Grid>

                    <Grid size={{xs:12, sm:6, md:3}}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                            Monto
                        </Typography>
                        <Controller
                            name="monto"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="number"
                                    fullWidth
                                    size="small"
                                    placeholder="0.00"
                                    value={field.value === 0 ? '' : field.value}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    error={!!errors.monto}
                                    helperText={errors.monto?.message}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                            )}
                        />
                    </Grid>

                    {isCombustible && (
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                Galones
                            </Typography>
                            <Controller
                                name="galones"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="number"
                                        fullWidth
                                        size="small"
                                        placeholder="0.00"
                                        value={field.value === 0 ? '' : field.value}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        error={!!errors.galones}
                                        helperText={errors.galones?.message}
                                        sx={{ bgcolor: 'background.paper' }}
                                    />
                                )}
                            />
                        </Grid>
                    )}

                    <Grid size={{xs:12, md:3}}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                            Comprobante
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Controller
                                name="comprobante"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                checked={!!field.value} 
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                size="small"
                                            />
                                        }
                                        label={<Typography variant="body2">¿Tiene comprobante?</Typography>}
                                    />
                                )}
                            />
                            {hasComprobante && (
                                <Controller
                                    name="numeroComprobante"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            size="small"
                                            placeholder="N° Comprobante"
                                            value={field.value || ''}
                                            error={!!errors.numeroComprobante}
                                            helperText={errors.numeroComprobante?.message}
                                            sx={{ bgcolor: 'background.paper' }}
                                        />
                                    )}
                                />
                            )}
                        </Box>
                    </Grid>

                    <Grid size={{xs:12, sm:6}}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                            Descripción (Opcional)
                        </Typography>
                        <Controller
                            name="descripcion"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    size="small"
                                    placeholder="Detalles adicionales..."
                                    value={field.value || ''}
                                    error={!!errors.descripcion}
                                    helperText={errors.descripcion?.message}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                            )}
                        />
                    </Grid>
                    
                    <Grid size={{xs:12}} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            variant="contained"
                            color={isEditing ? "warning" : "primary"}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            disabled={isLoading}
                            sx={{ 
                                px: 4,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                boxShadow: theme.shadows[2]
                            }}
                        >
                            {isEditing ? "Guardar Cambios" : "Registrar Gasto"}
                        </Button>
                    </Grid>
                </Grid>
        </Paper>
    );
}
