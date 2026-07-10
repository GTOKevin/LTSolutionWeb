import { Box, Button, Grid, Typography } from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import type { MiPagoDto } from '@entities/employee/model/types';

interface PaymentStats {
    total: number;
    pendingCount: number;
    confirmedCount: number;
    visibleAmount: number;
}

interface MisPagosKPIsProps {
    paymentStats: PaymentStats;
    dataItems?: MiPagoDto[];
    onSelectPending: (pago: MiPagoDto) => void;
}

export function MisPagosKPIs({ paymentStats, dataItems = [], onSelectPending }: MisPagosKPIsProps) {
    return (
        <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', opacity: 0.6 }}>Balance Anual</Typography>
                        <Typography variant="h2" fontWeight={900} color="primary.main" sx={{ mt: 1, letterSpacing: '-0.02em' }}>
                            S/ {paymentStats.visibleAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 300 }}>
                            Total de pagos procesados y confirmados en el periodo actual.
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1, color: 'success.main', fontWeight: 'bold', fontSize: '0.875rem' }}>
                        <TrendingUpIcon fontSize="small" />
                        +12% respecto al año anterior
                    </Box>
                    <Box sx={{ position: 'absolute', right: -48, bottom: -48, width: 192, height: 192, bgcolor: 'primary.main', opacity: 0.05, borderRadius: '50%', filter: 'blur(40px)' }} />
                </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider' }}>
                    <Box>
                        <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', opacity: 0.6 }}>Pendientes de Confirmar</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
                            <Typography variant="h3" fontWeight={800} color="error.main">{paymentStats.pendingCount}</Typography>
                            <Typography variant="body2" fontWeight={600} color="text.secondary">pago pendiente</Typography>
                        </Box>
                    </Box>
                    <Button
                        fullWidth
                        variant="contained"
                        disabled={paymentStats.pendingCount === 0}
                        onClick={() => {
                            const firstPending = dataItems.find((item) => item.confirmadoPago !== true);
                            if (firstPending) onSelectPending(firstPending);
                        }}
                        sx={{ mt: 4, py: 1.5, borderRadius: 3, bgcolor: 'error.light', color: 'error.dark', fontWeight: 800, letterSpacing: '0.1em', boxShadow: 'none', '&:hover': { bgcolor: 'error.main', color: 'error.contrastText', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
                    >
                        ATENDER AHORA
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
}
