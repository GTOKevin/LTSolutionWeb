import {
    Box,
    Button,
    Divider,
    TextField,
    Grid,
    MenuItem,
    useTheme
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@shared/api/maestro.api';
import { monedaApi } from '@/shared/api/moneda.api';
import { TIPO_MAESTRO } from '@/shared/constants/constantes';
import type { ColaboradorPago } from '@entities/colaborador-pago/model/types';
import { createColaboradorPagoSchema, type CreateColaboradorPagoSchema } from '../model/schema';
import { useEffect } from 'react';
import { useCreateColaboradorPago, useUpdateColaboradorPago } from '../../hooks/useColaboradorPagoCrud';
import { handleAddressKeyDown } from '@shared/utils/input-validators';

interface ColaboradorPagoFormProps {
    open: boolean;
    onClose: () => void;
    colaboradorId: number;
    pagoToEdit?: ColaboradorPago | null;
}

export function ColaboradorPagoForm({ open, onClose, colaboradorId, pagoToEdit }: ColaboradorPagoFormProps) {
    const isEdit = !!pagoToEdit;

    const createMutation = useCreateColaboradorPago();
    const updateMutation = useUpdateColaboradorPago();

    // Queries
    const { data: tiposPago } = useQuery({
        queryKey: ['tipos-pago'],
        queryFn: () => maestroApi.getSelect(undefined, TIPO_MAESTRO.TIPO_PAGO),
        enabled: open
    });

    const { data: monedas } = useQuery({
        queryKey: ['monedas'],
        queryFn: () => monedaApi.getSelect(undefined, 100),
        enabled: open
    });

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<CreateColaboradorPagoSchema>({
        resolver: zodResolver(createColaboradorPagoSchema),
        defaultValues: {
            monto: 0
        }
    });

    useEffect(() => {
        if (open) {
            if (pagoToEdit) {
                reset({
                    tipoPagoID: pagoToEdit.tipoPagoID,
                    fechaInico: pagoToEdit.fechaInico,
                    fechaCierre: pagoToEdit.fechaCierre,
                    fechaPago: pagoToEdit.fechaPago,
                    monedaID: pagoToEdit.monedaID,
                    monto: pagoToEdit.monto,
                    observaciones: pagoToEdit.observaciones || ''
                });
            } else {
                reset({
                    tipoPagoID: 0,
                    fechaInico: '',
                    fechaCierre: '',
                    fechaPago: '',
                    monedaID: 0,
                    monto: 0,
                    observaciones: ''
                });
            }
        }
    }, [open, pagoToEdit, reset]);

    const onSubmit = (data: CreateColaboradorPagoSchema) => {
        if (isEdit && pagoToEdit) {
            updateMutation.mutate(
                { id: pagoToEdit.colaboradorPagoID, data },
                { onSuccess: () => {
                    reset();
                    onClose();
                }}
            );
        } else {
            createMutation.mutate(
                { colaboradorId, data },
                { onSuccess: () => {
                    reset({
                        tipoPagoID: 0,
                        fechaInico: '',
                        fechaCierre: '',
                        fechaPago: '',
                        monedaID: 0,
                        monto: 0,
                        observaciones: ''
                    });
                    onClose();
                }}
            );
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ p: 2.5 }}>
                <Grid container spacing={3}>
                    <Grid size={{xs:12}}>
                                <Controller
                                    name="tipoPagoID"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            select
                                            label="Tipo de Pago"
                                            fullWidth
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            value={field.value || 0}
                                            error={!!errors.tipoPagoID}
                                            helperText={errors.tipoPagoID?.message}
                                        >
                                            <MenuItem value={0} disabled>Seleccione</MenuItem>
                                            {tiposPago?.data?.map((t) => (
                                                <MenuItem key={t.id} value={t.id}>
                                                    {t.text}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>

                            <Grid size={{xs:12, sm:4}}>
                                <TextField
                                    label="Fecha Inicio"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    {...register('fechaInico')}
                                    error={!!errors.fechaInico}
                                    helperText={errors.fechaInico?.message}
                                />
                            </Grid>

                            <Grid size={{xs:12, sm:4}}>
                                <TextField
                                    label="Fecha Cierre"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    {...register('fechaCierre')}
                                    error={!!errors.fechaCierre}
                                    helperText={errors.fechaCierre?.message}
                                />
                            </Grid>

                            <Grid size={{xs:12, sm:4}}>
                                <TextField
                                    label="Fecha Pago"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    {...register('fechaPago')}
                                    error={!!errors.fechaPago}
                                    helperText={errors.fechaPago?.message}
                                />
                            </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <Controller
                                    name="monedaID"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            select
                                            label="Moneda"
                                            fullWidth
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            value={field.value || 0}
                                            error={!!errors.monedaID}
                                            helperText={errors.monedaID?.message}
                                        >
                                            <MenuItem value={0} disabled>Seleccione</MenuItem>
                                            {monedas?.data?.map((m) => (
                                                <MenuItem key={m.id} value={m.id}>
                                                    {m.text}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>

                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    label="Monto"
                                    type="number"
                                    fullWidth
                                    {...register('monto', { valueAsNumber: true })}
                                    error={!!errors.monto}
                                    helperText={errors.monto?.message}
                                />
                            </Grid>

                            <Grid size={{xs:12}}>
                                <TextField
                                    label="Observaciones"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    {...register('observaciones')}
                                    error={!!errors.observaciones}
                                    helperText={errors.observaciones?.message}
                                    onKeyDown={handleAddressKeyDown}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={onClose} color="inherit">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                        >
                            {isEdit ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    </Box>
        </form>
    );
}
