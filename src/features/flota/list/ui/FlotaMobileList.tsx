import {
    Box,
    Typography,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import {
    LocalShipping as TruckIcon,
    Speed as OdometerIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import type { Flota } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { MobileListShell } from '@/shared/components/ui/MobileListShell';
import { FlotaEstadoOperativoChip } from '@entities/flota/ui/FlotaEstadoOperativoChip';
import { FlotaDocumentoVigenciaChip } from '@entities/flota/ui/FlotaDocumentoVigenciaChip';
import { buildCodigoInterno } from '@entities/flota/model/constants';

interface FlotaMobileListProps {
    data?: PagedResponse<Flota>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (flota: Flota) => void;
    onEdit?: (flota: Flota) => void;
    onDelete?: (flota: Flota) => void;
    onScheduleWorkshop?: (flota: Flota) => void;
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
    onDelete,
    onScheduleWorkshop
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
                onPrimaryAction={onScheduleWorkshop}
                canPrimaryAction={() => Boolean(onScheduleWorkshop)}
                getPrimaryActionLabel={() => 'Programar Taller'}
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
                            <Typography variant="caption" color="text.secondary">
                                {flota.codigoInterno ?? buildCodigoInterno(flota.tipoFlota, flota.flotaID)}
                            </Typography>
                        </Box>
                    </Box>
                )}
                renderBody={(flota) => (
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                {flota.tipoFlotaNavigation?.nombre || `Tipo ${flota.tipoFlota}`} · {flota.marca} {flota.modelo}
                            </Typography>
                            <FlotaEstadoOperativoChip estado={flota.estadoOperativo} active={flota.estado} />
                        </Box>

                        <Box sx={{
                            p: 1.5,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Doc. Vigencia</Typography>
                                <FlotaDocumentoVigenciaChip documento={flota.documentoCritico} />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Capacidad</Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {flota.cargaUtil != null ? `${flota.cargaUtil} kg` : '—'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <OdometerIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">Odómetro</Typography>
                                </Box>
                                <Typography variant="body2" fontWeight={600}>
                                    {flota.odometroActual != null ? `${flota.odometroActual} km` : '—'}
                                </Typography>
                            </Box>
                            {flota.conductorAsignado ? (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">Conductor</Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight={600}>{flota.conductorAsignado}</Typography>
                                </Box>
                            ) : null}
                        </Box>
                    </Stack>
                )}
            />
        </Box>
    );
}
