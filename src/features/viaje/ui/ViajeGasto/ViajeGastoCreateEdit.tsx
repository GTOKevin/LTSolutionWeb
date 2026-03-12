import { 
    Box, Button, Typography, Paper, TextField, Grid, MenuItem, Checkbox, FormControlLabel,
    useTheme, alpha, CircularProgress
} from '@mui/material';
import { 
    AddCircle as AddCircleIcon, 
    Save as SaveIcon,
    Edit as EditIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateViajeGastoDto, ViajeGasto } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { useCreateViajeGasto, useUpdateViajeGasto } from '@/features/viaje/hooks/useViajeGastos';
import { viajeGastoSchema, type ViajeGastoFormData } from '../../model/schema';
import { getCurrentDateISO, toInputDate } from '@/shared/utils/date-utils';

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

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<ViajeGastoFormData>({
        resolver: zodResolver(viajeGastoSchema),
        defaultValues: {
            gastoID: 0,
            fechaGasto: getCurrentDateISO(),
            monedaID: 1, // Default PEN
            monto: 0,
            comprobante: false,
            numeroComprobante: '',
            descripcion: ''
        }
    });

    const hasComprobante = watch('comprobante');

    useEffect(() => {
        if (gasto) {
            reset({
                gastoID: gasto.gastoID,
                fechaGasto: gasto.fechaGasto ? toInputDate(gasto.fechaGasto) : getCurrentDateISO(),
                monedaID: gasto.monedaID,
                monto: Number(gasto.monto),
                comprobante: gasto.comprobante,
                numeroComprobante: gasto.numeroComprobante || '',
                descripcion: gasto.descripcion || ''
            });
        } else {
            reset({
                gastoID: 0,
                fechaGasto: getCurrentDateISO(),
                monedaID: 1,
                monto: 0,
                comprobante: false,
                numeroComprobante: '',
                descripcion: ''
            });
        }
    }, [gasto, reset]);

    const onSubmit = async (data: ViajeGastoFormData) => {
        if (!viajeId) return;

        try {
            const payload: CreateViajeGastoDto = {
                ...data,
                // Ensure optional fields match the DTO
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
            
            // Reset form but keep defaults
            reset({
                gastoID: 0,
                fechaGasto: getCurrentDateISO(),
                monedaID: 1,
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                        bgcolor: isEditing ? theme.palette.warning.main : theme.palette.primary.main, 
                        color: 'white', 
                        p: 0.5, 
                        borderRadius: '50%', 
                        display: 'flex' 
                    }}>
                        {isEditing ? <EditIcon fontSize="small" /> : <AddCircleIcon fontSize="small" />}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        {isEditing ? "Editar Gasto" : "Agregar Gasto"}
                    </Typography>
                </Box>
                {isEditing && (
                    <Button 
                        size="small" 
                        color="inherit" 
                        onClick={onCancel}
                        startIcon={<CancelIcon />}
                    >
                        Cancelar Edición
                    </Button>
                )}
            </Box>

            <Grid container spacing={2}>
                <Grid size={{xs:12, sm:6, md:3}}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                            Tipo de Gasto
                        </Typography>
                        <Controller
                            name="gastoID"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    fullWidth
                                    size="small"
                                    value={field.value || 0}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    SelectProps={{ displayEmpty: true }}
                                    error={!!errors.gastoID}
                                    helperText={errors.gastoID?.message}
                                    sx={{ bgcolor: 'background.paper' }}
                                >
                                    <MenuItem value={0} disabled>Seleccione tipo</MenuItem>
                                    {tiposGasto.map((tipo) => (
                                        <MenuItem key={tipo.id} value={tipo.id}>{tipo.text}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>

                    <Grid size={{xs:12, sm:6, md:3}}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                            Fecha Gasto
                        </Typography>
                        <Controller
                            name="fechaGasto"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="date"
                                    fullWidth
                                    size="small"
                                    error={!!errors.fechaGasto}
                                    helperText={errors.fechaGasto?.message}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{xs:12, md:3}}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                            Moneda
                        </Typography>
                        <Controller
                            name="monedaID"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    fullWidth
                                    size="small"
                                    value={field.value || 0}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    error={!!errors.monedaID}
                                    helperText={errors.monedaID?.message}
                                    sx={{ bgcolor: 'background.paper' }}
                                >
                                    {monedas.map((moneda) => (
                                        <MenuItem key={moneda.id} value={moneda.id}>{moneda.text}</MenuItem>
                                    ))}
                                </TextField>
                            )}
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
