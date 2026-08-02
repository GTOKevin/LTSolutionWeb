import type { FormEventHandler } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { Box, Grid, MenuItem, Paper, TextField, Typography, useTheme, Tooltip } from '@mui/material';
import { Receipt as ReceiptIcon, InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';
import { FormDatePicker } from '@shared/components/ui/FormDatePicker';
import type { SelectItem } from '@shared/model/types';
import type { CreateFacturaSchema } from '../../model/schema';

interface FacturaBasicInfoFormProps {
    form: UseFormReturn<CreateFacturaSchema>;
    clientes?: SelectItem[];
    monedas?: SelectItem[];
    isEdit: boolean;
    viewOnly: boolean;
    onSubmit: FormEventHandler<HTMLFormElement>;
}

export function FacturaBasicInfoForm({
    form,
    clientes,
    monedas,
    isEdit,
    viewOnly,
    onSubmit,
}: FacturaBasicInfoFormProps) {
    const theme = useTheme();
    const { control, formState: { errors } } = form;

    return (
        <Paper
            sx={{
                p: 4,
                borderRadius: 3,
                boxShadow: '0 24px 40px -10px rgba(25, 28, 29, 0.05)',
                border: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, color: 'primary.main' }}>
                <ReceiptIcon />
                <Typography variant="h6" fontWeight="bold">
                    Información Básica
                </Typography>
            </Box>

            <form id="factura-form" onSubmit={onSubmit}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Cliente
                        </Typography>
                        <Controller
                            name="clienteID"
                            disabled={isEdit || viewOnly}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    fullWidth
                                    error={!!errors.clienteID}
                                    helperText={errors.clienteID?.message}
                                    disabled={isEdit || viewOnly}
                                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                >
                                    <MenuItem value={0} disabled>
                                        Seleccione un cliente
                                    </MenuItem>
                                    {clientes?.map((cliente) => (
                                        <MenuItem key={cliente.id} value={cliente.id}>
                                            {cliente.text}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Serie
                        </Typography>
                        <Controller
                            name="serie"
                            disabled={isEdit || viewOnly}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    placeholder="F001"
                                    error={!!errors.serie}
                                    helperText={errors.serie?.message}
                                    inputProps={{ style: { textTransform: 'uppercase' } }}
                                    onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                                    disabled={isEdit || viewOnly}
                                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Número
                        </Typography>
                        <Controller
                            name="numero"
                            disabled={isEdit || viewOnly}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    placeholder="00000001"
                                    error={!!errors.numero}
                                    helperText={errors.numero?.message}
                                    disabled={isEdit || viewOnly}
                                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
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
                                    error={!!errors.monedaID}
                                    helperText={errors.monedaID?.message}
                                    disabled={isEdit || viewOnly}
                                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                >
                                    <MenuItem value={0} disabled>
                                        Seleccione moneda
                                    </MenuItem>
                                    {monedas?.map((moneda) => (
                                        <MenuItem key={moneda.id} value={moneda.id}>
                                            {moneda.text}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Fecha Emisión
                        </Typography>
                        <Controller
                            name="fechaEmision"
                            control={control}
                            render={({ field }) => (
                                <FormDatePicker
                                    label=""
                                    size="medium"
                                    disabled={isEdit || viewOnly}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={!!errors.fechaEmision}
                                    fullWidth
                                    sx={{ bgcolor: 'background.default' }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Días de Crédito
                            <Tooltip title="Acuerdo promedio conversado con el cliente. La fecha de compromiso de pago se calcula automáticamente sumando estos días a la Fecha de Emisión." placement="top">
                                <InfoOutlinedIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.secondary' }} />
                            </Tooltip>
                        </Typography>
                        <Controller
                            name="diasCredito"
                            control={control}
                            disabled={isEdit || viewOnly}
                            render={({ field, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    type="number"
                                    fullWidth
                                    error={!!error}
                                    helperText={error?.message}
                                    inputProps={{ min: 0 }}
                                    onChange={(event) => field.onChange(event.target.value === '' ? null : Number(event.target.value))}
                                    disabled={isEdit || viewOnly}
                                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Fecha Vencimiento
                            <Tooltip title="Tope máximo de espera para el pago. Por defecto: 1 mes desde la emisión." placement="top">
                                <InfoOutlinedIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.secondary' }} />
                            </Tooltip>
                        </Typography>
                        <Controller
                            name="fechaVencimiento"
                            control={control}
                            render={({ field }) => (
                                <FormDatePicker
                                    label=""
                                    size="medium"
                                    disabled={viewOnly}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={!!errors.fechaVencimiento}
                                    fullWidth
                                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
}
