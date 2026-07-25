import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { formatCurrencyAmount } from '@/shared/utils/format-utils';
import { formatDateLong } from '@/shared/utils/date-utils';
import type { FacturaPago } from '@/entities/factura/model/types';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';

interface FacturaPagoMobileListProps {
    items: FacturaPago[];
    total: number;
    page: number;
    rowsPerPage: number;
    isReadOnly: boolean;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete: (id: number) => void;
}

export function FacturaPagoMobileList({
    items,
    total,
    page,
    rowsPerPage,
    isReadOnly,
    onPageChange,
    onRowsPerPageChange,
    onDelete
}: FacturaPagoMobileListProps) {
    return (
        <MobileListShell
            items={items}
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            keyExtractor={(item) => item.facturaPagoID}
            emptyMessage="No hay pagos registrados"
            viewOnly={isReadOnly}
            onDelete={isReadOnly ? undefined : (item) => onDelete(item.facturaPagoID)}
            canDelete={() => !isReadOnly}
            renderHeader={(item) => (
                <Typography variant="subtitle1" fontWeight="bold">
                    {formatDateLong(item.fechaPago)}
                </Typography>
            )}
            renderBody={(item) => (
                <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip 
                            label={item.tipoPago?.nombre || '-'} 
                            size="small" 
                            variant="outlined" 
                        />
                        <Chip 
                            label={item.estado?.nombre || '-'} 
                            size="small" 
                            color={item.estado?.nombre === 'Acreditado' ? 'success' : 'default'}
                        />
                    </Box>
                    {item.numeroOperacion && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Operación: {item.numeroOperacion}
                        </Typography>
                    )}
                    {item.fechaAcreditacion && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Acreditado: {formatDateLong(item.fechaAcreditacion)}
                        </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">Monto:</Typography>
                        <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                            {formatCurrencyAmount(item.montoAbonado, item.moneda)}
                        </Typography>
                    </Box>
                </Box>
            )}
        />
    );
}
