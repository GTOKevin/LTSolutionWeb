import { alpha, Box, Paper, Typography, useTheme } from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import type { Factura } from '@entities/factura/model/types';

interface FacturaFinancialSummaryCardProps {
    factura?: Factura;
    currencyLabel?: string;
}

export function FacturaFinancialSummaryCard({
    factura,
    currencyLabel,
}: FacturaFinancialSummaryCardProps) {
    const theme = useTheme();

    if (!factura) {
        return (
            <Paper
                sx={{
                    p: 4,
                    borderRadius: 3,
                    border: `1px dashed ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 300,
                }}
            >
                <Typography variant="body2" color="text.secondary" align="center">
                    Guarde la información básica de la factura para habilitar los detalles y el resumen financiero.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                p: 4,
                borderRadius: 3,
                boxShadow: '0 24px 40px -10px rgba(25, 28, 29, 0.05)',
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    right: -40,
                    top: -40,
                    width: 150,
                    height: 150,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, color: 'primary.main', position: 'relative', zIndex: 1 }}>
                <ReceiptIcon />
                <Typography variant="h6" fontWeight="bold">
                    Resumen Financiero
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" color="text.secondary" fontWeight="medium">
                        Subtotal
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                            {currencyLabel}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" fontFamily="monospace">
                            {factura.subTotal.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" color="text.secondary" fontWeight="medium">
                            IGV
                        </Typography>
                        <Box sx={{ px: 1, py: 0.25, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 10 }}>
                            <Typography variant="caption" fontWeight="bold" color="success.main">
                                18%
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight="bold" color="text.secondary" fontFamily="monospace">
                            {factura.igv.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ height: 1, bgcolor: 'divider', my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Total Factura
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="primary.main" fontWeight="bold" sx={{ display: 'block' }}>
                            {currencyLabel}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color="primary.main" fontFamily="monospace">
                            {factura.total.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 2, p: 3, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 3, borderLeft: `4px solid ${theme.palette.warning.main}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" fontWeight="bold" textTransform="uppercase" letterSpacing={1} color="warning.dark">
                                Saldo Pendiente
                            </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight="bold" color="warning.dark" fontFamily="monospace">
                            {factura.saldoPendiente.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 4, textAlign: 'center', fontStyle: 'italic' }}>
                Los cálculos de impuestos se realizan automáticamente bajo las normativas vigentes.
            </Typography>
        </Paper>
    );
}
