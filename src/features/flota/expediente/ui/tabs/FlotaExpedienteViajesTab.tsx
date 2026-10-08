import { useState, useMemo } from 'react';
import {
    Box,
    Button,
    Chip,
    Collapse,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    AltRoute as AltRouteIcon,
    ArrowForward as ArrowForwardIcon,
    FilterList as FilterListIcon,
    Download as DownloadIcon,
    Search as SearchIcon,
    DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { FlotaHistorialViaje } from '@entities/flota/model/types';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { formatDateShort } from '@shared/utils/date-utils';

interface FlotaExpedienteViajesTabProps {
    flotaId: number;
    placa?: string;
}

export function FlotaExpedienteViajesTab({ flotaId, placa }: FlotaExpedienteViajesTabProps) {
    const theme = useTheme();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [filterText, setFilterText] = useState('');

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.historialViajes(flotaId, page, rowsPerPage),
        queryFn: () => flotaApi.getHistorialViajes(flotaId, { page: page + 1, size: rowsPerPage }),
        enabled: flotaId > 0,
    });

    const items: FlotaHistorialViaje[] = data?.items ?? [];
    const totalCount = data?.total ?? 0;

    const filteredItems = useMemo(() => {
        if (!filterText.trim()) return items;
        const q = filterText.toLowerCase();
        return items.filter(
            (v) =>
                v.codigo?.toLowerCase().includes(q) ||
                v.origenNombre?.toLowerCase().includes(q) ||
                v.destinoNombre?.toLowerCase().includes(q) ||
                v.conductorNombre?.toLowerCase().includes(q) ||
                v.estadoNombre?.toLowerCase().includes(q)
        );
    }, [items, filterText]);

    if (isError) {
        return (
            <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
                <FetchErrorState
                    message="No se pudo cargar el historial de viajes de la unidad."
                    onRetry={() => refetch()}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper,
                    overflow: 'hidden',
                }}
            >
                {/* Header de la Card Stitch S3 */}
                <Box
                    sx={{
                        p: { xs: 2, md: 2.5 },
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                color: theme.palette.primary.main,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shrink: 0,
                            }}
                        >
                            <AltRouteIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                Historial de Despachos Recientes
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Trazabilidad operativa de viajes asignados a la unidad {placa ? `(Placa ${placa})` : ''}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Botones de Acción */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
                        <Button
                            variant={showFilters ? 'contained' : 'outlined'}
                            color="inherit"
                            size="small"
                            startIcon={<FilterListIcon />}
                            onClick={() => setShowFilters(!showFilters)}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: theme.palette.divider,
                            }}
                        >
                            Filtrar
                        </Button>

                        <Tooltip title="Exportación programada para próximas versiones">
                            <span>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    size="small"
                                    startIcon={<DownloadIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderColor: theme.palette.divider,
                                    }}
                                >
                                    Exportar XLS
                                </Button>
                            </span>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Barra de Filtro Rápido Colapsable */}
                <Collapse in={showFilters}>
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: theme.palette.mode === 'dark' ? alpha('#1e293b', 0.5) : '#f8fafc',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Buscar por código de viaje, origen, destino, conductor o estado..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ maxWidth: 480 }}
                        />
                    </Box>
                </Collapse>

                {/* Tabla Enriquecida Stitch S3 */}
                <TableContainer>
                    <Table sx={{ minWidth: 750 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha('#0f172a', 0.4) : '#f8fafc' }}>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                                    Cód. Viaje
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                                    Ruta / Corredor
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                                    Conductor Asignado
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                                    Carga Transportada
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                                    Despacho
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                                    Estado
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Cargando historial de despachos...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CarIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Sin viajes registrados
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            No se encontraron operaciones recientes para esta unidad.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredItems.map((viaje) => {
                                    const estadoNormal = (viaje.estadoNombre || '').toUpperCase();
                                    const isEnTransito =
                                        estadoNormal.includes('TRANSIT') ||
                                        estadoNormal.includes('RUTA') ||
                                        estadoNormal.includes('CURSO') ||
                                        estadoNormal.includes('INICI');
                                    const isCompletado =
                                        estadoNormal.includes('COMPLET') ||
                                        estadoNormal.includes('FINALIZ') ||
                                        estadoNormal.includes('ENTREG');

                                    return (
                                        <TableRow
                                            key={viaje.viajeID}
                                            hover
                                            sx={{
                                                transition: 'background-color 0.15s',
                                                '&:last-child td': { border: 0 },
                                            }}
                                        >
                                            {/* Cód. Viaje */}
                                            <TableCell sx={{ py: 2 }}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={800}
                                                    fontFamily="monospace"
                                                    sx={{ color: theme.palette.primary.main }}
                                                >
                                                    #{viaje.codigo}
                                                </Typography>
                                            </TableCell>

                                            {/* Ruta / Corredor */}
                                            <TableCell sx={{ py: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                                                    <Typography variant="body2" fontWeight={700}>
                                                        {viaje.origenNombre}
                                                    </Typography>
                                                    <ArrowForwardIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="body2" fontWeight={700}>
                                                        {viaje.destinoNombre}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                                    Corredor Vial Nacional
                                                </Typography>
                                            </TableCell>

                                            {/* Conductor Asignado */}
                                            <TableCell sx={{ py: 2 }}>
                                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                                    {viaje.conductorNombre || 'Conductor no asignado'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                                    Operador Titular
                                                </Typography>
                                            </TableCell>

                                            {/* Carga Transportada */}
                                            <TableCell sx={{ py: 2 }}>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {viaje.peso != null ? `${(viaje.peso / 1000).toFixed(1)} TN` : '—'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                                    {viaje.peso != null ? `${viaje.peso.toLocaleString('es-PE')} kg` : 'Carga General'}
                                                </Typography>
                                            </TableCell>

                                            {/* Despacho */}
                                            <TableCell sx={{ py: 2, fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.85rem' }}>
                                                {viaje.fechaPartida ? formatDateShort(viaje.fechaPartida) : '—'}
                                            </TableCell>

                                            {/* Estado */}
                                            <TableCell align="right" sx={{ py: 2 }}>
                                                {isEnTransito ? (
                                                    <Box
                                                        sx={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            px: 1.5,
                                                            py: 0.5,
                                                            borderRadius: 999,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                                                            color: theme.palette.primary.main,
                                                            fontWeight: 700,
                                                            fontSize: '0.75rem',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 7,
                                                                height: 7,
                                                                borderRadius: '50%',
                                                                bgcolor: theme.palette.primary.main,
                                                                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                            }}
                                                        />
                                                        {viaje.estadoNombre || 'En Tránsito'}
                                                    </Box>
                                                ) : isCompletado ? (
                                                    <Chip
                                                        label={viaje.estadoNombre || 'Completado'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.success.main, 0.12),
                                                            color: theme.palette.success.main,
                                                            fontWeight: 700,
                                                            fontSize: '0.72rem',
                                                            height: 24,
                                                            borderRadius: 999,
                                                        }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label={viaje.estadoNombre || 'Registrado'}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: '0.72rem',
                                                            height: 24,
                                                            borderRadius: 999,
                                                        }}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Paginación */}
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={(_, next) => setPage(next)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 20]}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                    sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
                />
            </Paper>
        </Box>
    );
}
