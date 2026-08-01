import { Box, Grid, Typography, Paper } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { FormDatePicker } from '@/shared/components/ui/FormDatePicker';
import { TextField } from '@mui/material';
import { LocalShipping } from '@mui/icons-material';
import type { SelectItem } from '@/shared/model/types';
import { getViajeFechaCargaLimits } from '@/features/viaje/model/form-values';

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
    const { register, formState: { errors } } = useFormContext();
    const { clientes, estados, viajeEstadoAgendadoId, flotaDisponibilidad } = options;
    const { min: fechaMinima, max: fechaMaxima } = getViajeFechaCargaLimits();
    const estadoAgendadoLabel = estados?.find((estado) => estado.id === viajeEstadoAgendadoId)?.text ?? 'Agendado';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1, display: 'block', mb: 1 }}>
                            Cliente Contratante
                        </Typography>
                        <FormSelect
                            label=""
                            registration={register('clienteID', { valueAsNumber: true })}
                            options={clientes || []}
                            defaultValue={0}
                            error={!!errors.clienteID}
                            helperText={errors.clienteID?.message as string}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, py: 1 } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1, display: 'block', mb: 1 }}>
                            Cotización de Referencia
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Ej: COT-2023-044"
                            {...register('cotizacionID', { valueAsNumber: true })}
                            error={!!errors.cotizacionID}
                            helperText={errors.cotizacionID?.message as string}
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
                            error={!!errors.estadoID}
                            helperText={(errors.estadoID?.message as string) || 'El estado inicial se registra automáticamente como Agendado.'}
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
                            inputProps={{ min: fechaMinima, max: fechaMaxima }}
                            error={!!errors.fechaCarga}
                            helperText={(errors.fechaCarga?.message as string) || `Seleccione una fecha entre ${fechaMinima} y ${fechaMaxima}.`}
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
