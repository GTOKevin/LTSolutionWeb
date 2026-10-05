import React from 'react';
import {
    Box,
    Card,
    CardActions,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    TablePagination,
    Tooltip,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Edit as EditIcon,
    Build as BuildIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Speed as OdometerIcon,
    AltRoute as RouteIcon,
} from '@mui/icons-material';
import type { Flota } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import { TableLoading } from '@shared/components/ui/TableLoading';
import { FlotaEstadoOperativoChip } from '@entities/flota/ui/FlotaEstadoOperativoChip';
import { FlotaDocumentoVigenciaChip } from '@entities/flota/ui/FlotaDocumentoVigenciaChip';
import { buildCodigoInterno } from '@entities/flota/model/constants';
import { PeruvianPlate } from '../../shared/ui/PeruvianPlate';
import { FlotaBalanzaBar } from '../../shared/ui/FlotaBalanzaBar';

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
                No se encontraron vehículos registrados en la flota
            </Box>
        );
    }

    return (
        <Box>
            <Grid container spacing={2.5}>
                {items.map((flota) => {
                    const codigo = flota.codigoInterno ?? buildCodigoInterno(flota.tipoFlota, flota.flotaID);
                    return (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={flota.flotaID}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 3,
                                    bgcolor: theme.palette.background.paper,
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        boxShadow: theme.shadows[3],
                                        borderColor: 'primary.main',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                <CardContent sx={{ flex: 1, p: 2.5, pb: 1.5 }}>
                                    {/* Cabecera de la Card: Placa MTC + Estado operativo */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <PeruvianPlate placa={flota.placa} size="md" />
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    fontWeight: 700,
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {codigo}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                            <FlotaEstadoOperativoChip estado={flota.estadoOperativo} active={flota.estado} />
                                            {flota.viajeActivoCodigo ? (
                                                <Chip
                                                    icon={<RouteIcon sx={{ fontSize: '13px !important' }} />}
                                                    label={`#${flota.viajeActivoCodigo}`}
                                                    size="small"
                                                    color="info"
                                                    variant="outlined"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                    }}
                                                />
                                            ) : null}
                                        </Box>
                                    </Box>

                                    {/* Nombre, marca y modelo */}
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                        {flota.marca} {flota.modelo}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                                        <Chip
                                            label={flota.tipoFlotaNavigation?.nombre || `Tipo ${flota.tipoFlota}`}
                                            size="small"
                                            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                                        />
                                        <Chip
                                            label={`${flota.ejes} Ejes`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 22, fontSize: '0.7rem' }}
                                        />
                                        {flota.configuracionEjes?.nombre ? (
                                            <Chip
                                                label={flota.configuracionEjes.nombre}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ height: 22, fontSize: '0.7rem' }}
                                            />
                                        ) : null}
                                    </Box>

                                    <Divider sx={{ my: 1.5 }} />

                                    {/* Capacidad y Balanza */}
                                    <Box sx={{ mb: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                            Capacidad Balanza
                                        </Typography>
                                        <FlotaBalanzaBar
                                            pesoBruto={flota.pesoBruto}
                                            pesoNeto={flota.pesoNeto}
                                            cargaUtil={flota.cargaUtil}
                                            mode="compact"
                                        />
                                    </Box>

                                    {/* Documento y conductor */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Doc. Vigente
                                            </Typography>
                                            <FlotaDocumentoVigenciaChip documento={flota.documentoCritico} />
                                        </Box>

                                        {flota.conductorAsignado ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.75, borderRadius: 1.5, bgcolor: alpha(theme.palette.text.primary, 0.04) }}>
                                                <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="caption" fontWeight={600} noWrap>
                                                    {flota.conductorAsignado}
                                                </Typography>
                                            </Box>
                                        ) : null}

                                        {flota.odometroActual != null ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <OdometerIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Odómetro: <strong style={{ fontFamily: 'monospace' }}>{flota.odometroActual.toLocaleString('es-PE')} km</strong>
                                                </Typography>
                                            </Box>
                                        ) : null}
                                    </Box>
                                </CardContent>

                                <CardActions
                                    sx={{
                                        justifyContent: 'space-between',
                                        px: 2,
                                        py: 1.25,
                                        borderTop: `1px solid ${theme.palette.divider}`,
                                        bgcolor: alpha(theme.palette.background.default, 0.4),
                                    }}
                                >
                                    <Tooltip title="Ver detalles y expediente">
                                        <IconButton size="small" onClick={() => onView(flota)} color="primary">
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>

                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        {onScheduleWorkshop ? (
                                            <Tooltip title="Programar Taller">
                                                <IconButton
                                                    size="small"
                                                    color="warning"
                                                    onClick={() => onScheduleWorkshop(flota)}
                                                >
                                                    <BuildIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        ) : null}
                                        {onEdit ? (
                                            <Tooltip title="Editar vehículo">
                                                <IconButton size="small" color="default" onClick={() => onEdit(flota)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        ) : null}
                                        {onDelete ? (
                                            <Tooltip title="Eliminar vehículo">
                                                <IconButton size="small" color="error" onClick={() => onDelete(flota)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        ) : null}
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {data && (
                <TablePagination
                    rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    component="div"
                    count={data.total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={onPageChange}
                    onRowsPerPageChange={onRowsPerPageChange}
                    labelRowsPerPage="Vehículos por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
                    sx={{ mt: 2 }}
                />
            )}
        </Box>
    );
}
