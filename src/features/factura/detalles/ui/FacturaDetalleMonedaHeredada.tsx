import { Box, Paper, Typography } from '@mui/material';

interface FacturaDetalleMonedaHeredadaProps {
    currencyName: string;
}


export function FacturaDetalleMonedaHeredada({ currencyName }: FacturaDetalleMonedaHeredadaProps) {
    return (
        <Box
            sx={{
                pt: 2,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 1.5,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Moneda de Facturación:
                </Typography>
                <Paper
                    elevation={0}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                    <Typography variant="caption" fontWeight={700} color="text.primary">
                        {currencyName}
                    </Typography>
                </Paper>
            </Box>
            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                Heredado de la cabecera del comprobante
            </Typography>
        </Box>
    );
}
