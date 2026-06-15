import { alpha, Box, Button, Chip, CircularProgress, Stack, Typography, useTheme } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface DashboardOverviewHeaderProps {
    description: string;
    isFetching: boolean;
    onRetry: () => void;
}

export function DashboardOverviewHeader({ description, isFetching, onRetry }: DashboardOverviewHeaderProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 2,
            }}
        >
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
                    Dashboard de Operaciones
                </Typography>
                <Typography color="text.secondary">
                    Visibilidad ejecutiva de viajes, facturación, alertas y disponibilidad de flota.
                </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Chip
                    icon={isFetching ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon />}
                    label={isFetching ? 'Actualizando' : description}
                    variant="outlined"
                    sx={{
                        borderRadius: 999,
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                    }}
                />
                <Button variant="text" size="small" onClick={onRetry}>
                    Refrescar
                </Button>
            </Stack>
        </Box>
    );
}
