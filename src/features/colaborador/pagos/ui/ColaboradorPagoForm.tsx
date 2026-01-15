import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
    Typography,
    useTheme,
    alpha
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { colaboradorPagoApi } from '@entities/colaborador-pago/api/colaborador-pago.api';
import { maestroApi } from '@shared/api/maestro.api';
import { monedaApi } from '@entities/moneda/api/moneda.api';
import { TIPO_MAESTRO } from '@/shared/constants/constantes';
import type { ColaboradorPago } from '@entities/colaborador-pago/model/types';
import { createColaboradorPagoSchema } from '../model/schema';
import type { CreateColaboradorPagoSchema } from '../model/schema';
import { useEffect } from 'react';

interface ColaboradorPagoFormProps {
    open: boolean;
    onClose: () => void;
    colaboradorId: number;
    pagoToEdit?: ColaboradorPago | null;
}

export function ColaboradorPagoForm({ open, onClose, colaboradorId, pagoToEdit }: ColaboradorPagoFormProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const isEdit = !!pagoToEdit;

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
                    monedaID: pagoToEdit.monedaID,
                    monto: pagoToEdit.monto,
                    observaciones: pagoToEdit.observaciones || ''
                });
            } else {
                reset({
                    tipoPagoID: 0,
                    fechaInico: '',
                    fechaCierre: '',
                    monedaID: 0,
                    monto: 0,
                    observaciones: ''
                });
            }
        }
    }, [open, pagoToEdit, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateColaboradorPagoSchema) => {
            if (isEdit && pagoToEdit) {
                return colaboradorPagoApi.update(pagoToEdit.colaboradorPagoID, data);
            }
            return colaboradorPagoApi.create(colaboradorId, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['colaborador-pagos', colaboradorId] });
            onClose();
        }
    });

    const onSubmit = (data: CreateColaboradorPagoSchema) => {
        mutation.mutate(data);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle component="div" sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.background.default, 0.5)
            }}>
                <Typography variant="h6" component="div" fontWeight="bold">
                    {isEdit ? 'Editar Pago' : 'Nuevo Pago'}
                </Typography>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ p: 3 }}>
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

                        <Grid size={{xs:12, sm:6}}>
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

                        <Grid size={{xs:12, sm:6}}>
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
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        disabled={isSubmitting || mutation.isPending}
                    >
                        {isEdit ? 'Guardar Cambios' : 'Registrar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
