import {
    Box,
    Typography,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import {
    LocalShipping as TruckIcon,
    CalendarToday as CalendarIcon,
    LocalGasStation as FuelIcon
} from '@mui/icons-material';
import type { Flota } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@shared/components/ui/StatusChip';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';

interface FlotaMobileListProps {
    data?: PagedResponse<Flota>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (flota: Flota) => void;
    onEdit: (flota: Flota) => void;
    onDelete: (flota: Flota) => void;
}

export function FlotaMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete
}: FlotaMobileListProps) {
    const theme = useTheme();

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando datos...</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <MobileListShell
                items={data?.items || []}
                total={data?.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                emptyMessage="No se encontraron vehículos"
                keyExtractor={(item) => item.flotaID}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                renderHeader={(flota) => (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main'
                        }}>
                            <TruckIcon />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} fontFamily="monospace">
                                {flota.placa}
                            </Typography>
                            <Typography variant="body2" color="text.primary">
                                {flota.marca} {flota.modelo}
                            </Typography>
                        </Box>
                    </Box>
                )}
                renderBody={(flota) => (
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TruckIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {flota.tipoFlotaNavigation?.nombre || `Tipo ${flota.tipoFlota}`}
                                </Typography>
                            </Box>
                            <StatusChip active={flota.estado} />
                        </Box>
                        
                        <Box sx={{ 
                            p: 1.5, 
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            borderRadius: 2,
                            display: 'flex',
                            gap: 2
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {flota.anio}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FuelIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {flota.tipoCombustible}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                )}
            />
        </Box>
    );
}
