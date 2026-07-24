import { Box, Button, Grid, Typography } from '@mui/material';
import type { MiPagoDto } from '@entities/employee/model/types';

interface PaymentStats {
    total: number;
    visibleCount: number;
    pendingCount: number;
    confirmedCount: number;
    currencyTotals: Array<{
        currency: string;
        amount: number;
    }>;
}

interface MisPagosKPIsProps {
    paymentStats: PaymentStats;
    dataItems?: MiPagoDto[];
    onSelectPending: (pago: MiPagoDto) => void;
    canConfirmPayments: boolean;
}

export function MisPagosKPIs({
    paymentStats,
    dataItems = [],
    onSelectPending,
    canConfirmPayments,
}: MisPagosKPIsProps) {
    const hasSingleCurrency = paymentStats.currencyTotals.length === 1;
    const singleCurrencyTotal = hasSingleCurrency ? paymentStats.currencyTotals[0] : null;

    return (
        <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', opacity: 0.6 }}>
                            Vista actual
                        </Typography>
                        <Typography variant="h2" fontWeight={900} color="primary.main" sx={{ mt: 1, letterSpacing: '-0.02em' }}>
                            {singleCurrencyTotal
                                ? `${singleCurrencyTotal.currency} ${singleCurrencyTotal.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                : paymentStats.visibleCount.toString().padStart(2, '0')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 360 }}>
                            {singleCurrencyTotal
                                ? 'Monto visible en la pagina actual segun los filtros aplicados.'
                                : 'La pagina actual mezcla monedas; por eso se muestran los registros visibles y el subtotal por divisa.'}
                        </Typography>
                        {!singleCurrencyTotal ? (
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {paymentStats.currencyTotals.map((item) => (
                                    <Box
                                        key={item.currency}
                                        sx={{
                                            px: 1.5,
                                            py: 0.75,
                                            borderRadius: 99,
                                            bgcolor: 'action.hover',
                                            color: 'text.primary',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {item.currency} {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </Box>
                                ))}
                            </Box>
                        ) : null}
                    </Box>
                    <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontWeight: 'bold', fontSize: '0.875rem' }}>
                        {paymentStats.visibleCount} visibles en esta pagina de {paymentStats.total} registros consultados
                    </Box>
                    <Box sx={{ position: 'absolute', right: -48, bottom: -48, width: 192, height: 192, bgcolor: 'primary.main', opacity: 0.05, borderRadius: '50%', filter: 'blur(40px)' }} />
                </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider' }}>
                    <Box>
                        <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', opacity: 0.6 }}>
                            Pendientes visibles
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
                            <Typography variant="h3" fontWeight={800} color="error.main">{paymentStats.pendingCount}</Typography>
                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                                {paymentStats.pendingCount === 1 ? 'pago en esta pagina' : 'pagos en esta pagina'}
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                            {paymentStats.confirmedCount} confirmados en la vista actual.
                        </Typography>
                    </Box>
                    <Button
                        fullWidth
                        variant="contained"
                        disabled={!canConfirmPayments || paymentStats.pendingCount === 0}
                        onClick={() => {
                            const firstPending = dataItems.find((item) => item.confirmadoPago == null);
                            if (firstPending) onSelectPending(firstPending);
                        }}
                        sx={{ mt: 4, py: 1.5, borderRadius: 3, bgcolor: 'error.light', color: 'error.dark', fontWeight: 800, letterSpacing: '0.1em', boxShadow: 'none', '&:hover': { bgcolor: 'error.main', color: 'error.contrastText', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
                    >
                        ATENDER PENDIENTE VISIBLE
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
}
