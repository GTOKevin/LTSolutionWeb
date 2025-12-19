import { Box, IconButton, Tooltip } from '@mui/material';
import { Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface TableActionsProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    viewTooltip?: string;
    editTooltip?: string;
    deleteTooltip?: string;
}

export function TableActions({ 
    onView, 
    onEdit, 
    onDelete,
    viewTooltip = "Ver detalles",
    editTooltip = "Editar",
    deleteTooltip = "Eliminar"
}: TableActionsProps) {
    return (
        <Box className="actions-group" sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
        }}>
            {onView && (
                <Tooltip title={viewTooltip}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onView(); }}>
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
            {onEdit && (
                <Tooltip title={editTooltip}>
                    <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
            {onDelete && (
                <Tooltip title={deleteTooltip}>
                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
}
