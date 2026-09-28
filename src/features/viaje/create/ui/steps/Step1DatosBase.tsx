import { Box, Grid, Typography, Paper } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';
import { AsyncAutocomplete } from '@/shared/components/ui/AsyncAutocomplete';
import { TextField } from '@mui/material';
import { LocalShipping } from '@mui/icons-material';
import type { SelectItem } from '@/shared/model/types';
import { getViajeFechaCargaLimits } from '@/features/viaje/model/form-values';
import { VIAJE_SELECT_KEYS, viajeResourceLoaders } from '@features/viaje/options/hooks/useViajeResourceSearch';
import type { ViajeWizardFormData } from '../../../model/schema';

interface Props {
    options: {
        clientes?: SelectItem[];
        estados?: SelectItem[];
        viajeEstadoAgendadoId?: number;
        flotaDisponibilidad?: {
            totalTractos: number;
            tractosLibres: number;
            porcentajeActiva: number;
        };
    };
}

export function Step1DatosBase({ options }: Props) {
    const { control, register, watch, formState: { errors } } = useFormContext<ViajeWizardFormData>();
    const { clientes, estados, viajeEstadoAgendadoId, flotaDisponibilidad } = options;
    const { loadClientes } = viajeResourceLoaders;
    const { min: fechaMinima, max: fechaMaxima } = getViajeFechaCargaLimits();
    const estadoId = watch('estadoID');
    const hasResolvedEstado = typeof estadoId === 'number' && estadoId > 0;
    const estadoAgendadoLabel = estados?.find((estado) => estado.id === estadoId)?.text
        ?? (hasResolvedEstado && estadoId === viajeEstadoAgendadoId ? 'Agendado' : '');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1 }}>
                                Cliente Contratante
                            </Typography>
                        </Box>
                        <Controller
                            name="clienteID"
                            control={control}
                            render={({ field }) => (
                                <AsyncAutocomplete
                                    resourceKey={VIAJE_SELECT_KEYS.clientes}
                                    label=""
                                    ariaLabel="Cliente Contratante"
                                    placeholder="Buscar cliente por nombre o documento..."
                                    required
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                    loadOptions={loadClientes}
                                    initialOptions={clientes}
                                    error={!!errors.clienteID}
                                    helperText={errors.clienteID?.message?.toString()}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, py: 1 } }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1, display: 'block', mb: 1 }}>
                            Cotización de Referencia
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Ej: COT-2023-044"
                            inputProps={{ 'aria-label': 'Cotización de Referencia' }}
                            {...register('cotizacionID', { valueAsNumber: true })}
                            error={!!errors.cotizacionID}
                            helperText={errors.cotizacionID?.message?.toString()}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1, display: 'block', mb: 1 }}>
                            Status Inicial
                        </Typography>
                        <input type="hidden" {...register('estadoID', { valueAsNumber: true })} />
                        <TextField
                            fullWidth
                            value={estadoAgendadoLabel}
                            disabled
                            inputProps={{ 'aria-label': 'Status Inicial' }}
                            error={!!errors.estadoID}
                            helperText={(errors.estadoID?.message?.toString()) || (
                                hasResolvedEstado
                                    ? 'El estado inicial se registra automáticamente como Agendado.'
                                    : 'Resolviendo el estado inicial del viaje...'
                            )}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1, display: 'block', mb: 1 }}>
                            Fecha de Carga
                        </Typography>
                        <FormDatePicker
                            label=""
                            registration={register('fechaCarga')}
                            inputProps={{ min: fechaMinima, max: fechaMaxima, 'aria-label': 'Fecha de Carga' }}
                            error={!!errors.fechaCarga}
                            helperText={(errors.fechaCarga?.message?.toString()) || `Seleccione una fecha entre ${fechaMinima} y ${fechaMaxima}.`}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: '#0f172a',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="caption" fontWeight={700} color="primary.light" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                Disponibilidad de Flota
                            </Typography>
                            <Typography variant="h4" fontWeight={800} mt={1}>
                                {flotaDisponibilidad ? `${flotaDisponibilidad.porcentajeActiva}% Activa` : 'Cargando...'}
                            </Typography>
                            <Typography variant="body2" color="grey.400" mt={0.5}>
                                Región con alta demanda.
                            </Typography>
                        </Box>
                        <Box sx={{ position: 'relative', zIndex: 1, mt: 3 }}>
                            <Box component="span" sx={{ px: 2, py: 0.5, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                {flotaDisponibilidad ? `${flotaDisponibilidad.tractosLibres} Tractos Libres` : '--'}
                            </Box>
                        </Box>
                        <LocalShipping sx={{ position: 'absolute', right: -16, bottom: -16, fontSize: 120, opacity: 0.1, transform: 'rotate(12deg)' }} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
