import {
    Box,
    Typography,
    Chip,
    Button,
    Divider,
    Stack,
    Paper,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Verified as VerifiedIcon,
    PictureAsPdf as PdfIcon,
    TableChart as ExcelIcon,
    History as HistoryIcon,
    WarningAmber as WarningIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { formatDateShort } from '@/shared/utils/date-utils';
import { formatCurrencyAmount } from '@/shared/utils/format-utils';
import type { FacturaReporte } from '@/entities/factura/model/types';
import { getFacturaStatusMeta } from '@/entities/factura/model/status';
import { IGV_RATE } from '@/entities/factura/model/constants';
import { FacturaDocumentosCompactList } from './FacturaDocumentosCompactList';


interface FacturaSummaryPanelProps {
    factura: FacturaReporte;
    canManageFacturas: boolean;
    onRegisterPayment: () => void;
    onDownloadPdf: () => void;
    onDownloadExcel: () => void;
    onViewPaymentsHistory: () => void;
}

export function FacturaSummaryPanel({
    factura,
    canManageFacturas,
    onRegisterPayment,
    onDownloadPdf,
    onDownloadExcel,
    onViewPaymentsHistory,
}: FacturaSummaryPanelProps) {
    const theme = useTheme();

    const totalFacturado = factura.total ?? 0;
    const saldoPendiente = factura.saldoPendiente ?? 0;
    const montoPagado = Math.max(totalFacturado - saldoPendiente, 0);
    const hasSaldo = saldoPendiente > 0;

    // Estado resuelto desde `estado.codigo` (map centralizado en entities/factura).
    // Si el backend omite estado, se muestra un placeholder honesto («Sin estado»),
    // nunca un valor de negocio inventado.
    const statusMeta = getFacturaStatusMeta(factura);
    const estadoLabel = factura.estado?.nombre?.trim() || statusMeta.label;

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                boxShadow: '0 12px 32px -8px rgba(25, 28, 29, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}
        >
            {/* Cabecera: Serie-Número y Estado */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                <Box>
                    <Typography
                        variant="h5"
                        fontWeight={800}
                        color="text.primary"
                        sx={{
                            letterSpacing: '-0.02em',
                            fontSize: { xs: '1.35rem', md: '1.6rem' },
                        }}
                    >
                        {factura.serie ? `${factura.serie}-${factura.numero}` : `#${factura.facturaID}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Emisión: {formatDateShort(factura.fechaEmision)}
                    </Typography>
                </Box>
                <Chip
                    label={estadoLabel.toUpperCase()}
                    color={statusMeta.color}
                    size="small"
                    sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        letterSpacing: '0.05em',
                        px: 0.5,
                        borderRadius: 1.5,
                    }}
                />
            </Box>

            {/* Caja de Resumen con Borde Dorado / Acento Ejecutivo (Estilo Stitch) */}
            <Box
                sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid #D4AF37',
                    bgcolor: alpha('#D4AF37', 0.04),
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Línea lateral dorada */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        bgcolor: '#D4AF37',
                    }}
                />

                <Typography
                    variant="caption"
                    fontWeight={800}
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    color="text.secondary"
                >
                    Monto Total Facturado
                </Typography>

                <Typography
                    variant="h4"
                    fontWeight={900}
                    color="text.primary"
                    sx={{
                        my: 1,
                        fontSize: { xs: '1.75rem', md: '2.1rem' },
                        fontFamily: 'monospace',
                        letterSpacing: '-0.03em',
                    }}
                >
                    {formatCurrencyAmount(totalFacturado, factura.moneda)}
                </Typography>

                <Divider sx={{ my: 1.5, borderColor: alpha('#D4AF37', 0.25) }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, fontSize: '0.85rem' }}>
                    <Typography variant="body2" color="text.secondary">
                        Subtotal
                    </Typography>
                    <Typography variant="body2" fontWeight={700} textAlign="right" fontFamily="monospace">
                        {formatCurrencyAmount(factura.subTotal, factura.moneda)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        IGV ({IGV_RATE * 100}%)
                    </Typography>
                    <Typography variant="body2" fontWeight={700} textAlign="right" fontFamily="monospace">
                        {formatCurrencyAmount(factura.igv, factura.moneda)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Monto Cobrado
                    </Typography>
                    <Typography variant="body2" fontWeight={700} textAlign="right" color="success.main" fontFamily="monospace">
                        {formatCurrencyAmount(montoPagado, factura.moneda)}
                    </Typography>

                    <Typography variant="body2" fontWeight={800} color={hasSaldo ? 'error.main' : 'text.secondary'}>
                        Saldo Pendiente
                    </Typography>
                    <Typography
                        variant="body2"
                        fontWeight={900}
                        textAlign="right"
                        color={hasSaldo ? 'error.main' : 'success.main'}
                        fontFamily="monospace"
                    >
                        {formatCurrencyAmount(saldoPendiente, factura.moneda)}
                    </Typography>
                </Box>
            </Box>

            {/* Datos de Entidad / Billed To & Términos de Crédito */}
            <Stack spacing={2}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <BusinessIcon fontSize="small" color="primary" />
                        <Typography variant="caption" fontWeight={800} textTransform="uppercase" letterSpacing="0.08em" color="text.secondary">
                            Facturado a (Cliente)
                        </Typography>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                        {factura.cliente?.razonSocial || 'Sin cliente asignado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        RUC: {factura.cliente?.ruc || '-'}
                    </Typography>
                    {factura.cliente?.direccionFiscal && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                            {factura.cliente.direccionFiscal}
                        </Typography>
                    )}
                </Box>

                <Divider />

                <Box>
                    <Typography variant="caption" fontWeight={800} textTransform="uppercase" letterSpacing="0.08em" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Condiciones Comerciales
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Días de Crédito</Typography>
                            <Typography variant="body2" fontWeight={700}>{factura.diasCredito ?? 0} días</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Vencimiento</Typography>
                            <Typography
                                variant="body2"
                                fontWeight={700}
                                color={factura.esVencida ? 'error.main' : 'text.primary'}
                            >
                                {factura.fechaVencimiento ? formatDateShort(factura.fechaVencimiento) : '-'}
                            </Typography>
                        </Box>
                        {factura.fechaCompromisoPago && (
                            <Box sx={{ gridColumn: 'span 2' }}>
                                <Typography variant="caption" color="text.secondary">Compromiso de Pago</Typography>
                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color={factura.esCompromisoVencido ? 'warning.main' : 'text.primary'}
                                >
                                    {formatDateShort(factura.fechaCompromisoPago)}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                <Divider />

                {/* Documentos de Factura Electrónica Real */}
                <FacturaDocumentosCompactList
                    facturaId={factura.facturaID}
                    canManageFacturas={canManageFacturas}
                />

                {factura.esVencida && (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.error.main, 0.06),
                            borderColor: alpha(theme.palette.error.main, 0.2),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <WarningIcon color="error" fontSize="small" />
                        <Typography variant="caption" color="error.dark" fontWeight={600}>
                            Factura vencida con saldo pendiente de pago.
                        </Typography>
                    </Paper>
                )}
            </Stack>

            {/* Acciones Rápidas */}
            <Stack spacing={1.5} sx={{ mt: 'auto', pt: 1 }}>
                {canManageFacturas && hasSaldo ? (
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        startIcon={<VerifiedIcon />}
                        onClick={onRegisterPayment}
                        sx={{
                            borderRadius: 2,
                            py: 1.3,
                            fontWeight: 700,
                            boxShadow: theme.shadows[2],
                        }}
                    >
                        Registrar Pago
                    </Button>
                ) : null}

                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<PdfIcon />}
                        onClick={onDownloadPdf}
                        sx={{
                            borderRadius: 2,
                            py: 1,
                            fontWeight: 600,
                            color: 'text.primary',
                            borderColor: alpha(theme.palette.divider, 0.9),
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                            },
                        }}
                    >
                        Descargar PDF
                    </Button>
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<ExcelIcon />}
                        onClick={onDownloadExcel}
                        sx={{
                            borderRadius: 2,
                            py: 1,
                            fontWeight: 600,
                            color: 'text.primary',
                            borderColor: alpha(theme.palette.divider, 0.9),
                            '&:hover': {
                                borderColor: 'success.main',
                                bgcolor: alpha(theme.palette.success.main, 0.04),
                            },
                        }}
                    >
                        Excel
                    </Button>
                </Stack>

                <Button
                    variant="text"
                    fullWidth
                    size="small"
                    startIcon={<HistoryIcon />}
                    onClick={onViewPaymentsHistory}
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        '&:hover': { color: 'primary.main' },
                    }}
                >
                    Ver Historial de Abonos ({factura.pagos?.length ?? 0})
                </Button>
            </Stack>
        </Paper>
    );
}
