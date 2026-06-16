import { useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    TextField,
    MenuItem,
    useTheme,
    alpha,
    Paper,
    CircularProgress,
    IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { useForm, Controller, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createFacturaSchema, type CreateFacturaSchema } from '../../model/schema';
import { clienteApi } from '@/entities/cliente/api/cliente.api';
import { monedaApi } from '@/shared/api/moneda.api';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';
import { useCreateFactura, useUpdateFactura, useFactura } from '../../hooks/useFacturaCrud';
import { FacturaDetalles } from '../../detalles/ui/Index';
import { ESTADO_FACTURA_ID} from '@/shared/constants/constantes';

interface FacturaCreateEditProps {
    id?: number;
}

export function FacturaCreateEdit({ id }: FacturaCreateEditProps) {
    const isEdit = !!id;
    const theme = useTheme();
    const navigate = useNavigate();

    const { data: factura, isLoading: isLoadingFactura } = useFactura(id);
    const createMutation = useCreateFactura();
    const updateMutation = useUpdateFactura();
    const isSaving = createMutation.isPending || updateMutation.isPending;

    const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateFacturaSchema>({
        resolver: zodResolver(createFacturaSchema) as Resolver<CreateFacturaSchema>,
        defaultValues: {
            clienteID: 1,
            serie: '',
            numero: '',
            fechaEmision: new Date().toISOString().split('T')[0],
            fechaCompromisoPago: '',
            diasCredito: null,
            monedaID: 1,
            estadoID: 1
        }
    });

    useEffect(() => {
        if (isEdit && factura) {
            reset({
                clienteID: factura.clienteID,
                serie: factura.serie,
                numero: factura.numero,
                fechaEmision: factura.fechaEmision.split('T')[0],
                fechaCompromisoPago: factura.fechaCompromisoPago ? factura.fechaCompromisoPago.split('T')[0] : '',
                diasCredito: factura.diasCredito || null,
                monedaID: factura.monedaID,
                estadoID: factura.estadoID
            });
        }
    }, [isEdit, factura, reset]);

    const { data: clientes } = useQuery({
        queryKey: ['clientes', 'select'],
        queryFn: () => clienteApi.getSelect("", 50)
    });

    const { data: monedas } = useQuery({
        queryKey: ['monedas', 'select'],
        queryFn: () => monedaApi.getSelect("", 50)
    });

    const handleFormSubmit: SubmitHandler<CreateFacturaSchema> = async (data) => {
        try {
            const formattedData = {
                ...data,
                fechaCompromisoPago: data.fechaCompromisoPago || null
            };

            if (isEdit && factura) {
                await updateMutation.mutateAsync({
                    id: factura.facturaID,
                    data: {
                        fechaCompromisoPago: formattedData.fechaCompromisoPago,
                        monedaID: formattedData.monedaID,
                        estadoID: formattedData.estadoID,
                        activo: true
                    }
                });
                navigate('/app/facturas');
            } else {
                const newId = await createMutation.mutateAsync({ ...formattedData, estadoID: ESTADO_FACTURA_ID.GENERADO, detalles: [], pagos: [] });
                navigate(`/app/facturas/${newId}`);
            }
        } catch (error) {
            console.error("Error al guardar la factura:", error);
        }
    };

    if (isEdit && isLoadingFactura) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Header */}
            <Box sx={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 40, 
                bgcolor: alpha(theme.palette.background.default, 0.9), 
                backdropFilter: 'blur(12px)',
                py: 2,
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/app/facturas')} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" color="text.primary">
                            {isEdit ? `Factura ${factura?.serie}-${factura?.numero}` : 'Nueva Factura'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            Registro de comprobante electrónico
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={() => navigate('/app/facturas')} color="inherit">
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        form="factura-form" 
                        variant="contained" 
                        disabled={isSaving}
                        sx={{ 
                            borderRadius: 3, 
                            px: 4, 
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            boxShadow: theme.shadows[4]
                        }}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Factura'}
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Basic Info */}
                        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 24px 40px -10px rgba(25, 28, 29, 0.05)', border: `1px solid ${theme.palette.divider}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, color: 'primary.main' }}>
                                <ReceiptIcon />
                                <Typography variant="h6" fontWeight="bold">Información Básica</Typography>
                            </Box>
                            
                            <form id="factura-form" onSubmit={handleSubmit(handleFormSubmit)}>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12}}>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Cliente</Typography>
                                        <Controller
                                            name="clienteID"
                                            disabled={isEdit}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    select
                                                    fullWidth
                                                    error={!!errors.clienteID}
                                                    helperText={errors.clienteID?.message}
                                                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                                >
                                                    <MenuItem value={0} disabled>Seleccione un cliente</MenuItem>
                                                    {clientes?.data?.map((cliente) => (
                                                        <MenuItem key={cliente.id} value={cliente.id}>
                                                            {cliente.text}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid> 

                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Serie</Typography>
                                        <Controller
                                            name="serie"
                                            disabled={isEdit}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    placeholder="F001"
                                                    error={!!errors.serie}
                                                    helperText={errors.serie?.message}
                                                    inputProps={{ style: { textTransform: 'uppercase' } }}
                                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Número</Typography>
                                        <Controller
                                            name="numero"
                                            disabled={isEdit}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    placeholder="00000001"
                                                    error={!!errors.numero}
                                                    helperText={errors.numero?.message}
                                                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Moneda</Typography>
                                        <Controller
                                            name="monedaID"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    select
                                                    fullWidth
                                                    error={!!errors.monedaID}
                                                    helperText={errors.monedaID?.message}
                                                    disabled={isEdit} 
                                                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                                >
                                                    <MenuItem value={0} disabled>Seleccione moneda</MenuItem>
                                                    {monedas?.data?.map((moneda) => (
                                                        <MenuItem key={moneda.id} value={moneda.id}>
                                                            {moneda.text}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Fecha Emisión</Typography>
                                        <Controller
                                            name="fechaEmision"
                                            control={control}
                                            render={({ field }) => (
                                                <FormDatePicker
                                                    label=""
                                                    size="medium"
                                                    disabled={isEdit}
                                                    value={field.value}
                                                    onChange={(value) => field.onChange(value)}
                                                    error={!!errors.fechaEmision}
                                                    fullWidth
                                                    sx={{ bgcolor: 'background.default' }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Días de Crédito</Typography>
                                        <Controller
                                            name="diasCredito"
                                            control={control}
                                            disabled={isEdit}
                                            render={({ field, fieldState: { error } }) => (
                                                <TextField
                                                    {...field}
                                                    type="number"
                                                    fullWidth
                                                    error={!!error}
                                                    helperText={error?.message}
                                                    inputProps={{ min: 0 }}
                                                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Fecha Compromiso</Typography>
                                        <Controller
                                            name="fechaCompromisoPago"
                                            control={control}
                                            render={({ field }) => (
                                                <FormDatePicker
                                                    label=""
                                                    size="medium"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    error={!!errors.fechaCompromisoPago}
                                                    fullWidth
                                                    sx={{ bgcolor: 'background.default', borderRadius: 2  }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                </Grid>
                            </form>
                        </Paper>

                        {/* Detalles */}
                        {isEdit && factura && (
                            <Box>
                                <FacturaDetalles factura={factura} />
                            </Box>
                        )}
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
                        {/* Financial Summary */}
                        {isEdit && factura ? (
                            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 24px 40px -10px rgba(25, 28, 29, 0.05)', border: `1px solid ${theme.palette.divider}`, position: 'relative', overflow: 'hidden' }}>
                                <Box sx={{ position: 'absolute', right: -40, top: -40, width: 150, height: 150, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '50%', filter: 'blur(40px)' }} />
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, color: 'primary.main', position: 'relative', zIndex: 1 }}>
                                    <ReceiptIcon />
                                    <Typography variant="h6" fontWeight="bold">Resumen Financiero</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'relative', zIndex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body1" color="text.secondary" fontWeight="medium">Subtotal</Typography>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>{factura.moneda?.simbolo || 'S/'}</Typography>
                                            <Typography variant="h6" fontWeight="bold" fontFamily="monospace">{factura.subTotal.toFixed(2)}</Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body1" color="text.secondary" fontWeight="medium">IGV</Typography>
                                            <Box sx={{ px: 1, py: 0.25, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 10 }}>
                                                <Typography variant="caption" fontWeight="bold" color="success.main">18%</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="h6" fontWeight="bold" color="text.secondary" fontFamily="monospace">{factura.igv.toFixed(2)}</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ height: 1, bgcolor: 'divider', my: 1 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" fontWeight="bold" color="text.primary">Total Factura</Typography>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" color="primary.main" fontWeight="bold" sx={{ display: 'block' }}>{factura.moneda?.nombre}</Typography>
                                            <Typography variant="h4" fontWeight="bold" color="primary.main" fontFamily="monospace">{factura.total.toFixed(2)}</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 2, p: 3, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 3, borderLeft: `4px solid ${theme.palette.warning.main}` }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="caption" fontWeight="bold" textTransform="uppercase" letterSpacing={1} color="warning.dark">
                                                    Saldo Pendiente
                                                </Typography>
                                            </Box>
                                            <Typography variant="h6" fontWeight="bold" color="warning.dark" fontFamily="monospace">
                                                {factura.saldoPendiente.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 4, textAlign: 'center', fontStyle: 'italic' }}>
                                    Los cálculos de impuestos se realizan automáticamente bajo las normativas vigentes.
                                </Typography>
                            </Paper>
                        ) : (
                            <Paper sx={{ p: 4, borderRadius: 3, border: `1px dashed ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    Guarde la información básica de la factura para habilitar los detalles y el resumen financiero.
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
