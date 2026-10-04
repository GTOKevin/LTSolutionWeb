import React from 'react';
import {
    Box,
    Card,
    CardActions,
    CardContent,
    Divider,
    Grid,
    IconButton,
    TablePagination,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Edit as EditIcon,
    Build as BuildIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import type { Flota } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import { TableLoading } from '@shared/components/ui/TableLoading';
import { FlotaEstadoOperativoChip } from '@entities/flota/ui/FlotaEstadoOperativoChip';
import { FlotaDocumentoVigenciaChip } from '@entities/flota/ui/FlotaDocumentoVigenciaChip';
import { buildCodigoInterno } from '@entities/flota/model/constants';

interface FlotaCardsViewProps {
    data?: PagedResponse<Flota>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (flota: Flota) => void;
    onEdit?: (flota: Flota) => void;
    onScheduleWorkshop?: (flota: Flota) => void;
    onDelete?: (flota: Flota) => void;
}

function InfoLine({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={600} textAlign="right">
                {value}
            </Typography>
        </Box>
    );
}

export function FlotaCardsView({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onScheduleWorkshop,
    onDelete,
}: FlotaCardsViewProps) {
    const theme = useTheme();
    const items = data?.items ?? [];

    if (isLoading) {
        return <TableLoading />;
    }

    if (items.length === 0) {
        return (
            <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
                No se encontraron vehículos
            </Box>
        );
    }

    return (
        <Box>
            <Grid container spacing={2}>
                {items.map((flota) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={flota.flotaID}>
                        <Card
                            elevation={0}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 3,
                            }}
                        >
                            <CardContent sx={{ flex: 1, pb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={800} fontFamily="monospace">
                                            {flota.placa}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {flota.codigoInterno ?? buildCodigoInterno(flota.tipoFlota, flota.flotaID)}
                                        </Typography>
                                    </Box>
                                    <FlotaEstadoOperativoChip estado={flota.estadoOperativo} active={flota.estado} />
                                </Box>

                                <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                                    {flota.marca} {flota.modelo}
                                    {flota.tipoFlotaNavigation?.nombre ? ` · ${flota.tipoFlotaNavigation.nombre}` : ''}
                                </Typography>

                                <Divider sx={{ mb: 1.5 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                    <InfoLine
                                        label="Configuración"
                                        value={`${flota.ejes} ejes${flota.configuracionEjes?.nombre ? ` · ${flota.configuracionEjes.nombre}` : ''}`}
                                    />
                                    <InfoLine
                                        label="Capacidad Balanza"
                                        value={flota.cargaUtil != null ? `${flota.cargaUtil} kg` : '—'}
                                    />
                                    <InfoLine
                                        label="Doc. Vigencia"
                                        value={<FlotaDocumentoVigenciaChip documento={flota.documentoCritico} />}
                                    />
                                    {flota.conductorAsignado ? (
                                        <InfoLine label="Conductor" value={flota.conductorAsignado} />
                                    ) : null}
                                </Box>
                            </CardContent>

                            <CardActions sx={{ justifyContent: 'flex-end', px: 1, pb: 1 }}>
                                <Tooltip title="Ver expediente">
                                    <IconButton size="small" onClick={() => onView(flota)}>
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                {onScheduleWorkshop ? (
                                    <Tooltip title="Programar Taller">
                                        <IconButton size="small" color="warning" onClick={() => onScheduleWorkshop(flota)}>
                                            <BuildIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                ) : null}
                                {onEdit ? (
                                    <Tooltip title="Editar">
                                        <IconButton size="small" color="primary" onClick={() => onEdit(flota)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                ) : null}
                                {onDelete ? (
                                    <Tooltip title="Eliminar">
                                        <IconButton size="small" color="error" onClick={() => onDelete(flota)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                ) : null}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <TablePagination
                component="div"
                count={data?.total ?? 0}
                page={page}
                onPageChange={onPageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                labelRowsPerPage="Filas por página"
            />
        </Box>
    );
}
