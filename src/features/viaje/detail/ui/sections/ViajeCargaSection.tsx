import { Box, Chip, Grid, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
    Inventory2Outlined as Inventory2OutlinedIcon,
    Scale as ScaleIcon,
    Straighten as StraightenIcon,
} from '@mui/icons-material';
import type { ViajeDetail, ViajeMercaderiaDetail } from '@/entities/viaje/model/types';
import { SimpleDataTable, type SimpleDataTableColumn } from '../shared/SimpleDataTable';

interface ViajeCargaSectionProps {
    viaje: ViajeDetail;
}

const getMercaderiaMedidas = (item: ViajeMercaderiaDetail) => {
    const dimensiones = [item.largo, item.ancho, item.alto]
        .map((value) => (value === null || value === undefined ? null : `${value}`))
        .filter(Boolean)
        .join(' x ');

    return dimensiones || '—';
};

const getMercaderiaPeso = (item: ViajeMercaderiaDetail) => {
    if (item.peso === null || item.peso === undefined) return '—';
    return `${item.peso} ${item.tipoPesoDescripcion ?? ''}`.trim();
};

export function ViajeCargaSection({ viaje }: ViajeCargaSectionProps) {
    const theme = useTheme();
    const mercaderias = viaje.mercaderias ?? [];

    const medidas = [
        { label: 'Largo', val: viaje.largo ? `${viaje.largo} m` : '—' },
        { label: 'Ancho', val: viaje.ancho ? `${viaje.ancho} m` : '—' },
        { label: 'Alto', val: viaje.alto ? `${viaje.alto} m` : '—' },
        { label: 'Peso Total', val: viaje.peso ? `${viaje.peso} Kg` : '—' },
    ];

    const mercaderiaColumns: SimpleDataTableColumn<ViajeMercaderiaDetail>[] = [
        {
            header: 'Mercadería',
            render: (item) => (
                <Typography variant="body2" fontWeight={700} color="primary.main">
                    {item.mercaderiaDescripcion || 'Mercadería'}
                </Typography>
            ),
        },
        {
            header: 'Descripción',
            render: (item) => (
                <Typography variant="body2" color="text.secondary">
                    {item.descripcion || '—'}
                </Typography>
            ),
        },
        {
            header: 'Medidas',
            render: (item) => <Typography variant="body2">{getMercaderiaMedidas(item)}</Typography>,
        },
        {
            header: 'Peso',
            render: (item) => <Typography variant="body2">{getMercaderiaPeso(item)}</Typography>,
        },
    ];

    return (
        <Stack spacing={3}>
            <Box>
                <Typography
                    variant="caption"
                    fontWeight={800}
                    color="text.secondary"
                    sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}
                >
                    Configuración de Carga y Medidas
                </Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Grid container spacing={2}>
                            {medidas.map((item) => (
                                <Grid size={{ xs: 6 }} key={item.label}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
                                            {item.label === 'Peso Total' ? <ScaleIcon fontSize="inherit" color="action" /> : <StraightenIcon fontSize="inherit" color="action" />}
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                {item.label}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body1" fontWeight={700}>
                                            {item.val}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 4 }}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Ejes Tracto
                                    </Typography>
                                    <Typography variant="h6" fontWeight={800} mt={0.5}>
                                        {viaje.ejesTracto ?? '—'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Ejes Carreta
                                    </Typography>
                                    <Typography variant="h6" fontWeight={800} mt={0.5}>
                                        {viaje.ejesCarreta ?? '—'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <Typography variant="caption" color="primary.main" fontWeight={700}>
                                        Ejes Totales
                                    </Typography>
                                    <Typography variant="h6" fontWeight={800} color="primary.main" mt={0.5}>
                                        {(viaje.ejesTracto || 0) + (viaje.ejesCarreta || 0) || '—'}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>

            <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <Inventory2OutlinedIcon fontSize="small" color="primary" />
                    <Typography
                        variant="caption"
                        fontWeight={800}
                        color="text.secondary"
                        sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
                    >
                        Mercadería Transportada
                    </Typography>
                    <Chip
                        label={`${mercaderias.length} ${mercaderias.length === 1 ? 'item' : 'items'}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                </Stack>

                <SimpleDataTable
                    columns={mercaderiaColumns}
                    rows={mercaderias}
                    rowKey={(item) => item.viajeMercaderiaID}
                    emptyMessage="No se registraron mercaderías para este viaje."
                />
            </Box>
        </Stack>
    );
}
