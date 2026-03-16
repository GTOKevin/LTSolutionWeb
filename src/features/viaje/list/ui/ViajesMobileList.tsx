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
    Description as DescriptionIcon,
    PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import type { ViajeListItem } from '@entities/viaje/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { formatDateShort } from '@/shared/utils/date-utils';
import { ESTADO_VIAJE_COD, ROL_USUARIO_ID } from '@/shared/constants/constantes';
import { useAuthStore } from '@/shared/store/auth.store';
import { useState } from 'react';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';

interface ViajesMobileListProps {
    data?: PagedResponse<ViajeListItem>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onView: (viaje: ViajeListItem) => void;
    onEdit: (viaje: ViajeListItem) => void;
    onDelete: (viaje: ViajeListItem) => void;
    onExportExcel: (viaje: ViajeListItem) => void;
    onExportPdf: (viaje: ViajeListItem) => void;
    onReopen?: (viaje: ViajeListItem) => void;
}

export function ViajesMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete,
    onExportExcel,
    onExportPdf,
    onReopen
}: ViajesMobileListProps) {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedViaje, setSelectedViaje] = useState<ViajeListItem | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, viaje: ViajeListItem) => {
        setAnchorEl(event.currentTarget);
        setSelectedViaje(viaje);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedViaje(null);
    };

    const handleAction = (action: 'view' | 'edit' | 'delete' | 'reopen' | 'excel' | 'pdf') => {
        if (!selectedViaje) return;

        switch (action) {
            case 'view':
                onView(selectedViaje);
                break;
            case 'edit':
                onEdit(selectedViaje);
                break;
            case 'delete':
                onDelete(selectedViaje);
                break;
            case 'reopen':
                onReopen && onReopen(selectedViaje);
                break;
            case 'excel':
                onExportExcel(selectedViaje);
                break;
            case 'pdf':
                onExportPdf(selectedViaje);
                break;
        }
        handleMenuClose();
    };

    const getEstadoConfig = (codigo?: string, nombre?: string) => {
        const label = nombre || 'Sin estado';

        if (codigo === ESTADO_VIAJE_COD.Agendado) {
            return {
                label,
                bg: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                dotColor: theme.palette.info.main
            };
        }
        if (codigo === ESTADO_VIAJE_COD.Transito) {
            return {
                label,
                bg: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.dark,
                dotColor: theme.palette.warning.main
            };
        }
        if (codigo === ESTADO_VIAJE_COD.Completado) {
            return {
                label,
                bg: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.dark,
                dotColor: theme.palette.success.main
            };
        }
        if (codigo === ESTADO_VIAJE_COD.Cancelado) {
            return {
                label,
                bg: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                dotColor: theme.palette.error.main
            };
        }
        return {
            label,
            bg: alpha(theme.palette.text.secondary, 0.1),
            color: theme.palette.text.secondary,
            dotColor: theme.palette.text.secondary
        };
    };

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando viajes...</Box>;
    }

    if (!data?.items.length) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No se encontraron viajes registrados</Box>;
    }

    // Determine visibility/permissions for the currently selected item in menu
    const isAdminOrManager = user && (Number(user.roleId) === ROL_USUARIO_ID.ADMINISTRADOR || Number(user.roleId) === ROL_USUARIO_ID.GERENTE_GENERAL);
    const isEditable = selectedViaje && !selectedViaje.cerrado;
    const showReports = selectedViaje?.cerrado;
    const showReopen = selectedViaje?.cerrado && isAdminOrManager;

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' }, pb: 12 }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {data.items.map((viaje) => {
                    const estado = getEstadoConfig(viaje.estadoCodigo, viaje.estadoNombre);
                    
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
                                {/* Header: Cliente + Menu */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                                        <Box sx={{ 
                                            width: 40, 
                                            height: 40, 
                                            borderRadius: '50%', 
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'primary.main',
                                            flexShrink: 0
                                        }}>
                                            <Typography variant="caption" fontWeight="bold">
                                                #{viaje.viajeID}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} noWrap>
                                                {viaje.clienteRazonSocial}
                                            </Typography>
                                            <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                                                RUC: {viaje.clienteRuc || 'N/A'}
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

                                {/* Route Info */}
                                <Stack spacing={1.5}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                            {viaje.origenDescripcion.split('-')[2]?.trim() || viaje.origenDescripcion}
                                        </Typography>
                                        <ArrowForwardIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                            {viaje.destinoDescripcion.split('-')[2]?.trim() || viaje.destinoDescripcion}
                                        </Typography>
                                    </Box>

                                    {/* Date & Status */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2" fontWeight={500}>
                                                {viaje.fechaPartida ? formatDateShort(viaje.fechaPartida) : 'N/A'}
                                            </Typography>
                                        </Box>
                                        
                                        <Chip 
                                            label={estado.label}
                                            size="small"
                                            sx={{ 
                                                bgcolor: estado.bg,
                                                color: estado.color,
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                height: 24,
                                                textTransform: 'uppercase'
                                            }}
                                        />
                                    </Box>

                                    {/* Driver & Truck */}
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
                                                {viaje.conductorNombreCompleto}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TruckIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="caption" fontFamily="monospace" sx={{ bgcolor: alpha(theme.palette.common.black, 0.05), px: 0.5, borderRadius: 0.5 }}>
                                                    {viaje.tractoPlaca}
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

            <Box sx={{ 
                overflow: 'hidden'
            }}>
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
                
                <MenuItem onClick={() => handleAction('view')}>
                    <VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                    Ver Detalle
                </MenuItem>
                
                {isEditable && (
                    <MenuItem onClick={() => handleAction('edit')}>
                        <EditIcon fontSize="small" color="primary" sx={{ mr: 1.5 }} />
                        Editar
                    </MenuItem>
                )}
                
                {showReports && (
                    [
                        <MenuItem key="excel" onClick={() => handleAction('excel')}>
                            <DescriptionIcon fontSize="small" color="success" sx={{ mr: 1.5 }} />
                            Reporte Excel
                        </MenuItem>,
                        <MenuItem key="pdf" onClick={() => handleAction('pdf')}>
                            <PdfIcon fontSize="small" color="error" sx={{ mr: 1.5 }} />
                            Reporte PDF
                        </MenuItem>
                    ]
                )}
                
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