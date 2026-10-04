import { useState } from 'react';
import { Box, Grid, TableCell, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import type { FlotaTallerResumen } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
import { StatsCard } from '@shared/components/ui/StatsCard';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { formatDateShort } from '@shared/utils/date-utils';
import { formatDecimalAmount } from '@shared/utils/format-utils';
import { Build as BuildIcon, Paid as PaidIcon, EventAvailable as EventIcon, Speed as SpeedIcon } from '@mui/icons-material';

interface FlotaTallerTabProps {
    flotaId: number;
    resumen: FlotaTallerResumen;
}

const columns: Column[] = [
    { id: 'ot', label: 'OT' },
    { id: 'tipo', label: 'Tipo Servicio' },
    { id: 'km', label: 'Km In / Out' },
    { id: 'fecha', label: 'Fecha' },
    { id: 'inversion', label: 'Inversión' },
    { id: 'diagnostico', label: 'Diagnóstico', minWidth: 220 },
];

const getInversion = (item: Mantenimiento): number =>
    item.mantenimientoDetalles?.reduce((sum, detalle) => sum + (detalle.total ?? 0), 0) ?? 0;

export function FlotaTallerTab({ flotaId, resumen }: FlotaTallerTabProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: [...FLOTA_QUERY_KEYS.all, 'taller', flotaId, page, rowsPerPage],
        queryFn: () => mantenimientoApi.getAll({ flotaID: flotaId, page: page + 1, size: rowsPerPage }),
        enabled: flotaId > 0,
    });

    const tableData: PagedResponse<Mantenimiento> | undefined = data
        ? { ...data, totalPages: data.size > 0 ? Math.ceil(data.total / data.size) : 0 }
        : undefined;

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatsCard
                        title="Gasto Acumulado"
                        value={formatDecimalAmount(resumen.gastoAcumulado)}
                        color="#2563eb"
                        icon={<PaidIcon />}
                        caption={`${resumen.totalOrdenes} órdenes`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatsCard
                        title="Órdenes de Taller"
                        value={resumen.totalOrdenes}
                        color="#0891b2"
                        icon={<BuildIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatsCard
                        title="Último Servicio"
                        value={resumen.ultimaFechaServicio ? formatDateShort(resumen.ultimaFechaServicio) : '—'}
                        color="#16a34a"
                        icon={<EventIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatsCard
                        title="Próximo Mantenimiento"
                        value={resumen.proximoMantenimientoKm != null ? `${resumen.proximoMantenimientoKm} km` : '—'}
                        color="#d97706"
                        icon={<SpeedIcon />}
                    />
                </Grid>
            </Grid>

            {isError ? (
                <FetchErrorState
                    message="No se pudo cargar el historial de taller de la unidad."
                    onRetry={() => refetch()}
                />
            ) : (
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
                    emptyMessage="Sin órdenes de taller registradas para esta unidad."
                    renderRow={(item) => (
                        <>
                            <TableCell>
                                <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                                    #MNT-{item.mantenimientoID.toString().padStart(5, '0')}
                                </Typography>
                            </TableCell>
                            <TableCell>{item.tipoServicio?.nombre || '—'}</TableCell>
                            <TableCell>
                                {item.kmIngreso}
                                {item.kmSalida != null ? ` / ${item.kmSalida}` : ''}
                            </TableCell>
                            <TableCell>
                                {formatDateShort(item.fechaIngreso)}
                                {item.fechaSalida ? ` → ${formatDateShort(item.fechaSalida)}` : ''}
                            </TableCell>
                            <TableCell>{formatDecimalAmount(getInversion(item))}</TableCell>
                            <TableCell>{item.diagnosticoMecanico || '—'}</TableCell>
                        </>
                    )}
                />
            )}
        </Box>
    );
}
