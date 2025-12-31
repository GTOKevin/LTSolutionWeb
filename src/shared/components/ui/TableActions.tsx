import { Box, IconButton, Tooltip } from '@mui/material';
import { 
    Visibility as VisibilityIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    TableView as ExcelIcon,
    PictureAsPdf as PdfIcon
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
    disableDelete = false
}: TableActionsProps) {
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
