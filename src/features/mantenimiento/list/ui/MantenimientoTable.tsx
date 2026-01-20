import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    useTheme,
    Typography,
    Box,
    Chip
} from '@mui/material';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { TableActions } from '@shared/components/ui/TableActions';
import { formatDateLong } from '@shared/utils/date-utils';
import React from 'react';
import { BuildCircle as BuildIcon, Warning as WarningIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { useMantenimientoReport } from '../../hooks/useMantenimientoReport';

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
    const theme = useTheme();
    const { generateExcel, generatePdf } = useMantenimientoReport();

    // Helper to get status color/label
    const getStatusChip = (status: any) => {
        if (!status) return <Chip label="N/A" size="small" />;
        
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
        const name = status.nombre.toLowerCase();
        
        if (name.includes('pendiente') || name.includes('agendado')) color = 'default';
        else if (name.includes('proceso') || name.includes('taller')) color = 'warning';
        else if (name.includes('finalizado') || name.includes('completado')) color = 'success';
        else if (name.includes('cancelado')) color = 'error';

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

    return (
        <Paper sx={{ 
            display: { xs: 'none', md: 'flex' },
            flex: 1, 
            flexDirection: 'column', 
            minHeight: 0, 
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            boxShadow: theme.shadows[1]
        }}>
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID Mantenimiento</TableCell>
                            <TableCell>Flota / Patente</TableCell>
                            <TableCell>Tipo Servicio</TableCell>
                            <TableCell>Fechas</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    Cargando datos...
                                </TableCell>
                            </TableRow>
                        ) : data?.items.map((item) => (
                            <TableRow 
                                key={item.mantenimientoID}
                                hover
                                sx={{ 
                                    '&:hover .actions-group': { opacity: 1 },
                                    cursor: 'pointer'
                                }}
                            >
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
                                        onEdit={item.estadoID !== 102 ? () => onEdit(item) : undefined}
                                        onDelete={item.estadoID !== 102 ? () => onDelete(item) : undefined}
                                        onExportExcel={(item.estado?.nombre?.toUpperCase() === 'COMPLETADO') ? () => generateExcel(item.mantenimientoID) : undefined}
                                        onExportPdf={(item.estado?.nombre?.toUpperCase() === 'COMPLETADO') ? () => generatePdf(item.mantenimientoID) : undefined}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && data?.items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    No se encontraron mantenimientos
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={data?.total || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                labelRowsPerPage="Filas por página"
            />
        </Paper>
    );
}
