import { Box, Typography, Grid, Paper, TextField, Chip, alpha, useTheme } from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';
import type { Viaje } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import type { ResumenGeneralData } from '../../../model/viaje-edit-tabs';
import { resolveViajeEstadoProyectado } from '@entities/viaje/model/status';
import { VIAJE_RECURSO_LABELS } from '@/features/viaje/model/viaje-resource-labels';

interface TrackingDatesKmSectionProps {
    viaje: Viaje;
    formData: ResumenGeneralData;
    onChange: (data: Partial<ResumenGeneralData>) => void;
    isViewOnly?: boolean;
    viajeEstados?: SelectItem[];
}

export function TrackingDatesKmSection({
    viaje,
    formData,
    onChange,
    isViewOnly = false,
    viajeEstados,
}: TrackingDatesKmSectionProps) {
    const theme = useTheme();

    const handleNumberChange = (field: keyof ResumenGeneralData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange({ [field]: val === '' ? '' : Number(val) });
    };

    const handleFechaChange = (field: 'fechaPartida' | 'fechaDescarga') => (date: Dayjs | null) => {
        const next: Partial<ResumenGeneralData> = { [field]: date };
        const fechaActualStr = (value: Dayjs | null | undefined) => (value ? value.format('YYYY-MM-DD') : undefined);

        const estadoPendienteCodigo =
            viajeEstados?.find((item) => item.id === formData.estadoID)?.extra
            ?? viaje.estado?.codigo
            ?? null;

        const estadoProyectado = resolveViajeEstadoProyectado(
            {
                fechaPartida: field === 'fechaPartida' ? fechaActualStr(date) : fechaActualStr(formData.fechaPartida),
                fechaDescarga: field === 'fechaDescarga' ? fechaActualStr(date) : fechaActualStr(formData.fechaDescarga),
            },
            estadoPendienteCodigo,
            viajeEstados,
        );

        if (estadoProyectado) {
            next.estadoID = estadoProyectado.estadoID;
            next.estadoNombre = estadoProyectado.estadoNombre;
        }

        onChange(next);
    };

    // N2 (decision documentada): en este flujo "recorrida" = ciclo completo hasta
    // el retorno a base (kmLlegadaBase - kmInicio). El tramo solo hasta destino se
    // lee en el campo `Km Llegada`.
    // TODO(backend-contract): confirmar con negocio/backend si la distancia oficial
    // del viaje es a destino o con retorno, y mover el calculo al contrato si aplica.
    const kmInicio = typeof formData.kmInicio === 'number' ? formData.kmInicio : 0;
    const kmLlegadaBase = typeof formData.kmLlegadaBase === 'number' ? formData.kmLlegadaBase : 0;
    const distanciaRecorrida = kmLlegadaBase > kmInicio && kmInicio > 0 ? (kmLlegadaBase - kmInicio) : null;

    // L-N2: fallbacks neutros del modulo de etiquetas (nunca hardcodes sueltos).
    const tractoPlaca = viaje.esTractoTercero
        ? (viaje.placaTractoTercero || VIAJE_RECURSO_LABELS.sinPlaca)
        : (viaje.tracto?.placa || VIAJE_RECURSO_LABELS.sinPlaca);

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <AccessTimeOutlinedIcon fontSize="small" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.primary' }}>
                            Seguimiento, Fechas y Kilometraje
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Cronograma de hitos de viaje y registro de odómetros de la unidad
                        </Typography>
                    </Box>
                </Box>
                {formData.requiereEscolta && (
                    <Chip
                        label="Escolta activa"
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                )}
            </Box>

            <Grid container spacing={3.5}>
                {/* Columna Izquierda: Cronograma de Fechas */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarMonthOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary' }}>
                                Cronograma Operativo de Fechas
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                    Fecha Carga
                                </Typography>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    slotProps={{ textField: { fullWidth: true, size: 'small', sx: { bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                                    value={formData.fechaCarga}
                                    onChange={(date) => onChange({ fechaCarga: date })}
                                    disabled={isViewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                    Fecha Partida
                                </Typography>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    slotProps={{ textField: { fullWidth: true, size: 'small', sx: { bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                                    value={formData.fechaPartida}
                                    onChange={handleFechaChange('fechaPartida')}
                                    disabled={isViewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                    Fecha Llegada Destino
                                </Typography>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    slotProps={{ textField: { fullWidth: true, size: 'small', sx: { bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                                    value={formData.fechaLlegada}
                                    onChange={(date) => onChange({ fechaLlegada: date })}
                                    disabled={isViewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                    Fecha Descarga
                                </Typography>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    slotProps={{ textField: { fullWidth: true, size: 'small', sx: { bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                                    value={formData.fechaDescarga}
                                    onChange={handleFechaChange('fechaDescarga')}
                                    disabled={isViewOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5, ml: 0.5 }}>
                                    Fecha Retorno / Base
                                </Typography>
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    slotProps={{ textField: { fullWidth: true, size: 'small', sx: { bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                                    value={formData.fechaLlegadaBase}
                                    onChange={(date) => onChange({ fechaLlegadaBase: date })}
                                    disabled={isViewOnly}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                {/* Columna Derecha: Lectura de Kilometraje */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SpeedOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary' }}>
                                    Lectura de Kilometraje
                                </Typography>
                            </Box>
                            <Chip
                                label={`Tracto ${tractoPlaca}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ fontWeight: 700, fontSize: '0.68rem', fontFamily: 'monospace' }}
                            />
                        </Box>

                        <Grid container spacing={1.5}>
                            <Grid size={{ xs: 4 }}>
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.text.primary, 0.02), border: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
                                        Km Inicio
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={formData.kmInicio}
                                        onChange={handleNumberChange('kmInicio')}
                                        disabled={isViewOnly}
                                        slotProps={{
                                            input: {
                                                sx: {
                                                    fontFamily: 'monospace',
                                                    fontWeight: 800,
                                                    fontSize: '0.9rem',
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 4 }}>
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.text.primary, 0.02), border: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
                                        Km Llegada
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={formData.kmLlegada}
                                        onChange={handleNumberChange('kmLlegada')}
                                        disabled={isViewOnly}
                                        slotProps={{
                                            input: {
                                                sx: {
                                                    fontFamily: 'monospace',
                                                    fontWeight: 800,
                                                    fontSize: '0.9rem',
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 4 }}>
                                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.text.primary, 0.02), border: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
                                        Km en Base
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={formData.kmLlegadaBase}
                                        onChange={handleNumberChange('kmLlegadaBase')}
                                        disabled={isViewOnly}
                                        slotProps={{
                                            input: {
                                                sx: {
                                                    fontFamily: 'monospace',
                                                    fontWeight: 800,
                                                    fontSize: '0.9rem',
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        <Box
                            sx={{
                                p: 1.5,
                                px: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                Distancia total con retorno:
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main' }}>
                                {distanciaRecorrida !== null ? `${distanciaRecorrida.toLocaleString()} km` : 'En cálculo de odómetro'}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}
