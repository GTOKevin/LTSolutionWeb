import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Typography, Chip, Stack, IconButton, Tooltip, Divider, Menu, MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RvHookupIcon from '@mui/icons-material/RvHookup';
import PersonIcon from '@mui/icons-material/Person';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import WarningIcon from '@mui/icons-material/Warning';
import type { ViajeListItem } from '@/entities/viaje/model/types';
import { ESTADO_VIAJE_COD } from '@/shared/constants/constantes';
import { useTheme } from '@mui/material/styles';

interface KanbanCardProps {
    viaje: ViajeListItem;
    onClick: (viaje: ViajeListItem) => void;
    onEdit?: (viaje: ViajeListItem) => void;
    onView?: (viaje: ViajeListItem) => void;
    onDelete?: (viaje: ViajeListItem) => void;
}

export function KanbanCard({ viaje, onClick, onEdit, onView, onDelete }: KanbanCardProps) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action: 'edit' | 'view' | 'delete') => (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        handleClose();
        if (action === 'edit' && onEdit) onEdit(viaje);
        if (action === 'view' && onView) onView(viaje);
        if (action === 'delete' && onDelete) onDelete(viaje);
    };

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: viaje.viajeID,
        data: {
            type: 'Card',
            viaje
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        marginBottom: theme.spacing(2)
    };

    return (
        <Card 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            onClick={() => onClick(viaje)}
            sx={{ 
                '&:hover': { boxShadow: '0px 4px 8px rgba(0,0,0,0.12)' },
                boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
                borderRadius: 2,
                borderLeft: 4,
                borderColor: 
                    viaje.estadoCodigo === ESTADO_VIAJE_COD.Agendado ? "#94a3b8" :
                    viaje.estadoCodigo === ESTADO_VIAJE_COD.Transito ? '#2563eb' :
                    viaje.estadoCodigo === ESTADO_VIAJE_COD.Descargando ? '#f59e0b' :
                    viaje.estadoCodigo === ESTADO_VIAJE_COD.Completado ? '#388e3c' : 'text.secondary'
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'text.primary' }}>
                        {viaje.codigo}
                    </Typography>
                    <Box>
                        <IconButton 
                            size="small" 
                            sx={{ p: 0 }} 
                            onClick={handleClick}
                            aria-controls={open ? 'viaje-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                        >
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <Menu
                            id="viaje-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{
                                'aria-labelledby': 'viaje-button',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MenuItem onClick={handleAction('edit')}>
                                <ListItemIcon>
                                    <EditIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Modificar</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={handleAction('view')}>
                                <ListItemIcon>
                                    <VisibilityIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Visualizar</ListItemText>
                            </MenuItem>
                            {viaje.estadoCodigo === ESTADO_VIAJE_COD.Agendado && !viaje.fechaPartida && (
                                <MenuItem onClick={handleAction('delete')} sx={{ color: 'error.main' }}>
                                    <ListItemIcon>
                                        <DeleteIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText>Eliminar</ListItemText>
                                </MenuItem>
                            )}
                        </Menu>
                    </Box>
                </Stack>

                {/* Ruta */}
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <Typography variant="body2" fontWeight={500} color="text.secondary" noWrap sx={{ maxWidth: '40%' }}>
                        {viaje.origenDescripcion}
                    </Typography>
                    <ArrowRightAltIcon fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight={500} color="text.secondary" noWrap sx={{ maxWidth: '40%' }}>
                        {viaje.destinoDescripcion}
                    </Typography>
                </Stack>

                {/* Cliente */}
                <Typography variant="caption" display="block" color='primary' fontWeight='bold' mb={1.5} noWrap>
                    {viaje.clienteRazonSocial}
                </Typography>

                <Divider sx={{ mb: 1.5 }} />

                {/* Recursos */}
                <Stack direction="column" spacing={0.5} mb={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title="Tracto">
                            <LocalShippingIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        </Tooltip>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {viaje.tractoPlaca || 'Sin asignar'}
                        </Typography>
                    </Stack>
                    {viaje.carretaPlaca && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Tooltip title="Carreta">
                                <RvHookupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {viaje.carretaPlaca}
                            </Typography>
                        </Stack>
                    )}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title="Conductor">
                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        </Tooltip>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {viaje.conductorNombreCompleto || 'Sin conductor'}
                        </Typography>
                    </Stack>
                </Stack>

                {/* Badges / Chips */}
                <Stack direction="row" spacing={1} mb={1}>
                    {viaje.requiereEscolta && (
                        <Chip 
                            size="small" 
                            label="Escolta" 
                            sx={{ 
                                bgcolor: '#fff3e0', 
                                color: '#ff6f00', 
                                fontWeight: 'bold', 
                                fontSize: '0.65rem',
                                height: 20
                            }} 
                        />
                    )}
                    {/* Placeholder para incidentes si aplica a futuro */}
                    {false && (
                        <Tooltip title="Incidente reportado">
                            <WarningIcon color="error" fontSize="small" />
                        </Tooltip>
                    )}
                </Stack>

                {/* Footer */}
                <Typography variant="caption" display="block" color="text.disabled" sx={{ borderTop: 1, borderColor: 'divider', pt: 1, mt: 1 }}>
                    Partida: {viaje.fechaPartida ? new Date(viaje.fechaPartida).toLocaleDateString() : 'Pendiente'}
                </Typography>
            </CardContent>
        </Card>
    );
}
