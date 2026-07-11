import { Box, Typography, Chip } from '@mui/material';
import type { Factura } from '@/entities/factura/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';
import { formatDateLong } from '@/shared/utils/date-utils';
import { formatCurrency } from '@/shared/utils/format-utils';
import { ESTADO_FACTURA_ID } from '@/shared/constants/constantes';
import { FacturaActionMenu } from './FacturaActionMenu';

interface FacturaMobileListProps {
    data?: PagedResponse<Factura>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView?: (factura: Factura) => void;
    onEdit?: (factura: Factura) => void;
    onDelete?: (factura: Factura) => void;
    onPayment?: (factura: Factura) => void;
    onViewPayments?: (factura: Factura) => void;
    onUpdateStatus?: (factura: Factura, newStatusId: number) => void;
}

export function FacturaMobileList({
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
    onUpdateStatus
}: FacturaMobileListProps) {

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando Facturas...</Box>;
    }



    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <MobileListShell
                items={data?.items || []}
                total={data?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                emptyMessage="No se encontraron Facturas"
                keyExtractor={(item) => item.facturaID}
                viewOnly={true}
                renderHeader={(row) => (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold" fontFamily="monospace">
                                {row.serie}-{row.numero}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {row.cliente?.razonSocial}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                                label={row.estado?.nombre || 'N/A'} 
                                color={row.estadoID === ESTADO_FACTURA_ID.GENERADO ? 'warning' : row.estadoID === ESTADO_FACTURA_ID.EMITIDO ? 'success' : 'error'}
                                size="small" 
                            />
                            {(onView || onEdit || onDelete || onPayment || onViewPayments || onUpdateStatus) && (
                                <FacturaActionMenu
                                    factura={row}
                                    onView={onView}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onPayment={onPayment}
                                    onViewPayments={onViewPayments}
                                    onUpdateStatus={onUpdateStatus}
                                />
                            )}
                        </Box>
                    </Box>
                )}
                renderBody={(row) => (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Total
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(row.total, row.moneda?.simbolo)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Saldo
                            </Typography>
                            <Typography variant="body2" color={row.saldoPendiente > 0 ? 'warning.main' : 'success.main'}>
                                {formatCurrency(row.saldoPendiente, row.moneda?.simbolo)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Emisión
                            </Typography>
                            <Typography variant="body2">
                                {formatDateLong(row.fechaEmision)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Vencimiento
                            </Typography>
                            <Typography variant="body2" color={new Date(row.fechaVencimiento) < new Date() ? 'error.main' : 'text.primary'}>
                                {formatDateLong(row.fechaVencimiento)}
                            </Typography>
                        </Box>
                    </Box>
                )}
            />
        </Box>

    );
}
