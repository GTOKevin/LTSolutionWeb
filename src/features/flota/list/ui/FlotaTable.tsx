import React from 'react';
import { Box, IconButton, TableCell, Tooltip, Typography } from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';
import type { Flota } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { TableActions } from '@shared/components/ui/TableActions';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { FlotaEstadoOperativoChip } from '@entities/flota/ui/FlotaEstadoOperativoChip';
import { FlotaDocumentoVigenciaChip } from '@entities/flota/ui/FlotaDocumentoVigenciaChip';
import { buildCodigoInterno } from '@entities/flota/model/constants';

interface FlotaTableProps {
    data?: PagedResponse<Flota>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (flota: Flota) => void;
    onEdit?: (flota: Flota) => void;
    onDelete?: (flota: Flota) => void;
    onScheduleWorkshop?: (flota: Flota) => void;
}

const formatDimensiones = (largo?: number, ancho?: number, alto?: number) => {
    if (largo == null && ancho == null && alto == null) return '—';
    return `${largo ?? '—'} × ${ancho ?? '—'} × ${alto ?? '—'}`;
};

export function FlotaTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete,
    onScheduleWorkshop,
}: FlotaTableProps) {
    const columns: Column[] = React.useMemo(() => [
        { id: 'placa', label: 'Placa' },
        { id: 'configuracion', label: 'Configuración', minWidth: 180 },
        { id: 'marca', label: 'Marca / Modelo' },
        { id: 'balanza', label: 'Capacidad Balanza' },
        { id: 'dimensiones', label: 'Dimensiones' },
        { id: 'docVigencia', label: 'Doc. Vigencia' },
        { id: 'estadoOperativo', label: 'Estado Operativo' },
        { id: 'acciones', label: 'Acciones', align: 'right' }
    ], []);

    return (
        <SharedTable
            data={data}
            isLoading={isLoading}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            columns={columns}
            keyExtractor={(item) => item.flotaID}
            emptyMessage="No se encontraron vehículos"
            renderRow={(flota) => (
                <>
                    <TableCell>
                        <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                            {flota.placa}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {flota.codigoInterno ?? buildCodigoInterno(flota.tipoFlota, flota.flotaID)}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2">
                            {flota.tipoFlotaNavigation?.nombre || `Tipo ${flota.tipoFlota}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {flota.ejes} ejes{flota.configuracionEjes?.nombre ? ` · ${flota.configuracionEjes.nombre}` : ''}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        {flota.marca} {flota.modelo}
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2">
                            {flota.cargaUtil != null ? `${flota.cargaUtil} kg` : '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            PBV: {flota.pesoBruto != null ? `${flota.pesoBruto} kg` : '—'}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2">
                            {formatDimensiones(flota.largo, flota.ancho, flota.alto)}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <FlotaDocumentoVigenciaChip documento={flota.documentoCritico} />
                    </TableCell>
                    <TableCell>
                        <FlotaEstadoOperativoChip estado={flota.estadoOperativo} active={flota.estado} />
                    </TableCell>
                    <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
                            {onScheduleWorkshop ? (
                                <Tooltip title="Programar Taller">
                                    <IconButton
                                        size="small"
                                        color="warning"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onScheduleWorkshop(flota);
                                        }}
                                    >
                                        <BuildIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            ) : null}
                            <TableActions
                                onView={() => onView(flota)}
                                onEdit={onEdit ? () => onEdit(flota) : undefined}
                                onDelete={onDelete ? () => onDelete(flota) : undefined}
                            />
                        </Box>
                    </TableCell>
                </>
            )}
        />
    );
}
