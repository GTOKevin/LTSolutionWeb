import { Box, Typography } from '@mui/material';

interface MisViajesKPIsProps {
    total: number;
    abiertos: number;
    cerrados: number;
    isRefreshing?: boolean;
}

export function MisViajesKPIs({ total, abiertos, cerrados, isRefreshing = false }: MisViajesKPIsProps) {
    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 3, minWidth: 160, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                    {isRefreshing ? 'ACTUALIZANDO' : 'TOTAL VISIBLE'}
                </Typography>
                <Typography variant="h3" fontWeight={800} color="primary.main">{total}</Typography>
            </Box>
            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 3, minWidth: 160, border: '1px solid', borderColor: 'divider', borderLeft: '4px solid', borderLeftColor: 'warning.main' }}>
                <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                    {isRefreshing ? 'EN CURSO' : 'ABIERTOS VISIBLES'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h3" fontWeight={800} color="text.primary">{abiertos}</Typography>
                    <Box sx={{ position: 'relative', display: 'flex', width: 12, height: 12 }}>
                        <Box sx={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', bgcolor: 'warning.main', opacity: 0.7, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                        <Box sx={{ position: 'relative', width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                    </Box>
                </Box>
            </Box>
            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 3, minWidth: 160, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                    {isRefreshing ? 'ULTIMO CORTE' : 'COMPLETADOS'}
                </Typography>
                <Typography variant="h3" fontWeight={800} color="success.main">{cerrados}</Typography>
            </Box>
        </Box>
    );
}
