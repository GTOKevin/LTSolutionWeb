import { Box, Grid, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
    Business as BusinessIcon,
    LocalShipping as LocalShippingIcon,
    Person as PersonIcon,
    RvHookup as RvHookupIcon,
} from '@mui/icons-material';
import type { ViajeDetail } from '@/entities/viaje/model/types';

interface ViajeInfoServiceSectionProps {
    viaje: ViajeDetail;
}

export function ViajeInfoServiceSection({ viaje }: ViajeInfoServiceSectionProps) {
    const theme = useTheme();
    const conductorNombre = viaje.conductorNombreCompleto;

    const items = [
        {
            icon: <BusinessIcon fontSize="small" color="action" />,
            label: 'Cliente',
            value: viaje.clienteRazonSocial || 'Sin cliente asociado',
            fallbackTitle: 'Sin cliente',
            emphasized: false,
        },
        {
            icon: <PersonIcon fontSize="small" color="action" />,
            label: 'Conductor',
            value: conductorNombre || 'Sin conductor asignado',
            fallbackTitle: 'Sin conductor',
            emphasized: false,
        },
        {
            icon: <LocalShippingIcon fontSize="small" color="action" />,
            label: 'Tracto',
            value: viaje.tractoPlaca || 'Sin asignar',
            fallbackTitle: 'Sin asignar',
            emphasized: true,
        },
        {
            icon: <RvHookupIcon fontSize="small" color="action" />,
            label: 'Carreta',
            value: viaje.carretaPlaca || 'Sin carreta',
            fallbackTitle: 'Sin carreta',
            emphasized: true,
        },
    ];

    return (
        <Box>
            <Typography
                variant="caption"
                fontWeight={800}
                color="text.secondary"
                sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}
            >
                Información del Servicio
            </Typography>
            <Grid container spacing={2}>
                {items.map((item) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                height: '100%',
                                bgcolor: alpha(theme.palette.background.default, 0.6),
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                {item.icon}
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    {item.label}
                                </Typography>
                            </Stack>
                            <Typography
                                variant="body2"
                                fontWeight={item.emphasized ? 800 : 700}
                                color={item.emphasized ? 'primary.main' : 'text.primary'}
                                noWrap
                                title={item.value}
                            >
                                {item.value}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
