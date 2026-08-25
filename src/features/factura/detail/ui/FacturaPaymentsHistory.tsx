import {
    Box,
    Typography,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    useTheme,
    alpha,
} from '@mui/material';
import {
    AccountBalanceWallet as WalletIcon,
    AddCircle as AddIcon,
} from '@mui/icons-material';
import { formatDateShort } from '@/shared/utils/date-utils';
import { formatCurrencyAmount } from '@/shared/utils/format-utils';
import { getFacturaPagoStatusMeta } from '@/entities/factura/model/status';
import type { FacturaReporte, FacturaPagoReporte } from '@/entities/factura/model/types';

interface FacturaPaymentsHistoryProps {
    factura: FacturaReporte;
    canManageFacturas: boolean;
    onRegisterPayment: () => void;
}

export function FacturaPaymentsHistory({
    factura,
    canManageFacturas,
    onRegisterPayment,
}: FacturaPaymentsHistoryProps) {
    const theme = useTheme();
    const pagos: FacturaPagoReporte[] = factura.pagos ?? [];
    const hasSaldo = (factura.saldoPendiente ?? 0) > 0;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                bgcolor: 'background.paper',
                boxShadow: '0 12px 32px -8px rgba(25, 28, 29, 0.05)',
                overflow: 'hidden',
            }}
        >
            {/* Header de la sección */}
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.6),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <WalletIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                        Historial de Pagos y Cobranzas
                    </Typography>
                    <Chip
                        label={`${pagos.length} ${pagos.length === 1 ? 'Abono' : 'Abonos'}`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
                </Box>

                {canManageFacturas && hasSaldo && (
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={onRegisterPayment}
                        sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                    >
                        Nuevo Pago
                    </Button>
                )}
            </Box>

            {pagos.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <WalletIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        No se han registrado abonos para esta factura.
                    </Typography>
                    {canManageFacturas && hasSaldo && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={onRegisterPayment}
                            sx={{ mt: 1.5, borderRadius: 2, fontWeight: 600 }}
                        >
                            Registrar primer pago
                        </Button>
                    )}
                </Box>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead
                            sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                                '& .MuiTableCell-head': {
                                    color: 'text.primary',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    py: 1.5,
                                    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                                },
                            }}
                        >
                            <TableRow>
                                <TableCell>
                                    Fecha Pago
                                </TableCell>
                                <TableCell>
                                    Medio / Tipo
                                </TableCell>
                                <TableCell>
                                    N° Operación
                                </TableCell>
                                <TableCell>
                                    Estado
                                </TableCell>
                                <TableCell align="right">
                                    Monto Abonado
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pagos.map((pago, index) => {
                                const isEven = index % 2 === 0;
                                const pagoStatusMeta = getFacturaPagoStatusMeta(pago.estadoNombre);

                                return (
                                    <TableRow
                                        key={pago.facturaPagoID}
                                        sx={{
                                            bgcolor: isEven ? 'transparent' : alpha(theme.palette.action.hover, 0.25),
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                                        }}
                                    >
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {formatDateShort(pago.fechaPago)}
                                            </Typography>
                                            {pago.fechaAcreditacion && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    Acreditado: {formatDateShort(pago.fechaAcreditacion)}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography variant="body2" color="text.primary">
                                                {pago.tipoPagoNombre || 'Transferencia'}
                                            </Typography>
                                            {pago.observacion && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200 }} noWrap>
                                                    {pago.observacion}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            {pago.numeroOperacion || '-'}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={pagoStatusMeta.label}
                                                size="small"
                                                color={pagoStatusMeta.color}
                                                variant="outlined"
                                                sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 1.5, fontFamily: 'monospace', fontWeight: 800, color: 'success.main', fontSize: '0.9rem' }}>
                                            {formatCurrencyAmount(pago.montoAbonado, factura.moneda)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}
