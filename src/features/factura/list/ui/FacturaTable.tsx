import React from 'react';
import { Typography, Box, Chip, TableCell } from '@mui/material';
import type { Factura } from '@/entities/factura/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { TableActions } from '@/shared/components/ui/TableActions';
import { formatDateLong } from '@/shared/utils/date-utils';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { formatCurrency } from '@/shared/utils/format-utils';

interface FacturaTableProps {
    data?: PagedResponse<Factura>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (item: Factura) => void;
    onEdit: (item: Factura) => void;
    onDelete: (item: Factura) => void;
}

export function FacturaTable({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete
}: FacturaTableProps) {
    const columns: Column[] = React.useMemo(() => [
        { id: 'factura', label: 'Factura' },
        { id: 'cliente', label: 'Cliente' },
        { id: 'fechas', label: 'Fechas' },
        { id: 'montos', label: 'Montos' },
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
            keyExtractor={(item) => item.facturaID}
            emptyMessage="No se encontraron facturas"
            renderRow={(item) => (
                <>
                    <TableCell>
                        <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                            {item.serie}-{item.numero}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                            {item.cliente?.razonSocial}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {item.cliente?.ruc}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="body2">
                                <strong>Emisión:</strong> {formatDateLong(item.fechaEmision)}
                            </Typography>
                            <Typography variant="body2" color={new Date(item.fechaVencimiento) < new Date() ? 'error.main' : 'text.secondary'}>
                                <strong>Vence:</strong> {formatDateLong(item.fechaVencimiento)}
                            </Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(item.total, item.moneda?.simbolo)}
                            </Typography>
                            <Typography variant="caption" color={item.saldoPendiente > 0 ? 'warning.main' : 'success.main'}>
                                Saldo: {formatCurrency(item.saldoPendiente, item.moneda?.simbolo)}
                            </Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Chip 
                            label={item.estado?.descripcion || 'N/A'} 
                            color={item.estadoID === 1 ? 'warning' : item.estadoID === 2 ? 'success' : 'error'}
                            size="small" 
                            variant="filled"
                        />
                    </TableCell>
                    <TableCell align="right">
                        <TableActions
                            onView={() => onView(item)}
                            onEdit={() => onEdit(item)}
                            onDelete={() => onDelete(item)}
                            deleteTooltip='Eliminar Factura'
                        />
                    </TableCell>
                </>
            )}
        />
    );
}
