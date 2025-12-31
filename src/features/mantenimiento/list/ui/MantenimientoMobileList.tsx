import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    useTheme,
    Stack,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import { 
    MoreVert as MoreVertIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { formatDateLong } from '@shared/utils/date-utils';
import { useState } from 'react';

interface MantenimientoMobileListProps {
    data?: Mantenimiento[];
    isLoading: boolean;
    onView: (item: Mantenimiento) => void;
    onEdit: (item: Mantenimiento) => void;
    onDelete: (item: Mantenimiento) => void;
}

export function MantenimientoMobileList({
    data,
    isLoading,
    onView,
    onEdit,
    onDelete
}: MantenimientoMobileListProps) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState<Mantenimiento | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: Mantenimiento) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    const handleAction = (action: 'view' | 'edit' | 'delete') => {
        if (!selectedItem) return;
        
        if (action === 'view') onView(selectedItem);
        if (action === 'edit') onEdit(selectedItem);
        if (action === 'delete') onDelete(selectedItem);
        
        handleMenuClose();
    };

    const getStatusColor = (statusName: string = '') => {
        const name = statusName.toLowerCase();
        if (name.includes('pendiente') || name.includes('agendado')) return 'default';
        if (name.includes('proceso') || name.includes('taller')) return 'warning';
        if (name.includes('finalizado') || name.includes('completado')) return 'success';
        if (name.includes('cancelado')) return 'error';
        return 'default';
    };

    if (isLoading) {
        return <Box sx={{ p: 2, textAlign: 'center' }}>Cargando datos...</Box>;
    }

    if (!data || data.length === 0) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No se encontraron registros</Box>;
    }

    const isCompleted = (item: Mantenimiento | null) => item?.estadoID === 1;

    return (
        <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {data.map((item) => {
                const statusColor = getStatusColor(item.estado?.nombre);
                
                return (
                    <Card key={item.mantenimientoID} elevation={0} sx={{ 
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2
                    }}>
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {item.flota?.marca} {item.flota?.modelo}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {item.flota?.placa} • #MNT-{item.mantenimientoID}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Chip 
                                        label={item.estado?.nombre || 'Desconocido'} 
                                        size="small" 
                                        color={statusColor as any}
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', mr: 1 }}
                                    />
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => handleMenuOpen(e, item)}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Tipo Servicio
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {item.tipoServicio?.nombre}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Ingreso
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {formatDateLong(item.fechaIngreso)}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleAction('view')}>
                    <VisibilityIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    Ver Detalle
                </MenuItem>
                <MenuItem 
                    onClick={() => handleAction('edit')} 
                    disabled={isCompleted(selectedItem)}
                >
                    <EditIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    Editar
                </MenuItem>
                <MenuItem 
                    onClick={() => handleAction('delete')}
                    disabled={isCompleted(selectedItem)}
                >
                    <DeleteIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                    <Typography color="error">Eliminar</Typography>
                </MenuItem>
            </Menu>
        </Stack>
    );
}
