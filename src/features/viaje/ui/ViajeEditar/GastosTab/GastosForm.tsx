import { useEffect } from 'react';
import { 
    Box, Typography, Button, TextField, MenuItem, 
    useTheme, alpha, CircularProgress,
    Checkbox, FormControlLabel
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateViajeGasto } from '@features/viaje/hooks/useViajeGastos';
import { useViajeGastoOptions } from '@features/viaje/options/hooks/useViajeScopedOptions';
import { viajeGastoSchema, type ViajeGastoFormData } from '@features/viaje/model/schema';
import { getCurrentDateISO } from '@/shared/utils/date-utils';
import { logger } from '@/shared/utils/logger';
import { getSelectItemId } from '@/entities/master-data/lib/catalog-utils';
import { resolveGastoSelectMetadata } from '@/entities/gasto/model/metadata';

interface GastosFormProps {
    viajeID: number;
}

export function GastosForm({ viajeID }: GastosFormProps) {
    const theme = useTheme();
    const createMutation = useCreateViajeGasto();
    const { tiposGasto, monedas, defaultMonedaId = 0 } = useViajeGastoOptions(true);

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<ViajeGastoFormData>({
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
    const selectedGasto = tiposGasto?.find((item) => item.id === selectedGastoID);
    const selectedGastoMetadata = resolveGastoSelectMetadata(selectedGasto);
    const enforcedMonedaId = selectedGastoMetadata.defaultCurrencyCode
        ? getSelectItemId(monedas, [selectedGastoMetadata.defaultCurrencyCode])
        : null;

    useEffect(() => {
        if (defaultMonedaId && !selectedMonedaID) {
            setValue('monedaID', defaultMonedaId);
        }
    }, [defaultMonedaId, selectedMonedaID, setValue]);

    useEffect(() => {
        setValue('combustible', selectedGastoMetadata.isFuel);

        if (enforcedMonedaId) {
            setValue('monedaID', enforcedMonedaId);
        }

        if (!selectedGastoMetadata.isFuel) {
            setValue('galones', 0);
        }
    }, [enforcedMonedaId, selectedGastoMetadata.isFuel, setValue]);

    const onSubmit = async (data: ViajeGastoFormData) => {
        try {
            await createMutation.mutateAsync({
                viajeId: viajeID,
                data: {
                    ...data,
                    numeroComprobante: data.comprobante ? data.numeroComprobante : undefined,
                    descripcion: data.descripcion || undefined
                }
            });
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
        } catch (error) {
            logger.error("Error al registrar gasto", error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ 
                bgcolor: 'background.paper', 
                p: 3, 
                borderRadius: 3, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.5)
            }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
                    Nuevo Gasto
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
                            Producto / Tipo de Gasto
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
                                    error={!!errors.gastoID}
                                    helperText={errors.gastoID?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 } }}
                                >
                                    <MenuItem value={0} disabled>Seleccione un tipo</MenuItem>
                                    {tiposGasto?.map((tipo) => (
                                        <MenuItem key={tipo.id} value={tipo.id}>{tipo.text}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Box>

                    <Box>
                        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
                            Descripción
                        </Typography>
                        <Controller
                            name="descripcion"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    multiline
                                    rows={2}
                                    placeholder="Detalles del gasto..."
                                    error={!!errors.descripcion}
                                    helperText={errors.descripcion?.message}
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 } }}
                                />
                            )}
                        />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
                                Fecha del Gasto
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
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 } }}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        </Box>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
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
                                        error={!!errors.monedaID}
                                        helperText={errors.monedaID?.message || (selectedGastoMetadata.defaultCurrencyCode ? `Moneda obligatoria: ${selectedGastoMetadata.defaultCurrencyCode}` : undefined)}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 } }}
                                        disabled={!!selectedGastoMetadata.defaultCurrencyCode}
                                    >
                                        <MenuItem value={0} disabled>Seleccione</MenuItem>
                                        {monedas?.map((m) => (
                                            <MenuItem key={m.id} value={m.id}>{m.text}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'start' }}>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
                                Monto Total
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
                                        inputProps={{ step: "0.01" }}
                                        error={!!errors.monto}
                                        helperText={errors.monto?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 } }}
                                    />
                                )}
                            />
                        </Box>
                        <Box sx={{ pt: 3 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Controller
                                    name="comprobante"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <FormControlLabel
                                            control={<Checkbox checked={value} onChange={onChange} color="primary" />}
                                            label={<Typography variant="body2" fontWeight={600}>Tiene Comprobante</Typography>}
                                        />
                                    )}
                                />
                                {selectedGastoMetadata.isFuel ? (
                                    <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ px: 2 }}>
                                        Este gasto requiere registrar galones.
                                    </Typography>
                                ) : null}
                            </Box>
                        </Box>
                    </Box>

                    {hasComprobante && (
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
                                N° de Comprobante
                            </Typography>
                            <Controller
                                name="numeroComprobante"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        size="small"
                                        placeholder="F001-000123"
                                        error={!!errors.numeroComprobante}
                                        helperText={errors.numeroComprobante?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 } }}
                                    />
                                )}
                            />
                        </Box>
                    )}

                    {isCombustible && (
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block', lineHeight: 1 }}>
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
                                        inputProps={{ step: "0.01" }}
                                        error={!!errors.galones}
                                        helperText={errors.galones?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 } }}
                                    />
                                )}
                            />
                        </Box>
                    )}

                    <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth 
                        disabled={createMutation.isPending}
                        startIcon={createMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                        sx={{ 
                            mt: 1,
                            py: 1.5, 
                            borderRadius: 3, 
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #005da8 0%, #0076d2 100%)',
                            boxShadow: '0 4px 14px rgba(0, 93, 168, 0.3)'
                        }}
                    >
                        Registrar Gasto
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
