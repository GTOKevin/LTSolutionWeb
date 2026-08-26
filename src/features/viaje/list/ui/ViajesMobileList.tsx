import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    useTheme,
    alpha,
    TablePagination,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    Chip
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    ArrowForward as ArrowForwardIcon,
    LocalShipping as TruckIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    LockOpen as LockOpenIcon,
    Lock as LockIcon,
    Description as DescriptionIcon,
    PictureAsPdf as PdfIcon,
    PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import type { ViajeListItem } from '@entities/viaje/model/types';
import { VIAJE_STATUS_CODE, resolveViajeStatusVisual } from '@entities/viaje/model/status';
import type { PagedResponse } from '@/shared/model/types';
import { formatDateShort } from '@/shared/utils/date-utils';
import { useState } from 'react';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import { StatusPill } from '@shared/components/ui/StatusPill';

interface ViajesMobileListProps {
    data?: PagedResponse<ViajeListItem>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    canManage?: boolean;
    canReabrir?: boolean;
    canCerrar?: boolean;
    onView?: (viaje: ViajeListItem) => void;
    onEdit?: (viaje: ViajeListItem) => void;
    onDelete?: (viaje: ViajeListItem) => void;
    onExportExcel?: (viaje: ViajeListItem) => void;
    onExportPdf?: (viaje: ViajeListItem) => void;
    onReopen?: (viaje: ViajeListItem) => void;
    onCerrar?: (viaje: ViajeListItem) => void;
    onAdvanceEstado?: (viaje: ViajeListItem) => void;
    getNextEstadoLabel?: (viaje: ViajeListItem) => string | undefined;
}

export function ViajesMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    canManage = false,
    canReabrir = false,
    canCerrar = false,
    onView,
    onEdit,
    onDelete,
    onExportExcel,
    onExportPdf,
    onReopen,
    onCerrar,
    onAdvanceEstado,
    getNextEstadoLabel
}: ViajesMobileListProps) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedViaje, setSelectedViaje] = useState<ViajeListItem | null>(null);
    const getRouteLabel = (value?: string) => value?.split('-')[2]?.trim() || value || 'Ruta no registrada';
    const getDisplayValue = (value: string | undefined, fallback: string) => value?.trim() || fallback;

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, viaje: ViajeListItem) => {
        setAnchorEl(event.currentTarget);
        setSelectedViaje(viaje);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedViaje(null);
    };

    const handleAction = (action: 'view' | 'edit' | 'delete' | 'reopen' | 'cerrar' | 'excel' | 'pdf' | 'advance') => {
        if (!selectedViaje) return;

        switch (action) {
            case 'view':
                onView?.(selectedViaje);
                break;
            case 'edit':
                onEdit?.(selectedViaje);
                break;
            case 'delete':
                onDelete?.(selectedViaje);
                break;
            case 'reopen':
                onReopen?.(selectedViaje);
                break;
            case 'cerrar':
                onCerrar?.(selectedViaje);
                break;
            case 'excel':
                onExportExcel?.(selectedViaje);
                break;
            case 'pdf':
                onExportPdf?.(selectedViaje);
                break;
            case 'advance':
                onAdvanceEstado?.(selectedViaje);
                break;
        }
        handleMenuClose();
    };

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando viajes...</Box>;
    }

    if (!data?.items.length) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No se encontraron viajes registrados</Box>;
    }

    const isEditable = canManage && Boolean(selectedViaje && !selectedViaje.cerrado);
    const showReports = Boolean(selectedViaje?.cerrado && (onExportExcel || onExportPdf));
    const showReopen = canReabrir && Boolean(selectedViaje?.cerrado);
    const showCerrar = canCerrar && Boolean(
        selectedViaje?.estadoCodigo === VIAJE_STATUS_CODE.COMPLETADO && !selectedViaje.cerrado,
    );
    const nextEstadoLabel = selectedViaje ? getNextEstadoLabel?.(selectedViaje) : undefined;
    const showAdvance = canManage && Boolean(selectedViaje && !selectedViaje.cerrado) && Boolean(nextEstadoLabel) && Boolean(onAdvanceEstado);

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' }, pb: 12 }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {data.items.map((viaje) => {
                    const estado = resolveViajeStatusVisual(viaje.estadoCodigo, viaje.estadoNombre);

                    return (
                        <Card
                            key={viaje.viajeID}
                            elevation={0}
                            sx={{
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 3,
                                position: 'relative'
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                                        <Box sx={{
                                            height: 34,
                                            px: 1.2,
                                            borderRadius: 1.5,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'primary.main',
                                            flexShrink: 0
                                        }}>
                                            <Typography variant="caption" fontWeight="bold" fontFamily="monospace">
                                                {viaje.codigo || `#${viaje.viajeID}`}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} noWrap>
                                                {viaje.clienteRazonSocial}
                                            </Typography>
                                            <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                                                {getDisplayValue(viaje.clienteRuc, 'Sin RUC registrado')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, viaje)}
                                        sx={{ ml: 1 }}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                                <Stack spacing={1.5}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                            {getRouteLabel(viaje.origenDescripcion)}
                                        </Typography>
                                        <ArrowForwardIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                            {getRouteLabel(viaje.destinoDescripcion)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2" fontWeight={500}>
                                                {viaje.fechaPartida ? formatDateShort(viaje.fechaPartida) : 'Pendiente de partida'}
                                            </Typography>
                                        </Box>

                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <StatusPill label={estado.label} tone={estado.tone} size="small" />
                                            {viaje.facturado ? (
                                                <Chip
                                                    label={`Facturado · ${viaje.facturaNumero ?? ''}`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(theme.palette.success.main, 0.12),
                                                        color: theme.palette.success.dark,
                                                        fontWeight: 700,
                                                        fontSize: '0.65rem',
                                                        height: 24
                                                    }}
                                                />
                                            ) : null}
                                        </Stack>
                                    </Box>

                                    <Box sx={{
                                        p: 1.5,
                                        bgcolor: alpha(theme.palette.background.default, 0.5),
                                        borderRadius: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2" noWrap>
                                                {getDisplayValue(viaje.conductorNombreCompleto, 'Sin conductor asignado')}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TruckIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="caption" fontFamily="monospace" sx={{ bgcolor: alpha(theme.palette.common.black, 0.05), px: 0.5, borderRadius: 0.5 }}>
                                                    {getDisplayValue(viaje.tractoPlaca, 'Sin tracto')}
                                                </Typography>
                                                {viaje.carretaPlaca && (
                                                    <Typography variant="caption" fontFamily="monospace" sx={{ bgcolor: alpha(theme.palette.common.black, 0.05), px: 0.5, borderRadius: 0.5 }}>
                                                        {viaje.carretaPlaca}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </Box>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>

            <Box sx={{ overflow: 'hidden' }}>
                <TablePagination
                    component="div"
                    count={data?.total || 0}
                    page={page}
                    onPageChange={onPageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={onRowsPerPageChange}
                    rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    labelRowsPerPage="Filas:"
                />
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 3,
                    sx: { borderRadius: 2, minWidth: 180 }
                }}
            >
                {showReopen && (
                    <MenuItem onClick={() => handleAction('reopen')}>
                        <LockOpenIcon fontSize="small" color="warning" sx={{ mr: 1.5 }} />
                        Reabrir Viaje
                    </MenuItem>
                )}

                {showCerrar && (
                    <MenuItem onClick={() => handleAction('cerrar')}>
                        <LockIcon fontSize="small" color="success" sx={{ mr: 1.5 }} />
                        Cerrar Viaje
                    </MenuItem>
                )}

                {showAdvance && (
                    <MenuItem onClick={() => handleAction('advance')}>
                        <PlayArrowIcon fontSize="small" color="primary" sx={{ mr: 1.5 }} />
                        Pasar a {nextEstadoLabel}
                    </MenuItem>
                )}

                {onView && (
                    <MenuItem onClick={() => handleAction('view')}>
                        <VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                        Ver Detalle
                    </MenuItem>
                )}

                {isEditable && (
                    <MenuItem onClick={() => handleAction('edit')}>
                        <EditIcon fontSize="small" color="primary" sx={{ mr: 1.5 }} />
                        Editar
                    </MenuItem>
                )}

                {showReports && ([
                    <MenuItem key="excel" onClick={() => handleAction('excel')}>
                        <DescriptionIcon fontSize="small" color="success" sx={{ mr: 1.5 }} />
                        Reporte Excel
                    </MenuItem>,
                    <MenuItem key="pdf" onClick={() => handleAction('pdf')}>
                        <PdfIcon fontSize="small" color="error" sx={{ mr: 1.5 }} />
                        Reporte PDF
                    </MenuItem>
                ])}

                {isEditable && (
                    <MenuItem onClick={() => handleAction('delete')}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
                        <Typography color="error">Eliminar</Typography>
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
}
