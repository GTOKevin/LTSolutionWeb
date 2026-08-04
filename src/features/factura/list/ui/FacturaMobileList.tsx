import { Box, Typography, Chip } from '@mui/material';
import type { Factura } from '@/entities/factura/model/types';
import type { PagedResponse, SelectItem } from '@/shared/model/types';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';
import { formatDateLong } from '@/shared/utils/date-utils';
import { formatCurrencyAmount } from '@/shared/utils/format-utils';
import { getFacturaDateColor, getFacturaPaymentStatusMeta, getFacturaStatusColor } from '@/entities/factura/model/status';
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
    canDownloadReports?: boolean;
    statusCatalog?: SelectItem[];
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
    onUpdateStatus,
    canDownloadReports = false,
    statusCatalog = [],
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
                                color={getFacturaStatusColor(row)}
                                size="small" 
                            />
                            {(onView || onEdit || onDelete || onPayment || onViewPayments || onUpdateStatus || canDownloadReports) && (
                                <FacturaActionMenu
                                    factura={row}
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
                    </Box>
                )}
                renderBody={(row) => {
                    const paymentStatus = getFacturaPaymentStatusMeta(row);

                    return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Total
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {formatCurrencyAmount(row.total, row.moneda)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Saldo
                            </Typography>
                            <Typography variant="body2" color={row.saldoPendiente > 0 ? 'warning.main' : 'success.main'}>
                                {formatCurrencyAmount(row.saldoPendiente, row.moneda)}
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
                                Estado de Pago
                            </Typography>
                            <Chip
                                label={paymentStatus.label}
                                color={paymentStatus.color}
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Compromiso
                            </Typography>
                            <Typography variant="body2" color={getFacturaDateColor(row, 'compromiso', 'text.primary')}>
                                {row.fechaCompromisoPago ? formatDateLong(row.fechaCompromisoPago) : '-'}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Vencimiento
                            </Typography>
                            <Typography variant="body2" color={getFacturaDateColor(row, 'vencimiento', 'text.primary')}>
                                {formatDateLong(row.fechaVencimiento)}
                            </Typography>
                        </Box>
                    </Box>
                    );
                }}
            />
        </Box>
    );
}
