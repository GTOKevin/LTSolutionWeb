import { useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Build as BuildIcon,
    Payments as PaymentsIcon,
    Check as CheckIcon,
    Add as AddIcon,
    Engineering as EngineeringIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import type { FlotaTallerResumen } from '@entities/flota/model/types';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { formatDateShort } from '@shared/utils/date-utils';
import { formatDecimalAmount } from '@shared/utils/format-utils';
import { APP_PATHS } from '@shared/config/app-routes';

interface FlotaExpedienteTallerTabProps {
    flotaId: number;
    resumen: FlotaTallerResumen;
    odometroActual?: number;
    canManage?: boolean;
}

const getInversion = (item: Mantenimiento): number =>
    item.mantenimientoDetalles?.reduce((sum, detalle) => sum + (detalle.total ?? 0), 0) ?? 0;

export function FlotaExpedienteTallerTab({
    flotaId,
    resumen,
    odometroActual,
    canManage = false,
}: FlotaExpedienteTallerTabProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: [...FLOTA_QUERY_KEYS.all, 'taller', flotaId, page, rowsPerPage],
        queryFn: () => mantenimientoApi.getAll({ flotaID: flotaId, page: page + 1, size: rowsPerPage }),
        enabled: flotaId > 0,
    });

    const items: Mantenimiento[] = data?.items ?? [];
    const totalCount = data?.total ?? 0;

    // Cálculo del próximo mantenimiento
    const proximoKm = resumen.proximoMantenimientoKm ?? (odometroActual ? odometroActual + 10000 : null);
    const kmFaltantes = proximoKm != null && odometroActual != null ? Math.max(0, proximoKm - odometroActual) : null;

    if (isError) {
        return (
            <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
                <FetchErrorState
                    message="No se pudo cargar el historial de taller de la unidad."
                    onRetry={() => refetch()}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Banner Resumen Ejecutivo 360° Stitch S3 */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper,
                }}
            >
                <Grid container spacing={2.5} alignItems="center">
                    {/* Sección 1: Gasto Acumulado */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2.5,
                                    bgcolor: alpha('#f59e0b', 0.15),
                                    color: '#d97706',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    shrink: 0,
                                }}
                            >
                                <PaymentsIcon sx={{ fontSize: 28 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                                    Gasto Acumulado en Taller
                                </Typography>
                                <Typography
                                    variant="h5"
                                    fontWeight={800}
                                    fontFamily="monospace"
                                    sx={{ color: theme.palette.text.primary, lineHeight: 1.2 }}
                                >
                                    S/. {formatDecimalAmount(resumen.gastoAcumulado)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {resumen.totalOrdenes} órdenes de trabajo registradas
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Sección 2: Próximo Mantenimiento Preventivo */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2.5,
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    color: theme.palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    shrink: 0,
                                }}
                            >
                                <BuildIcon sx={{ fontSize: 26 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                                    Próximo Mantenimiento Preventivo
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                                    <Typography variant="h6" fontWeight={800} fontFamily="monospace">
                                        {proximoKm != null ? `${proximoKm.toLocaleString('es-PE')} KM` : 'Por Programar'}
                                    </Typography>
                                    {kmFaltantes != null && (
                                        <Typography
                                            variant="caption"
                                            fontWeight={700}
                                            sx={{ color: '#d97706', bgcolor: alpha('#f59e0b', 0.12), px: 1, py: 0.25, borderRadius: 1 }}
                                        >
                                            (Faltan {kmFaltantes.toLocaleString('es-PE')} KM)
                                        </Typography>
                                    )}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    Odómetro actual: {odometroActual ? `${odometroActual.toLocaleString('es-PE')} KM` : '—'}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Sección 3: Taller Responsable Asignado + Botón Nueva OT */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                gap: 2,
                            }}
                        >


                            {canManage ? (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate(`${APP_PATHS.mantenimientos}/nuevo?flotaID=${flotaId}`)}
                                    sx={{
                                        bgcolor: '#954500',
                                        color: '#ffffff',
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        px: 2.5,
                                        py: 1,
                                        textTransform: 'none',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            bgcolor: '#7a3800',
                                            boxShadow: theme.shadows[2],
                                        },
                                    }}
                                >
                                    + Nuevo Mantenimiento
                                </Button>
                            ) : null}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabla de Órdenes de Trabajo Stitch S3 */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper,
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ p: { xs: 2, md: 2.5 }, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                        Órdenes de Trabajo de Taller
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Historial y trazabilidad de servicios preventivos y correctivos efectuados a la unidad
                    </Typography>
                </Box>

                <TableContainer>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha('#0f172a', 0.4) : '#f8fafc' }}>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                                    Orden de Trabajo
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                                    Tipo de Servicio & Alcance
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                                    Lectura Odómetro
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                                    Fecha Ejecución
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                                    Inversión
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                                    Diagnóstico Técnico
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Cargando órdenes de taller...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <EngineeringIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Sin órdenes de taller registradas
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            No se han realizado intervenciones mecánicas para este vehículo.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow
                                        key={item.mantenimientoID}
                                        hover
                                        sx={{
                                            transition: 'background-color 0.15s',
                                            '&:last-child td': { border: 0 },
                                        }}
                                    >
                                        {/* Orden de Trabajo */}
                                        <TableCell sx={{ py: 2 }}>
                                            <Typography
                                                variant="body2"
                                                fontWeight={800}
                                                fontFamily="monospace"
                                                sx={{ color: theme.palette.primary.main }}
                                            >
                                                #MNT-{item.mantenimientoID.toString().padStart(5, '0')}
                                            </Typography>
                                        </TableCell>

                                        {/* Tipo de Servicio & Alcance */}
                                        <TableCell sx={{ py: 2 }}>
                                            <Typography variant="body2" fontWeight={700}>
                                                {item.tipoServicio?.nombre || 'Mantenimiento General'}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: 'block',
                                                    mt: 0.25,
                                                    maxWidth: 320,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {item.motivoIngreso || item.diagnosticoMecanico || 'Inspección técnica general'}
                                            </Typography>
                                        </TableCell>

                                        {/* Lectura Odómetro */}
                                        <TableCell sx={{ py: 2, fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
                                            <Box>In: {item.kmIngreso?.toLocaleString('es-PE')} KM</Box>
                                            {item.kmSalida != null && (
                                                <Box sx={{ color: 'text.primary', fontWeight: 600 }}>
                                                    Out: {item.kmSalida.toLocaleString('es-PE')} KM
                                                </Box>
                                            )}
                                        </TableCell>

                                        {/* Fecha Ejecución */}
                                        <TableCell sx={{ py: 2, fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.85rem' }}>
                                            {formatDateShort(item.fechaIngreso)}
                                            {item.fechaSalida ? ` → ${formatDateShort(item.fechaSalida)}` : ''}
                                        </TableCell>

                                        {/* Inversión */}
                                        <TableCell sx={{ py: 2 }}>
                                            <Typography variant="body2" fontWeight={800} fontFamily="monospace">
                                                S/. {formatDecimalAmount(getInversion(item))}
                                            </Typography>
                                        </TableCell>

                                        {/* Diagnóstico Técnico */}
                                        <TableCell align="right" sx={{ py: 2 }}>
                                            <Chip
                                                icon={<CheckIcon sx={{ fontSize: '14px !important' }} />}
                                                label={item.diagnosticoMecanico ? 'Diagnóstico OK' : 'Aprobado sin obs.'}
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
                                        </TableCell>
                                    </TableRow>
                                ))
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
