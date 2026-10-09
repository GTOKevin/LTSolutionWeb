import { useState } from 'react';
import {
    Box,
    Button,
    Grid,
    Paper,
    TableCell,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Build as BuildIcon,
    Payments as PaymentsIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import type { FlotaTallerResumen } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
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

const columns: Column[] = [
    { id: 'ot', label: 'Orden de Trabajo', minWidth: 140 },
    { id: 'tipo', label: 'Tipo de Servicio & Alcance', minWidth: 260 },
    { id: 'km', label: 'Lectura Odómetro', minWidth: 140 },
    { id: 'fecha', label: 'Fecha Ejecución', minWidth: 150 },
    { id: 'inversion', label: 'Inversión', minWidth: 120 },
    { id: 'diagnostico', label: 'Diagnóstico', align: 'right', minWidth: 160 },
];

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
        queryKey: FLOTA_QUERY_KEYS.taller(flotaId, page, rowsPerPage),
        queryFn: () => mantenimientoApi.getAll({ flotaID: flotaId, page: page + 1, size: rowsPerPage }),
        enabled: flotaId > 0,
    });

    const tableData: PagedResponse<Mantenimiento> | undefined = data
        ? { ...data, totalPages: data.size > 0 ? Math.ceil(data.total / data.size) : 0 }
        : undefined;

    // Próximo mantenimiento: solo se muestra si el backend lo reporta.
    const proximoKm = resumen.proximoMantenimientoKm ?? null;
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
            {/* Banner Resumen Ejecutivo 360° */}
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
                                        {proximoKm != null ? `${proximoKm.toLocaleString('es-PE')} KM` : 'Sin datos'}
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
                                    Odómetro actual: {odometroActual != null ? `${odometroActual.toLocaleString('es-PE')} KM` : '—'}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Sección 3: Botón Nueva OT */}
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

            {/* Tabla de Órdenes de Trabajo (SharedTable) */}
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
                        Historial y trazabilidad de servicios preventivos y correctivos registrados para la unidad
                    </Typography>
                </Box>

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
                    keyExtractor={(item) => item.mantenimientoID}
                    variant="flat"
                    containerSx={{ border: 'none', borderRadius: 0 }}
                    emptyMessage="Sin órdenes de taller registradas para esta unidad."
                    renderRow={(item) => (
                        <>
                            <TableCell>
                                <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                                    #MNT-{item.mantenimientoID.toString().padStart(5, '0')}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" fontWeight={700}>
                                    {item.tipoServicio?.nombre || '—'}
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
                                    {item.motivoIngreso || item.diagnosticoMecanico || '—'}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Box>In: {item.kmIngreso?.toLocaleString('es-PE') ?? '—'}</Box>
                                {item.kmSalida != null ? (
                                    <Box sx={{ color: 'text.primary', fontWeight: 600 }}>
                                        Out: {item.kmSalida.toLocaleString('es-PE')}
                                    </Box>
                                ) : null}
                            </TableCell>
                            <TableCell>
                                {formatDateShort(item.fechaIngreso)}
                                {item.fechaSalida ? ` → ${formatDateShort(item.fechaSalida)}` : ''}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{formatDecimalAmount(getInversion(item))}</TableCell>
                            <TableCell align="right">{item.diagnosticoMecanico || '—'}</TableCell>
                        </>
                    )}
                />
            </Paper>
        </Box>
    );
}
