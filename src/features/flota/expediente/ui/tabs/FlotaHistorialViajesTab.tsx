import { useState } from 'react';
import { Box, Chip, TableCell, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { FlotaHistorialViaje } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { formatDateShort } from '@shared/utils/date-utils';

interface FlotaHistorialViajesTabProps {
    flotaId: number;
}

const columns: Column[] = [
    { id: 'codigo', label: 'Código' },
    { id: 'ruta', label: 'Ruta', minWidth: 260 },
    { id: 'conductor', label: 'Conductor' },
    { id: 'carga', label: 'Carga' },
    { id: 'fecha', label: 'Fecha' },
    { id: 'estado', label: 'Estado' },
];

export function FlotaHistorialViajesTab({ flotaId }: FlotaHistorialViajesTabProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.historialViajes(flotaId, page, rowsPerPage),
        queryFn: () => flotaApi.getHistorialViajes(flotaId, { page: page + 1, size: rowsPerPage }),
        enabled: flotaId > 0,
    });

    const tableData: PagedResponse<FlotaHistorialViaje> | undefined = data
        ? { ...data, totalPages: data.size > 0 ? Math.ceil(data.total / data.size) : 0 }
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
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
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
                keyExtractor={(item) => item.viajeID}
                emptyMessage="Sin viajes registrados para esta unidad."
                renderRow={(viaje) => (
                    <>
                        <TableCell>
                            <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                                {viaje.codigo}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2">{viaje.origenNombre}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                → {viaje.destinoNombre}
                            </Typography>
                        </TableCell>
                        <TableCell>{viaje.conductorNombre || '—'}</TableCell>
                        <TableCell>{viaje.peso != null ? `${viaje.peso} kg` : '—'}</TableCell>
                        <TableCell>
                            {viaje.fechaPartida ? formatDateShort(viaje.fechaPartida) : '—'}
                        </TableCell>
                        <TableCell>
                            <Chip label={viaje.estadoNombre || '—'} size="small" variant="outlined" />
                        </TableCell>
                    </>
                )}
            />
        </Box>
    );
}
