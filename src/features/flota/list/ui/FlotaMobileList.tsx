import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocalShipping as TruckIcon,
    CalendarToday as CalendarIcon,
    LocalGasStation as FuelIcon
} from '@mui/icons-material';
import type { Flota } from '@entities/flota/model/types';
import type { PagedResponse } from '@shared/api/types';
import { StatusChip } from '@shared/components/ui/StatusChip';

interface FlotaMobileListProps {
    data?: PagedResponse<Flota>;
    isLoading: boolean;
    onView: (flota: Flota) => void;
    onEdit: (flota: Flota) => void;
    onDelete: (flota: Flota) => void;
}

export function FlotaMobileList({
    data,
    isLoading,
    onView,
    onEdit,
    onDelete
}: FlotaMobileListProps) {
    const theme = useTheme();

    if (isLoading) {
        return <Box p={3} textAlign="center">Cargando datos...</Box>;
    }

    if (data?.items?.length === 0) {
        return <Box p={3} textAlign="center" color="text.secondary">No se encontraron vehículos</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {data?.items.map((flota) => (
                <Card 
                    key={flota.flotaID}
                    elevation={0} 
                    sx={{ 
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        mb: 2,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <CardContent sx={{ p: 2, pb: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700} fontFamily="monospace">
                                    {flota.placa}
                                </Typography>
                                <Typography variant="body2" color="text.primary">
                                    {flota.marca} {flota.modelo}
                                </Typography>
                            </Box>
                            <StatusChip active={flota.estado} />
                        </Box>

                        <Stack spacing={1} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TruckIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {flota.tipoFlotaNavigation?.nombre || `Tipo ${flota.tipoFlota}`}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {flota.anio}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FuelIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {flota.tipoCombustible}
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>

                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        borderTop: `1px solid ${theme.palette.divider}`,
                        bgcolor: alpha(theme.palette.background.default, 0.5)
                    }}>
                        <Button 
                            size="small" 
                            color="inherit" 
                            sx={{ py: 1.5, borderRadius: 0, color: 'text.secondary' }}
                            startIcon={<VisibilityIcon fontSize="small" />}
                            onClick={() => onView(flota)}
                        >
                            Ver
                        </Button>
                        <Button 
                            size="small" 
                            sx={{ 
                                py: 1.5, 
                                borderRadius: 0,
                                borderLeft: `1px solid ${theme.palette.divider}`,
                                borderRight: `1px solid ${theme.palette.divider}`
                            }}
                            startIcon={<EditIcon fontSize="small" />}
                            onClick={() => onEdit(flota)}
                        >
                            Editar
                        </Button>
                        <Button 
                            size="small" 
                            color="error"
                            sx={{ py: 1.5, borderRadius: 0 }}
                            startIcon={<DeleteIcon fontSize="small" />}
                            onClick={() => onDelete(flota)}
                        >
                            Eliminar
                        </Button>
                    </Box>
                </Card>
            ))}
        </Box>
    );
}
