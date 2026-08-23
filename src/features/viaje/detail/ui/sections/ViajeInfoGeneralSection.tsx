import {
    Box,
    Chip,
    Grid,
    Paper,
    Stack,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    ArrowForward as ArrowForwardIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarTodayIcon,
    Inventory2Outlined as Inventory2OutlinedIcon,
    LocalShipping as LocalShippingIcon,
    LocationOn as LocationOnIcon,
    Person as PersonIcon,
    RvHookup as RvHookupIcon,
    Scale as ScaleIcon,
    Straighten as StraightenIcon,
} from '@mui/icons-material';
import type { ViajeDetail, ViajeMercaderiaDetail } from '@/entities/viaje/model/types';
import { formatDateShort } from '@/shared/utils/date-utils';
import { formatDecimalAmount } from '@/shared/utils/format-utils';
import { useViajeGastos } from '@features/viaje/hooks/useViajeGastos';

interface ViajeInfoGeneralSectionProps {
    viaje: ViajeDetail;
}

const getMercaderiaMedidas = (item: ViajeMercaderiaDetail) => {
    const dimensiones = [item.largo, item.ancho, item.alto]
        .map((value) => (value === null || value === undefined ? null : `${value}`))
        .filter(Boolean)
        .join(' x ');

    return dimensiones || '—';
};

const getMercaderiaPeso = (item: ViajeMercaderiaDetail) => {
    if (item.peso === null || item.peso === undefined) return '—';
    return `${item.peso} ${item.tipoPesoDescripcion ?? ''}`.trim();
};

export function ViajeInfoGeneralSection({ viaje }: ViajeInfoGeneralSectionProps) {
    const theme = useTheme();
    const { data: gastosData } = useViajeGastos(viaje.viajeID, 1, 100);
    const conductorNombre = viaje.conductorNombreCompleto;
    const origenDescripcion = viaje.origenDescripcion;
    const destinoDescripcion = viaje.destinoDescripcion;
    const mercaderias = viaje.mercaderias ?? [];

    const gastos = gastosData?.items ?? [];
    const totalGalonesConsumidos = gastos
        .filter((gasto) => gasto.combustible)
        .reduce((acc, gasto) => acc + (gasto.galones ?? 0), 0);

    const kmRecorridoDestino = viaje.kmInicio != null && viaje.kmLlegada != null ? viaje.kmLlegada - viaje.kmInicio : null;
    const kmRecorridoBase = viaje.kmInicio != null && viaje.kmLlegadaBase != null ? viaje.kmLlegadaBase - viaje.kmInicio : null;

    const formatKm = (value: number | null | undefined) => (value == null || value < 0 ? '—' : `${value.toLocaleString()} km`);

    return (
        <Stack spacing={3}>
            {/* 1. Información del Servicio */}
            <Box>
                <Typography
                    variant="caption"
                    fontWeight={800}
                    color="text.secondary"
                    sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}
                >
                    Información del Servicio
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                height: '100%',
                                bgcolor: alpha(theme.palette.background.default, 0.6),
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                <BusinessIcon fontSize="small" color="action" />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Cliente
                                </Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight={700} noWrap title={viaje.clienteRazonSocial || 'Sin cliente'}>
                                {viaje.clienteRazonSocial || 'Sin cliente asociado'}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                height: '100%',
                                bgcolor: alpha(theme.palette.background.default, 0.6),
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                <PersonIcon fontSize="small" color="action" />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Conductor
                                </Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight={700} noWrap title={conductorNombre || 'Sin conductor'}>
                                {conductorNombre || 'Sin conductor asignado'}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                height: '100%',
                                bgcolor: alpha(theme.palette.background.default, 0.6),
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                <LocalShippingIcon fontSize="small" color="action" />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Tracto
                                </Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight={800} color="primary.main">
                                {viaje.tractoPlaca || 'Sin asignar'}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                height: '100%',
                                bgcolor: alpha(theme.palette.background.default, 0.6),
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                <RvHookupIcon fontSize="small" color="action" />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Carreta
                                </Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight={800} color="primary.main">
                                {viaje.carretaPlaca || 'Sin carreta'}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* 2. Ruta */}
            <Box>
                <Typography
                    variant="caption"
                    fontWeight={800}
                    color="text.secondary"
                    sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}
                >
                    Ruta de Transporte
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                border: '1px dashed',
                                borderColor: alpha(theme.palette.primary.main, 0.4),
                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <LocationOnIcon fontSize="small" color="primary" />
                                <Typography variant="caption" fontWeight={800} color="primary.main" sx={{ letterSpacing: '0.05em' }}>
                                    PUNTO DE ORIGEN
                                </Typography>
                            </Stack>
                            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                {origenDescripcion || 'Origen no especificado'}
                            </Typography>
                            {viaje.direccionOrigen && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {viaje.direccionOrigen}
                                </Typography>
                            )}
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                border: '1px dashed',
                                borderColor: alpha(theme.palette.secondary.main, 0.4),
                                bgcolor: alpha(theme.palette.secondary.main, 0.02),
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <ArrowForwardIcon fontSize="small" color="secondary" />
                                <Typography variant="caption" fontWeight={800} color="secondary.main" sx={{ letterSpacing: '0.05em' }}>
                                    PUNTO DE DESTINO
                                </Typography>
                            </Stack>
                            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                {destinoDescripcion || 'Destino no especificado'}
                            </Typography>
                            {viaje.direccionDestino && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {viaje.direccionDestino}
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* 3. Seguimiento y Control (fechas + km) */}
            <Box>
                <Typography
                    variant="caption"
                    fontWeight={800}
                    color="text.secondary"
                    sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}
                >
                    Seguimiento y Control
                </Typography>
                <Grid container spacing={2}>
                    {[
                        { label: 'Fecha Carga', val: formatDateShort(viaje.fechaCarga) },
                        { label: 'Fecha Partida', val: formatDateShort(viaje.fechaPartida || '') },
                        { label: 'Fecha Llegada', val: formatDateShort(viaje.fechaLlegada || '') },
                        { label: 'Fecha Descarga', val: formatDateShort(viaje.fechaDescarga || '') },
                        { label: 'Llegada a Base', val: formatDateShort(viaje.fechaLlegadaBase || '') },
                    ].map((item, idx) => (
                        <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={idx}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.background.default, 0.6),
                                }}
                            >
                                <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
                                    <CalendarTodayIcon fontSize="inherit" color="action" />
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        {item.label}
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" fontWeight={700}>
                                    {item.val || '—'}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Km Inicio (Salida)
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="primary.main" mt={0.5}>
                                {formatKm(viaje.kmInicio)}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Km Llegada (Destino)
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="primary.main" mt={0.5}>
                                {formatKm(viaje.kmLlegada)}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Km Llegada a Base
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="primary.main" mt={0.5}>
                                {formatKm(viaje.kmLlegadaBase)}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.success.main, 0.04),
                            }}
                        >
                            <Typography variant="caption" color="success.main" fontWeight={700}>
                                Km Recorrido (Salida → Destino)
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="success.main" mt={0.5}>
                                {formatKm(kmRecorridoDestino)}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.success.main, 0.04),
                            }}
                        >
                            <Typography variant="caption" color="success.main" fontWeight={700}>
                                Km Recorrido (Salida → Base)
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="success.main" mt={0.5}>
                                {formatKm(kmRecorridoBase)}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                            }}
                        >
                            <Typography variant="caption" color="primary.main" fontWeight={700}>
                                Galones Consumidos
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="primary.main" mt={0.5}>
                                {gastosData ? `${formatDecimalAmount(totalGalonesConsumidos)} gal` : '—'}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* 4. Configuración de Carga y Medidas */}
            <Box>
                <Typography
                    variant="caption"
                    fontWeight={800}
                    color="text.secondary"
                    sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}
                >
                    Configuración de Carga y Medidas
                </Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Grid container spacing={2}>
                            {[
                                { label: 'Largo', val: viaje.largo ? `${viaje.largo} m` : '—' },
                                { label: 'Ancho', val: viaje.ancho ? `${viaje.ancho} m` : '—' },
                                { label: 'Alto', val: viaje.alto ? `${viaje.alto} m` : '—' },
                                { label: 'Peso Total', val: viaje.peso ? `${viaje.peso} tn` : '—' },
                            ].map((item, idx) => (
                                <Grid size={{ xs: 6 }} key={idx}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
                                            {item.label === 'Peso Total' ? <ScaleIcon fontSize="inherit" color="action" /> : <StraightenIcon fontSize="inherit" color="action" />}
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                {item.label}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body1" fontWeight={700}>
                                            {item.val}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 4 }}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Ejes Tracto
                                    </Typography>
                                    <Typography variant="h6" fontWeight={800} mt={0.5}>
                                        {viaje.ejesTracto ?? '—'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Ejes Carreta
                                    </Typography>
                                    <Typography variant="h6" fontWeight={800} mt={0.5}>
                                        {viaje.ejesCarreta ?? '—'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <Typography variant="caption" color="primary.main" fontWeight={700}>
                                        Ejes Totales
                                    </Typography>
                                    <Typography variant="h6" fontWeight={800} color="primary.main" mt={0.5}>
                                        {(viaje.ejesTracto || 0) + (viaje.ejesCarreta || 0) || '—'}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>

            {/* 5. Mercadería Transportada */}
            <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <Inventory2OutlinedIcon fontSize="small" color="primary" />
                    <Typography
                        variant="caption"
                        fontWeight={800}
                        color="text.secondary"
                        sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
                    >
                        Mercadería Transportada
                    </Typography>
                    <Chip
                        label={`${mercaderias.length} ${mercaderias.length === 1 ? 'item' : 'items'}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                </Stack>

                {mercaderias.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No se registraron mercaderías para este viaje.
                        </Typography>
                    </Paper>
                ) : (
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Box component="table" sx={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <Box component="thead">
                                    <Box component="tr" sx={{ bgcolor: alpha(theme.palette.background.default, 0.7) }}>
                                        {['Mercadería', 'Descripción', 'Medidas', 'Peso'].map((header) => (
                                            <Box
                                                component="th"
                                                key={header}
                                                sx={{
                                                    px: 2,
                                                    py: 1.5,
                                                    typography: 'overline',
                                                    fontWeight: 800,
                                                    color: 'text.secondary',
                                                    letterSpacing: 1,
                                                }}
                                            >
                                                {header}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                                <Box component="tbody" sx={{ '& tr:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                                    {mercaderias.map((item) => (
                                        <Box component="tr" key={item.viajeMercaderiaID} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                                            <Box component="td" sx={{ px: 2, py: 1.5 }}>
                                                <Typography variant="body2" fontWeight={700} color="primary.main">
                                                    {item.mercaderiaDescripcion || 'Mercadería'}
                                                </Typography>
                                            </Box>
                                            <Box component="td" sx={{ px: 2, py: 1.5 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.descripcion || '—'}
                                                </Typography>
                                            </Box>
                                            <Box component="td" sx={{ px: 2, py: 1.5 }}>
                                                <Typography variant="body2">
                                                    {getMercaderiaMedidas(item)}
                                                </Typography>
                                            </Box>
                                            <Box component="td" sx={{ px: 2, py: 1.5 }}>
                                                <Typography variant="body2">
                                                    {getMercaderiaPeso(item)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                )}
            </Box>
        </Stack>
    );
}