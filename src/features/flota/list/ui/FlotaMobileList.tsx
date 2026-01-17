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
    MenuItem
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocalShipping as TruckIcon,
    CalendarToday as CalendarIcon,
    LocalGasStation as FuelIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import type { Flota } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { StatusChip } from '@shared/components/ui/StatusChip';
import { useState } from 'react';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';

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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedFlota, setSelectedFlota] = useState<Flota | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, flota: Flota) => {
        setAnchorEl(event.currentTarget);
        setSelectedFlota(flota);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedFlota(null);
    };

    const handleAction = (action: 'view' | 'edit' | 'delete') => {
        if (!selectedFlota) return;

        switch (action) {
            case 'view':
                onView(selectedFlota);
                break;
            case 'edit':
                onEdit(selectedFlota);
                break;
            case 'delete':
                onDelete(selectedFlota);
                break;
        }
        handleMenuClose();
    };

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Cargando datos...</Box>;
    }

    if (!data?.items?.length) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No se encontraron vehículos</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {data.items.map((flota) => (
                    <Card 
                        key={flota.flotaID}
                        elevation={0} 
                        sx={{ 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 3,
                            position: 'relative'
                        }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
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
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => handleMenuOpen(e, flota)}
                                >
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </Box>

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
                        </CardContent>
                    </Card>
                ))}
            </Stack>

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

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleAction('view')}>
                    <VisibilityIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    Ver Detalle
                </MenuItem>
                <MenuItem onClick={() => handleAction('edit')}>
                    <EditIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    Editar
                </MenuItem>
                <MenuItem onClick={() => handleAction('delete')}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                    <Typography color="error">Eliminar</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
}
