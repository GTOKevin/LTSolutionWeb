import React from 'react';
import { Typography, Box, Chip, TableCell } from '@mui/material';
import { BuildCircle as BuildIcon, Warning as WarningIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import type { Estado } from '@shared/model/estado.types';
import type { PagedResponse } from '@/shared/model/types';
import { TableActions } from '@shared/components/ui/TableActions';
import { formatDateLong } from '@shared/utils/date-utils';
import { useMantenimientoReport } from '../../hooks/useMantenimientoReport';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { ESTADO_MANTENIMIENTO_NAMES, ESTADO_MANTENIMIENTO_ID } from '@/shared/constants/constantes';

interface MantenimientoTableProps {
    data?: PagedResponse<Mantenimiento>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (item: Mantenimiento) => void;
    onEdit: (item: Mantenimiento) => void;
    onDelete: (item: Mantenimiento) => void;
}

const getStatusChip = (status: Estado | undefined | null) => {
    if (!status) return <Chip label="N/A" size="small" />;
    
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    const name = status.nombre.toLowerCase();
    
    if (ESTADO_MANTENIMIENTO_NAMES.PENDIENTE.some(s => name.includes(s))) color = 'default';
    else if (ESTADO_MANTENIMIENTO_NAMES.PROCESO.some(s => name.includes(s))) color = 'warning';
    else if (ESTADO_MANTENIMIENTO_NAMES.COMPLETADO.some(s => name.includes(s))) color = 'success';
    else if (ESTADO_MANTENIMIENTO_NAMES.CANCELADO.some(s => name.includes(s))) color = 'error';

    return (
        <Chip 
            label={status.nombre} 
            color={color} 
            size="small" 
            variant={color === 'default' ? 'outlined' : 'filled'}
            sx={{ fontWeight: 500 }}
        />
    );
};

const getServiceIcon = (serviceName: string = '') => {
    const lower = serviceName.toLowerCase();
    if (lower.includes('preventivo')) return <BuildIcon fontSize="small" color="info" />;
    if (lower.includes('correctivo')) return <WarningIcon fontSize="small" color="warning" />;
    return <ScheduleIcon fontSize="small" color="action" />;
};

export function MantenimientoTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete
}: MantenimientoTableProps) {
    const { generateExcel, generatePdf } = useMantenimientoReport();

    const columns: Column[] = React.useMemo(() => [
        { id: 'mantenimientoID', label: 'ID Mantenimiento' },
        { id: 'flota', label: 'Flota / Patente' },
        { id: 'tipoServicio', label: 'Tipo Servicio' },
        { id: 'fechas', label: 'Fechas' },
        { id: 'estado', label: 'Estado' },
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
            keyExtractor={(item) => item.mantenimientoID}
            emptyMessage="No se encontraron mantenimientos"
            renderRow={(item) => (
                <>
                    <TableCell>
                        <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                            #MNT-{item.mantenimientoID.toString().padStart(5, '0')}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" fontWeight="medium">
                                {item.flota?.marca} {item.flota?.modelo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {item.flota?.placa}
                            </Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getServiceIcon(item.tipoServicio?.nombre)}
                            <Typography variant="body2">
                                {item.tipoServicio?.nombre || 'General'}
                            </Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2">
                                In: {formatDateLong(item.fechaIngreso)}
                            </Typography>
                            {item.fechaSalida && (
                                <Typography variant="caption" color="text.secondary">
                                    Out: {formatDateLong(item.fechaSalida)}
                                </Typography>
                            )}
                        </Box>
                    </TableCell>
                    <TableCell>
                        {getStatusChip(item.estado)}
                    </TableCell>
                    <TableCell align="right">
                        <TableActions 
                            onView={() => onView(item)}
                            onEdit={item.estadoID !== ESTADO_MANTENIMIENTO_ID.COMPLETADO ? () => onEdit(item) : undefined}
                            onDelete={item.estadoID !== ESTADO_MANTENIMIENTO_ID.COMPLETADO ? () => onDelete(item) : undefined}
                            onExportExcel={(item.estadoID === ESTADO_MANTENIMIENTO_ID.COMPLETADO) ? () => generateExcel(item.mantenimientoID) : undefined}
                            onExportPdf={(item.estadoID === ESTADO_MANTENIMIENTO_ID.COMPLETADO) ? () => generatePdf(item.mantenimientoID) : undefined}
                        />
                    </TableCell>
                </>
            )}
        />
    );
}
