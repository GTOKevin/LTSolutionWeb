import React from 'react';
import { Box, Typography } from '@mui/material';
import { formatCurrencyAmount } from '@/shared/utils/format-utils';
import type { FacturaDetalle } from '@/entities/factura/model/types';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';

interface FacturaDetalleMobileListProps {
    items: FacturaDetalle[];
    total: number;
    page: number;
    rowsPerPage: number;
    isReadOnly: boolean;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete: (id: number) => void;
}

export function FacturaDetalleMobileList({
    items,
    total,
    page,
    rowsPerPage,
    isReadOnly,
    onPageChange,
    onRowsPerPageChange,
    onDelete
}: FacturaDetalleMobileListProps) {
    return (
        <MobileListShell
            items={items}
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            keyExtractor={(item) => item.facturaDetalleID}
            emptyMessage="No hay detalles registrados"
            viewOnly={isReadOnly}
            onDelete={isReadOnly ? undefined : (item) => onDelete(item.facturaDetalleID)}
            canDelete={() => !isReadOnly}
            renderHeader={(item) => (
                <Typography variant="subtitle1" fontWeight="bold">
                    Viaje: {item.viajeID}
                </Typography>
            )}
            renderBody={(item) => (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {item.descripcion || 'Sin descripción'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2">SubTotal:</Typography>
                        <Typography variant="body2">{formatCurrencyAmount(item.subTotal, item.moneda)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">IGV:</Typography>
                        <Typography variant="body2">{formatCurrencyAmount(item.igv, item.moneda)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">Total:</Typography>
                        <Typography variant="subtitle2" fontWeight="bold" color="primary">
                            {formatCurrencyAmount(item.total, item.moneda)}
                        </Typography>
                    </Box>
                </Box>
            )}
        />
    );
}
