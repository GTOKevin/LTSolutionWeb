import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RvHookupIcon from '@mui/icons-material/RvHookup';
import PersonIcon from '@mui/icons-material/Person';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import type { ViajeListItem } from '@/entities/viaje/model/types';
import { VIAJE_STATUS_CODE } from '@entities/viaje/model/status';

interface KanbanCardProps {
    viaje: ViajeListItem;
    draggable?: boolean;
    onClick: (viaje: ViajeListItem) => void;
    onEdit?: (viaje: ViajeListItem) => void;
    onView?: (viaje: ViajeListItem) => void;
    onDelete?: (viaje: ViajeListItem) => void;
}

export function KanbanCard({ viaje, draggable = true, onClick, onEdit, onView, onDelete }: KanbanCardProps) {
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
        disabled: !draggable,
        data: {
            type: 'Card',
            viaje,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: draggable ? 'grab' : 'default',
        marginBottom: theme.spacing(2),
    };

    const hasActions = Boolean(onEdit || onView || onDelete);

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
                    viaje.estadoCodigo === VIAJE_STATUS_CODE.AGENDADO ? '#94a3b8'
                        : viaje.estadoCodigo === VIAJE_STATUS_CODE.TRANSITO ? '#2563eb'
                            : viaje.estadoCodigo === VIAJE_STATUS_CODE.DESCARGANDO ? '#f59e0b'
                                : viaje.estadoCodigo === VIAJE_STATUS_CODE.COMPLETADO ? '#388e3c'
                                    : 'text.secondary',
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'text.primary' }}>
                        {viaje.codigo}
                    </Typography>
                    {hasActions ? (
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
                                onClick={(event) => event.stopPropagation()}
                            >
                                {onEdit ? (
                                    <MenuItem onClick={handleAction('edit')}>
                                        <ListItemIcon>
                                            <EditIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Modificar</ListItemText>
                                    </MenuItem>
                                ) : null}
                                {onView ? (
                                    <MenuItem onClick={handleAction('view')}>
                                        <ListItemIcon>
                                            <VisibilityIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Visualizar</ListItemText>
                                    </MenuItem>
                                ) : null}
                                {onDelete && viaje.estadoCodigo === VIAJE_STATUS_CODE.AGENDADO && !viaje.fechaPartida ? (
                                    <MenuItem onClick={handleAction('delete')} sx={{ color: 'error.main' }}>
                                        <ListItemIcon>
                                            <DeleteIcon fontSize="small" color="error" />
                                        </ListItemIcon>
                                        <ListItemText>Eliminar</ListItemText>
                                    </MenuItem>
                                ) : null}
                            </Menu>
                        </Box>
                    ) : null}
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <Typography variant="body2" fontWeight={500} color="text.secondary" noWrap sx={{ maxWidth: '40%' }}>
                        {viaje.origenDescripcion}
                    </Typography>
                    <ArrowRightAltIcon fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight={500} color="text.secondary" noWrap sx={{ maxWidth: '40%' }}>
                        {viaje.destinoDescripcion}
                    </Typography>
                </Stack>

                <Typography variant="caption" display="block" color="primary" fontWeight="bold" mb={1.5} noWrap>
                    {viaje.clienteRazonSocial}
                </Typography>

                <Divider sx={{ mb: 1.5 }} />

                <Stack direction="column" spacing={0.5} mb={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title="Tracto">
                            <LocalShippingIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        </Tooltip>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {viaje.tractoPlaca || 'Sin asignar'}
                        </Typography>
                    </Stack>
                    {viaje.carretaPlaca ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Tooltip title="Carreta">
                                <RvHookupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {viaje.carretaPlaca}
                            </Typography>
                        </Stack>
                    ) : null}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title="Conductor">
                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        </Tooltip>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {viaje.conductorNombreCompleto || 'Sin conductor'}
                        </Typography>
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={1} mb={1}>
                    {viaje.requiereEscolta ? (
                        <Chip
                            size="small"
                            label="Escolta"
                            sx={{
                                bgcolor: '#fff3e0',
                                color: '#ff6f00',
                                fontWeight: 'bold',
                                fontSize: '0.65rem',
                                height: 20,
                            }}
                        />
                    ) : null}
                </Stack>

                <Typography variant="caption" display="block" color="text.disabled" sx={{ borderTop: 1, borderColor: 'divider', pt: 1, mt: 1 }}>
                    Partida: {viaje.fechaPartida ? new Date(viaje.fechaPartida).toLocaleDateString() : 'Pendiente'}
                </Typography>
            </CardContent>
        </Card>
    );
}
