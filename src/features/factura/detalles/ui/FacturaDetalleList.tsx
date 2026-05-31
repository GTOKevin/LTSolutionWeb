import React from 'react';
import { TableCell } from '@mui/material';
import { formatCurrency } from '@/shared/utils/format-utils';
import type { FacturaDetalle } from '@/entities/factura/model/types';
import { SharedTable, type Column } from '@/shared/components/ui/SharedTable';
import { TableActions } from '@/shared/components/ui/TableActions';

interface FacturaDetalleListProps {
    items: FacturaDetalle[];
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

export function FacturaDetalleList({
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
}: FacturaDetalleListProps) {

    const columns: Column[] = [
        { id: 'viaje', label: 'Viaje' },
        { id: 'descripcion', label: 'Descripción' },
        { id: 'subtotal', label: 'SubTotal', align: 'right' },
        { id: 'igv', label: 'IGV', align: 'right' },
        { id: 'total', label: 'Total', align: 'right' },
        { id: 'acciones', label: 'Acciones', align: 'center' }
    ];

    const renderRow = (detalle: FacturaDetalle) => (
        <>
            <TableCell>{detalle.codigo}</TableCell>
            <TableCell>{detalle.descripcion || '-'}</TableCell>
            <TableCell align="right">{formatCurrency(detalle.subTotal, detalle.moneda?.simbolo)}</TableCell>
            <TableCell align="right">{formatCurrency(detalle.igv, detalle.moneda?.simbolo)}</TableCell>
            <TableCell align="right"><strong>{formatCurrency(detalle.total, detalle.moneda?.simbolo)}</strong></TableCell>
            <TableCell align="center">
                <TableActions
                    onDelete={isReadOnly ? undefined : () => onDelete(detalle.facturaDetalleID)}
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
            keyExtractor={(item) => item.facturaDetalleID}
            renderRow={renderRow}
            emptyMessage="No hay detalles registrados"
        />
    );
}
