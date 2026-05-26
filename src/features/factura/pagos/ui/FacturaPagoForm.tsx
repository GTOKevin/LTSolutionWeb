import { useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Paper,
    alpha,
    useTheme,
    IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createFacturaPagoSchema, type CreateFacturaPagoSchema } from '../../model/schema';
import { useCreateFacturaPago } from '../../hooks/useFacturaPagoCrud';
import { maestroApi } from '@/shared/api/maestro.api';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';
import { monedaApi } from '@/shared/api/moneda.api';
import { estadoApi } from '@/shared/api/estado.api';
import { SECCION_MAESTRO } from '@/shared/constants/maestro';
import { ESTADO_SECCIONES } from '@/shared/constants/constantes';
import type { Factura } from '@/entities/factura/model/types';

interface FacturaPagoFormProps {
    open: boolean;
    onClose: () => void;
    factura: Factura;
    facturaId: number;
    monedaId: number;
    maxAmount: number;
}

export function FacturaPagoForm({ open, onClose, factura, facturaId, monedaId, maxAmount }: FacturaPagoFormProps) {
    const theme = useTheme();
    const createMutation = useCreateFacturaPago();

    const { control, handleSubmit, reset } = useForm<CreateFacturaPagoSchema>({
        resolver: zodResolver(createFacturaPagoSchema),
        defaultValues: {
            fechaPago: new Date().toISOString().split('T')[0],
            fechaAcreditacion: '',
            tipoPagoID: 0,
            estadoID: 0,
            monedaID: monedaId,
            montoAbonado: maxAmount,
            numeroOperacion: '',
            observacion: ''
        }
    });

    useEffect(() => {
        reset({
            fechaPago: new Date().toISOString().split('T')[0],
            fechaAcreditacion: '',
            tipoPagoID: 0,
            estadoID: 0,
            monedaID: monedaId,
            montoAbonado: maxAmount,
            numeroOperacion: '',
            observacion: ''
        });
    }, [reset, monedaId, maxAmount]);

    const { data: tiposPago } = useQuery({
        queryKey: ['maestros', 'tipo-pago'],
        queryFn: () => maestroApi.getSelect('',SECCION_MAESTRO.MEDIO_PAGO,10)
    });

    const { data: estadosPago } = useQuery({
        queryKey: ['estados', 'pago'],
        queryFn: () => estadoApi.getSelect('',10,ESTADO_SECCIONES.FACTURA_PAGO) // Asumiendo que hay una sección EstadoPago o usar endpoint de estados
    });

    const { data: monedas } = useQuery({
        queryKey: ['monedas'],
        queryFn: () => monedaApi.getSelect()
    });

    const onSubmit = async (data: CreateFacturaPagoSchema) => {
        await createMutation.mutateAsync({
            facturaId,
            data: {
                ...data,
                fechaAcreditacion: data.fechaAcreditacion || undefined,
                numeroOperacion: data.numeroOperacion?.trim() || undefined,
                observacion: data.observacion?.trim() || undefined
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
                alignItems: 'flex-start',
                justifyContent: 'space-between'
            }}>
                <Box>
                    <Typography component="span" variant="h6" fontWeight="bold">Registrar Amortización</Typography>
                    <Typography component="div" variant="body2" color="text.secondary">Factura #{factura.serie}-{factura.numero} • {factura.cliente?.razonSocial}</Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
                <Box component="form" id="pago-form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderLeft: `4px solid ${theme.palette.primary.main}`, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }} color="text.secondary">Saldo Pendiente</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight="medium">{factura.moneda?.simbolo || 'S/'}</Typography>
                                <Typography variant="h5" fontWeight="bold">{maxAmount.toFixed(2)}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ px: 2, py: 0.5, bgcolor: alpha(theme.palette.warning.main, 0.2), borderRadius: 10 }}>
                            <Typography variant="caption" fontWeight="bold" color="warning.dark" sx={{ textTransform: 'uppercase' }}>Pendiente Parcial</Typography>
                        </Box>
                    </Paper>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6}}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Fecha de Pago</Typography>
                            <Controller
                                name="fechaPago"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <FormDatePicker
                                        label=""
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={!!error}
                                        fullWidth
                                        sx={{ bgcolor: 'background.default' }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6}}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Tipo de Pago</Typography>
                            <Controller
                                name="tipoPagoID"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        size="small"
                                        error={!!error}
                                        helperText={error?.message}
                                        sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                    >
                                        <MenuItem value={0} disabled>Seleccione método</MenuItem>
                                        {tiposPago?.data?.map((tipo) => (
                                            <MenuItem key={tipo.id} value={tipo.id}>
                                                {tipo.text}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6}}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Monto a Abonar</Typography>
                            <Controller
                                name="montoAbonado"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        type="number"
                                        fullWidth
                                        size="small"
                                        error={!!error}
                                        helperText={error?.message}
                                        inputProps={{ step: "0.01", min: "0.01", max: maxAmount }}
                                        sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6}}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Moneda</Typography>
                            <Controller
                                name="monedaID"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        size="small"
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
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6}}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>N° Operación / Comprobante</Typography>
                            <Controller
                                name="numeroOperacion"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        size="small"
                                        placeholder="Ej: OP12345"
                                        error={!!error}
                                        helperText={error?.message}
                                        sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6}}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Fecha de Acreditación (Opcional)</Typography>
                            <Controller
                                name="fechaAcreditacion"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <FormDatePicker
                                        label=""
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={!!error}
                                        fullWidth
                                        sx={{ bgcolor: 'background.default' }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6}}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Estado del Pago</Typography>
                            <Controller
                                name="estadoID"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        size="small"
                                        error={!!error}
                                        helperText={error?.message}
                                        sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                    >
                                        <MenuItem value={0} disabled>Seleccione estado</MenuItem>
                                        {estadosPago?.data?.map((estado) => (
                                            <MenuItem key={estado.id} value={estado.id}>
                                                {estado.text}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12}}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Observaciones Internas</Typography>
                            <Controller
                                name="observacion"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="Detalles adicionales sobre la conciliación del pago..."
                                        error={!!error}
                                        helperText={error?.message}
                                        sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 0, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2, px: 3 }}>Cancelar</Button>
                <Button 
                    type="submit" 
                    form="pago-form" 
                    variant="contained" 
                    disabled={createMutation.isPending}
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    {createMutation.isPending ? 'Guardando...' : 'Confirmar Pago'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
