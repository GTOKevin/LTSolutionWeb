import { logger } from '@/shared/utils/logger';
import { 
    Box, Button, Typography, TextField, Grid, Checkbox, FormControlLabel,
    useTheme, CircularProgress
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateViajeGastoDto, ViajeGasto } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { useCreateViajeGasto, useUpdateViajeGasto } from '@/features/viaje/hooks/useViajeGastos';
import { viajeGastoSchema, type ViajeGastoFormData } from '../../model/schema';
import { getCurrentDateISO, toInputDate } from '@/shared/utils/date-utils';
import { getSelectItemId } from '@/entities/master-data/lib/catalog-utils';
import { resolveGastoSelectMetadata } from '@/entities/gasto/model/metadata';

import { FormSelect } from '@/shared/components/ui/FormSelect';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';
import { handleBackendErrors } from '@/shared/utils/form-validation';

interface Props {
    viajeId: number;
    tiposGasto: SelectItem[];
    monedas: SelectItem[]; 
    defaultMonedaId?: number;
    gasto?: ViajeGasto | null;
    onCancel?: () => void;
}

export function ViajeGastoCreateEdit({ viajeId, tiposGasto, monedas, defaultMonedaId = 0, gasto, onCancel }: Props) {
    const theme = useTheme();
    const createMutation = useCreateViajeGasto();
    const updateMutation = useUpdateViajeGasto();

    const isEditing = !!gasto;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    const { control, register, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm<ViajeGastoFormData>({
        resolver: zodResolver(viajeGastoSchema),
        defaultValues: {
            gastoID: 0,
            fechaGasto: getCurrentDateISO(),
            monedaID: defaultMonedaId,
            monto: 0,
            comprobante: false,
            numeroComprobante: '',
            descripcion: '',
            combustible: false,
            galones: 0
        }
    });

    const hasComprobante = useWatch({ control, name: 'comprobante', defaultValue: false });
    const isCombustible = useWatch({ control, name: 'combustible', defaultValue: false });
    const selectedGastoID = useWatch({ control, name: 'gastoID', defaultValue: 0 });
    const selectedMonedaID = useWatch({ control, name: 'monedaID', defaultValue: defaultMonedaId });
    const hasSelectedGasto = selectedGastoID > 0;
    const selectedGasto = tiposGasto.find((item) => item.id === selectedGastoID);
    const selectedGastoMetadata = resolveGastoSelectMetadata(selectedGasto);
    const enforcedMonedaId = selectedGastoMetadata.defaultCurrencyCode
        ? getSelectItemId(monedas, [selectedGastoMetadata.defaultCurrencyCode])
        : null;

    useEffect(() => {
        if (!gasto && defaultMonedaId && !selectedMonedaID) {
            setValue('monedaID', defaultMonedaId);
        }
    }, [defaultMonedaId, gasto, selectedMonedaID, setValue]);

    useEffect(() => {
        if (!hasSelectedGasto) {
            setValue('combustible', false);
            setValue('galones', 0);
            return;
        }

        // Wait until the selected catalog item is resolved before enforcing metadata.
        if (!selectedGasto) {
            return;
        }

        setValue('combustible', selectedGastoMetadata.isFuel);

        if (enforcedMonedaId) {
            setValue('monedaID', enforcedMonedaId);
        }

        if (!selectedGastoMetadata.isFuel) {
            setValue('galones', 0);
        }
    }, [enforcedMonedaId, hasSelectedGasto, selectedGasto, selectedGastoMetadata.isFuel, setValue]);

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
                monedaID: defaultMonedaId,
                monto: 0,
                comprobante: false,
                numeroComprobante: '',
                descripcion: '',
                combustible: false,
                galones: 0
            });
        }
    }, [defaultMonedaId, gasto, reset]);

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
                monedaID: defaultMonedaId,
                monto: 0,
                comprobante: false,
                numeroComprobante: '',
                descripcion: '',
                combustible: false,
                galones: 0
            });
            
            if (onCancel) onCancel();
        } catch (error) {
            logger.error("Error saving gasto:", error);
            handleBackendErrors<ViajeGastoFormData>(error, setError);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
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
                        error={!!errors.monedaID}
                        helperText={errors.monedaID?.message || (selectedGastoMetadata.defaultCurrencyCode ? `Moneda obligatoria: ${selectedGastoMetadata.defaultCurrencyCode}` : undefined)}
                        sx={{ bgcolor: 'background.paper' }}
                        disabled={!!selectedGastoMetadata.defaultCurrencyCode}
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

                    <Grid size={{xs:12, md:4}}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                            Validaciones del Gasto
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
                            {selectedGastoMetadata.isFuel ? (
                                <Typography variant="body2" color="text.secondary">
                                    El tipo de gasto seleccionado requiere registrar galones.
                                </Typography>
                            ) : null}
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
        </Box>
    );
}
