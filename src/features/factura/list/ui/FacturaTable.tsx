import React from 'react';
import { Typography, Box, Chip, TableCell } from '@mui/material';
import type { Factura } from '@/entities/factura/model/types';
import type { PagedResponse, SelectItem } from '@/shared/model/types';
import { formatDateLong } from '@/shared/utils/date-utils';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { formatCurrencyAmount } from '@/shared/utils/format-utils';
import { getFacturaDateColor, getFacturaPaymentStatusMeta, getFacturaStatusColor } from '@/entities/factura/model/status';
import { FacturaActionMenu } from './FacturaActionMenu';

interface FacturaTableProps {
    data?: PagedResponse<Factura>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView?: (item: Factura) => void;
    onEdit?: (item: Factura) => void;
    onDelete?: (item: Factura) => void;
    onPayment?: (item: Factura) => void;
    onViewPayments?: (item: Factura) => void;
    onUpdateStatus?: (item: Factura, newStatusId: number) => void;
    canDownloadReports?: boolean;
    statusCatalog?: SelectItem[];
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
    onDelete,
    onPayment,
    onViewPayments,
    onUpdateStatus,
    canDownloadReports = false,
    statusCatalog = [],
}: FacturaTableProps) {
    const columns: Column[] = React.useMemo(() => [
        { id: 'factura', label: 'Factura' },
        { id: 'cliente', label: 'Cliente' },
        { id: 'fechas', label: 'Fechas' },
        { id: 'montos', label: 'Montos' },
        { id: 'estado', label: 'Estado' },
        { id: 'estadoPago', label: 'Est. Pago' },
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
            renderRow={(item) => {
                const paymentStatus = getFacturaPaymentStatusMeta(item);

                return (
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
                            {item.fechaCompromisoPago && (
                                <Typography variant="body2" color={getFacturaDateColor(item, 'compromiso')}>
                                    <strong>Compromiso:</strong> {formatDateLong(item.fechaCompromisoPago)}
                                </Typography>
                            )}
                            <Typography variant="body2" color={getFacturaDateColor(item, 'vencimiento')}>
                                <strong>Vence:</strong> {formatDateLong(item.fechaVencimiento)}
                            </Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" fontWeight="bold">
                                {formatCurrencyAmount(item.total, item.moneda)}
                            </Typography>
                            <Typography variant="caption" color={item.saldoPendiente > 0 ? 'warning.main' : 'success.main'}>
                                Saldo: {formatCurrencyAmount(item.saldoPendiente, item.moneda)}
                            </Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Chip 
                            label={item.estado?.nombre || 'N/A'} 
                            color={getFacturaStatusColor(item)}
                            size="small" 
                            variant="filled"
                        />
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                            <Chip
                                label={paymentStatus.label}
                                color={paymentStatus.color}
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                    </TableCell>
                    <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {(onView || onEdit || onDelete || onPayment || onViewPayments || onUpdateStatus || canDownloadReports) && (
                                <FacturaActionMenu
                                    factura={item}
                                    onView={onView}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onPayment={onPayment}
                                    onViewPayments={onViewPayments}
                                    onUpdateStatus={onUpdateStatus}
                                    canDownloadReports={canDownloadReports}
                                    statusCatalog={statusCatalog}
                                />
                            )}
                        </Box>
                    </TableCell>
                </>
                );
            }}
        />
    );
}
