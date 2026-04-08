import React from 'react';
import { TableCell, Chip } from '@mui/material';
import type { FacturaPago } from '@/entities/factura/model/types';
import { formatCurrency } from '@/shared/utils/format-utils';
import { formatDateLong } from '@/shared/utils/date-utils';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableActions } from '@/shared/components/ui/TableActions';

interface FacturaPagoListProps {
    items: FacturaPago[];
    total: number;
    page: number;
    rowsPerPage: number;
    isLoading: boolean;
    isReadOnly: boolean;
    isDeleting: boolean;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete: (id: number) => void;
}

export function FacturaPagoList({
    items,
    total,
    page,
    rowsPerPage,
    isLoading,
    isReadOnly,
    isDeleting,
    onPageChange,
    onRowsPerPageChange,
    onDelete
}: FacturaPagoListProps) {

    const columns: Column[] = [
        { id: 'fecha', label: 'Fecha' },
        { id: 'acreditacion', label: 'Acreditación' },
        { id: 'tipo', label: 'Tipo' },
        { id: 'estado', label: 'Estado' },
        { id: 'operacion', label: 'Operación' },
        { id: 'observacion', label: 'Observación' },
        { id: 'monto', label: 'Monto', align: 'right' },
        { id: 'acciones', label: 'Acciones', align: 'center' }
    ];

    const renderRow = (pago: FacturaPago) => (
        <>
            <TableCell>{formatDateLong(pago.fechaPago)}</TableCell>
            <TableCell>{pago.fechaAcreditacion ? formatDateLong(pago.fechaAcreditacion) : '-'}</TableCell>
            <TableCell>{pago.tipoPago?.nombre || '-'}</TableCell>
            <TableCell>
                <Chip 
                    label={pago.estado?.nombre || '-'} 
                    size="small" 
                    color={pago.estado?.nombre === 'Acreditado' ? 'success' : 'default'}
                />
            </TableCell>
            <TableCell>{pago.numeroOperacion || '-'}</TableCell>
            <TableCell>{pago.observacion || '-'}</TableCell>
            <TableCell align="right">
                <strong>{formatCurrency(pago.montoAbonado, pago.moneda?.simbolo)}</strong>
            </TableCell>
            <TableCell align="center">
                <TableActions
                    onDelete={isReadOnly ? undefined : () => onDelete(pago.facturaPagoID)}
                    disableDelete={isDeleting}
                    disableEdit={isDeleting}
                    disableView={isDeleting}
                />
            </TableCell>
        </>
    );

    return (
        <SharedTable
            data={{
                items: items,
                total: total,
                page: page + 1,
                size: rowsPerPage,
                totalPages: Math.ceil(total / rowsPerPage)
            }}
            isLoading={isLoading}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            columns={columns}
            keyExtractor={(item) => item.facturaPagoID}
            renderRow={renderRow}
            emptyMessage="No hay pagos registrados"
        />
    );
}
