import { useState, useMemo } from 'react';
import {
    Box,
    Button,
    Chip,
    Collapse,
    InputAdornment,
    Paper,
    TableCell,
    TextField,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    AltRoute as AltRouteIcon,
    ArrowForward as ArrowForwardIcon,
    FilterList as FilterListIcon,
    Search as SearchIcon,
    DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import { estadoApi } from '@entities/estado/api/estado.api';
import type { FlotaHistorialViaje } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';
import { VIAJE_QUERY_KEYS } from '@features/viaje/model/query-keys';
import { ESTADO_SECTIONS } from '@entities/master-data/model/constants';
import { resolveViajeStatusId } from '@entities/viaje/model/status';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { formatDateShort } from '@/shared/utils/date-utils';

interface FlotaExpedienteViajesTabProps {
    flotaId: number;
    placa?: string;
}

const columns: Column[] = [
    { id: 'codigo', label: 'Cód. Viaje', minWidth: 110 },
    { id: 'ruta', label: 'Ruta', minWidth: 240 },
    { id: 'conductor', label: 'Conductor Asignado', minWidth: 160 },
    { id: 'carga', label: 'Carga Transportada', minWidth: 150 },
    { id: 'despacho', label: 'Despacho', minWidth: 120 },
    { id: 'estado', label: 'Estado', align: 'right', minWidth: 140 },
];

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

    // Catálogo de estados de viaje para clasificar por `estadoID` (comparte caché con viaje).
    const { data: viajeEstados } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.estados(),
        queryFn: async () => (await estadoApi.getSelect('', 20, ESTADO_SECTIONS.VIAJE)) ?? [],
    });

    const filteredItems = useMemo(() => {
        const sourceItems = data?.items ?? [];
        if (!filterText.trim()) return sourceItems;
        const q = filterText.toLowerCase();
        return sourceItems.filter(
            (v) =>
                v.codigo?.toLowerCase().includes(q) ||
                v.origenNombre?.toLowerCase().includes(q) ||
                v.destinoNombre?.toLowerCase().includes(q) ||
                v.conductorNombre?.toLowerCase().includes(q) ||
                v.estadoNombre?.toLowerCase().includes(q)
        );
    }, [data?.items, filterText]);

    const tableData: PagedResponse<FlotaHistorialViaje> | undefined = data
        ? {
              ...data,
              items: filteredItems,
              totalPages: data.size > 0 ? Math.ceil(data.total / data.size) : 0,
          }
        : undefined;

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
                {/* Header de la Card */}
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

                {/* Tabla Enriquecida (SharedTable) */}
                <SharedTable
                    data={tableData}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_, next) => setPage(next)}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(Number.parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                    columns={columns}
                    keyExtractor={(viaje) => viaje.viajeID}
                    variant="flat"
                    containerSx={{ border: 'none', borderRadius: 0 }}
                    emptyMessage="No se encontraron operaciones recientes para esta unidad."
                    renderRow={(viaje) => {
                        const estadoKey = resolveViajeStatusId(viaje.estadoID, viajeEstados);
                        const isEnTransito = estadoKey === 'transito';
                        const isCompletado = estadoKey === 'completado';

                        return (
                            <>
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

                                {/* Ruta */}
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
                                </TableCell>

                                {/* Conductor Asignado */}
                                <TableCell sx={{ py: 2 }}>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">
                                        {viaje.conductorNombre || '—'}
                                    </Typography>
                                </TableCell>

                                {/* Carga Transportada */}
                                <TableCell sx={{ py: 2 }}>
                                    <Typography variant="body2" fontWeight={700}>
                                        {viaje.peso != null ? `${(viaje.peso / 1000).toFixed(1)} TN` : '—'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                        {viaje.peso != null ? `${viaje.peso.toLocaleString('es-PE')} kg` : ''}
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
                                            {viaje.estadoNombre || 'En tránsito'}
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
                                            label={viaje.estadoNombre || 'Sin estado'}
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
                            </>
                        );
                    }}
                />

                {/* Estado vacío para vista mobile (SharedTable es md+) */}
                {!isLoading && filteredItems.length === 0 ? (
                    <Box sx={{ display: { xs: 'block', md: 'none' }, p: 4, textAlign: 'center' }}>
                        <CarIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight={600}>
                            Sin viajes registrados
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            No se encontraron operaciones recientes para esta unidad.
                        </Typography>
                    </Box>
                ) : null}
            </Paper>
        </Box>
    );
}
