import { useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    MenuItem,
    Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createFacturaPagoSchema, type CreateFacturaPagoSchema } from '../../model/schema';
import { useCreateFacturaPago } from '../../hooks/useFacturaPagoCrud';
import { maestroApi } from '@/shared/api/maestro.api';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';
import { monedaApi } from '@/shared/api/moneda.api';
import { estadoApi } from '@/shared/api/estado.api';
import { ESTADO_SECCIONES, TIPO_MAESTRO } from '@/shared/constants/constantes';

interface FacturaPagoFormProps {
    onClose: () => void;
    facturaId: number;
    monedaId: number;
    maxAmount: number;
}

export function FacturaPagoForm({ onClose, facturaId, monedaId, maxAmount }: FacturaPagoFormProps) {
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
        queryFn: () => maestroApi.getSelect('',TIPO_MAESTRO.MEDIO_PAGO,10)
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
                fechaAcreditacion: data.fechaAcreditacion?.trim(),
                numeroOperacion: data.numeroOperacion?.trim(),
                observacion: data.observacion?.trim()
            }
        });
        onClose();
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12}}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Saldo Pendiente: {maxAmount}
                    </Alert>
                </Grid>

                <Grid size={{ xs: 12, sm: 6}}>
                            <Controller
                                name="fechaPago"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <FormDatePicker
                                        label="Fecha de Pago"
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={!!error}
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6}}>
                            <Controller
                                name="tipoPagoID"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Método de Pago"
                                        error={!!error}
                                        helperText={error?.message}
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
                            <Controller
                                name="estadoID"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Estado del Pago"
                                        error={!!error}
                                        helperText={error?.message}
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

                        <Grid size={{ xs: 12, sm: 6}}>
                            <Controller
                                name="fechaAcreditacion"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <FormDatePicker
                                        label="Fecha de Acreditación"
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={!!error}
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6}}>
                            <Controller
                                name="montoAbonado"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        type="number"
                                        fullWidth
                                        label="Monto Abonado"
                                        error={!!error}
                                        helperText={error?.message}
                                        inputProps={{ step: "0.01", min: "0.01", max: maxAmount }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6}}>
                            <Controller
                                name="numeroOperacion"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="N° Operación"
                                        placeholder="Ej: OP12345"
                                        error={!!error}
                                        helperText={error?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12}}>
                            <Controller
                                name="observacion"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label="Observación"
                                        error={!!error}
                                        helperText={error?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                        <Button onClick={onClose} color="inherit">Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </Box>
        </Box>
    );
}
