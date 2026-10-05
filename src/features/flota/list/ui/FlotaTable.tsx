import React from 'react';
import { Box, Chip, IconButton, TableCell, Tooltip, Typography, alpha } from '@mui/material';
import { Build as BuildIcon, AltRoute as RouteIcon } from '@mui/icons-material';
import type { Flota } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { TableActions } from '@shared/components/ui/TableActions';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { FlotaEstadoOperativoChip } from '@entities/flota/ui/FlotaEstadoOperativoChip';
import { FlotaDocumentoVigenciaChip } from '@entities/flota/ui/FlotaDocumentoVigenciaChip';
import { buildCodigoInterno } from '@entities/flota/model/constants';
import { PeruvianPlate } from '../../shared/ui/PeruvianPlate';
import { FlotaBalanzaBar } from '../../shared/ui/FlotaBalanzaBar';

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
    return `${largo ?? '—'} × ${ancho ?? '—'} × ${alto ?? '—'} m`;
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
        { id: 'placa', label: 'Placa', minWidth: 130 },
        { id: 'configuracion', label: 'Configuración', minWidth: 170 },
        { id: 'marca', label: 'Marca / Modelo', minWidth: 160 },
        { id: 'balanza', label: 'Capacidad Balanza', minWidth: 180 },
        { id: 'dimensiones', label: 'Dimensiones', minWidth: 130 },
        { id: 'docVigencia', label: 'Doc. Vigencia', minWidth: 150 },
        { id: 'estadoOperativo', label: 'Estado Operativo', minWidth: 150 },
        { id: 'acciones', label: 'Acciones', align: 'right', minWidth: 120 }
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
            emptyMessage="No se encontraron vehículos registrados en la flota"
            renderRow={(flota) => {
                const codigo = flota.codigoInterno ?? buildCodigoInterno(flota.tipoFlota, flota.flotaID);
                return (
                    <>
                        <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                                <PeruvianPlate placa={flota.placa} size="sm" />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontWeight: 700,
                                        color: 'text.secondary',
                                        fontSize: '0.7rem',
                                    }}
                                >
                                    {codigo}
                                </Typography>
                            </Box>
                        </TableCell>

                        <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="body2" fontWeight={600}>
                                    {flota.tipoFlotaNavigation?.nombre || `Tipo ${flota.tipoFlota}`}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={`${flota.ejes} Ejes`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                                    />
                                    {flota.configuracionEjes?.nombre ? (
                                        <Chip
                                            label={flota.configuracionEjes.nombre}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                                        />
                                    ) : null}
                                </Box>
                            </Box>
                        </TableCell>

                        <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                                {flota.marca} {flota.modelo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {flota.anio ? `Año ${flota.anio}` : ''}
                                {flota.anio && flota.color ? ' • ' : ''}
                                {flota.color || ''}
                            </Typography>
                        </TableCell>

                        <TableCell>
                            <FlotaBalanzaBar
                                pesoBruto={flota.pesoBruto}
                                pesoNeto={flota.pesoNeto}
                                cargaUtil={flota.cargaUtil}
                                mode="compact"
                            />
                        </TableCell>

                        <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                {formatDimensiones(flota.largo, flota.ancho, flota.alto)}
                            </Typography>
                        </TableCell>

                        <TableCell>
                            <FlotaDocumentoVigenciaChip documento={flota.documentoCritico} />
                        </TableCell>

                        <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                                <FlotaEstadoOperativoChip estado={flota.estadoOperativo} active={flota.estado} />
                                {flota.viajeActivoCodigo ? (
                                    <Chip
                                        icon={<RouteIcon sx={{ fontSize: '13px !important' }} />}
                                        label={`Viaje #${flota.viajeActivoCodigo}`}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                        sx={{
                                            height: 19,
                                            fontSize: '0.68rem',
                                            fontWeight: 600,
                                            bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                                        }}
                                    />
                                ) : null}
                            </Box>
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
                );
            }}
        />
    );
}
