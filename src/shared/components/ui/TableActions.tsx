import { useState } from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { 
    Visibility as VisibilityIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    TableView as ExcelIcon,
    PictureAsPdf as PdfIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';

interface TableActionsProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onExportExcel?: () => void;
    onExportPdf?: () => void;
    viewTooltip?: string;
    editTooltip?: string;
    deleteTooltip?: string;
    excelTooltip?: string;
    pdfTooltip?: string;
    disableView?: boolean;
    disableEdit?: boolean;
    disableDelete?: boolean;
    useMenu?: boolean;
}

export function TableActions({ 
    onView, 
    onEdit, 
    onDelete,
    onExportExcel,
    onExportPdf,
    viewTooltip = "Ver detalles",
    editTooltip = "Editar",
    deleteTooltip = "Eliminar",
    excelTooltip = "Exportar Excel",
    pdfTooltip = "Exportar PDF",
    disableView = false,
    disableEdit = false,
    disableDelete = false,
    useMenu = false
}: TableActionsProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action: () => void) => (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        handleClose();
        action();
    };

    if (useMenu) {
        return (
            <Box onClick={(e) => e.stopPropagation()}>
                <IconButton
                    size="small"
                    onClick={handleClick}
                    aria-controls={open ? 'table-actions-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu
                    id="table-actions-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    onClick={(e) => e.stopPropagation()}
                >
                    {onEdit && !disableEdit && (
                        <MenuItem onClick={handleAction(onEdit)}>
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>{editTooltip}</ListItemText>
                        </MenuItem>
                    )}
                    {onView && !disableView && (
                        <MenuItem onClick={handleAction(onView)}>
                            <ListItemIcon>
                                <VisibilityIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>{viewTooltip}</ListItemText>
                        </MenuItem>
                    )}
                    {onDelete && !disableDelete && (
                        <MenuItem onClick={handleAction(onDelete)} sx={{ color: 'error.main' }}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText>{deleteTooltip}</ListItemText>
                        </MenuItem>
                    )}
                    {onExportExcel && (
                        <MenuItem onClick={handleAction(onExportExcel)}>
                            <ListItemIcon>
                                <ExcelIcon fontSize="small" color="success" />
                            </ListItemIcon>
                            <ListItemText>{excelTooltip}</ListItemText>
                        </MenuItem>
                    )}
                    {onExportPdf && (
                        <MenuItem onClick={handleAction(onExportPdf)}>
                            <ListItemIcon>
                                <PdfIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText>{pdfTooltip}</ListItemText>
                        </MenuItem>
                    )}
                </Menu>
            </Box>
        );
    }
    return (
        <Box className="actions-group" sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
        }}>
            {onExportExcel && (
                <Tooltip title={excelTooltip}>
                    <span>
                        <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); onExportExcel(); }}>
                            <ExcelIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
            {onExportPdf && (
                <Tooltip title={pdfTooltip}>
                    <span>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onExportPdf(); }}>
                            <PdfIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
            {onView && (
                <Tooltip title={viewTooltip}>
                    <span>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onView(); }} disabled={disableView}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
            {onEdit && (
                <Tooltip title={editTooltip}>
                    <span>
                        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onEdit(); }} disabled={disableEdit}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
            {onDelete && (
                <Tooltip title={deleteTooltip}>
                    <span>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(); }} disabled={disableDelete}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
        </Box>
    );
}
