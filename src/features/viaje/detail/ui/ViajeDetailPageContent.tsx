import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Stack,
    Typography,
    Grid,
    Button,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    DirectionsCar as DirectionsCarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { APP_PATHS } from '@shared/config/app-routes';
import { getErrorMessage } from '@/shared/utils/api-errors';
import { PaperCard } from './shared/PaperCard';
import { ViajeTimeline } from './ViajeTimeline';
import { ViajeDetailAccordions } from './ViajeDetailAccordions';
import { useViajeDetailPageController } from '../hooks/useViajeDetailPageController';

interface ViajeDetailPageContentProps {
    mode?: 'view';
}

export function ViajeDetailPageContent({ mode = 'view' }: ViajeDetailPageContentProps) {
    const navigate = useNavigate();

    const {
        viaje,
        isLoading,
        isError,
        error,
        isViewOnly,
        tiposIncidente,
    } = useViajeDetailPageController({ mode });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError || !viaje) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {getErrorMessage(error, 'Error al cargar los detalles del viaje.')}
                </Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(APP_PATHS.viajes)}
                    sx={{ mt: 2 }}
                >
                    Volver al listado de viajes
                </Button>
            </Box>
        );
    }

    const viajeCodigo = viaje.codigo || `#${viaje.viajeID}`;
    const estadoNombre = viaje.estadoNombre || null;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 4 }}>
            {/* Header / Top Bar de Detalle */}
            <PaperCard>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(APP_PATHS.viajes)}
                            sx={{
                                borderRadius: 2,
                                color: 'text.secondary',
                                borderColor: 'divider',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                },
                            }}
                        >
                            Volver
                        </Button>
                        <Box>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Typography variant="h5" fontWeight={900} color="primary.main">
                                    Viaje {viajeCodigo}
                                </Typography>
                                <Chip
                                    icon={<DirectionsCarIcon fontSize="small" />}
                                    label={estadoNombre ? estadoNombre.toUpperCase() : 'SIN ESTADO'}
                                    color={estadoNombre ? 'primary' : 'default'}
                                    size="small"
                                    sx={{
                                        fontWeight: 800,
                                        letterSpacing: '0.05em',
                                        fontSize: '0.75rem',
                                        px: 0.5,
                                    }}
                                />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                Panel 360° de Operación, Seguimiento y Gestión Integral
                            </Typography>
                        </Box>
                    </Stack>

                </Stack>
            </PaperCard>

            {/* Grid 2 Columnas: Línea de Tiempo (Izquierda) + Acordeones (Derecha) */}
            <Grid container spacing={3} alignItems="flex-start">
                {/* Columna Izquierda: Línea de Tiempo */}
                <Grid size={{ xs: 12, lg: 3.5, xl: 2 }}>
                    <Card
                        sx={{
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                            position: { lg: 'sticky' },
                            top: { lg: 24 },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                                Línea de Tiempo
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                Progreso operativo del viaje
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <ViajeTimeline viaje={viaje} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Columna Derecha: Acordeones de Secciones Expandibles */}
                <Grid size={{ xs: 12, lg: 8.5, xl: 10 }}>
                    <ViajeDetailAccordions
                        viaje={viaje}
                        tiposIncidente={tiposIncidente}
                        isViewOnly={isViewOnly}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
