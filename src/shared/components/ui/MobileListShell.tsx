import {
    Box,
    Card,
    CardContent,
    Stack,
    IconButton,
    Menu,
    MenuItem,
    TablePagination,
    Typography,
    useTheme
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    Visibility as VisibilityIcon,
    TableView as ExcelIcon,
    PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { useState, type ReactNode } from 'react';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';

interface MobileListShellProps<T> {
    items: T[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    emptyMessage?: string;
    
    // Render props
    keyExtractor: (item: T) => React.Key;
    renderHeader?: (item: T) => ReactNode;
    renderBody: (item: T) => ReactNode;
    
    // Actions
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onView?: (item: T) => void; // Para ver detalle
    onPreview?: (item: T) => void; // Si hay un archivo principal
    onExportExcel?: (item: T) => void;
    onExportPdf?: (item: T) => void;
    
    // Conditionals for actions (optional, returns boolean if action should be shown for specific item)
    canEdit?: (item: T) => boolean;
    canDelete?: (item: T) => boolean;
    canExportExcel?: (item: T) => boolean;
    canExportPdf?: (item: T) => boolean;
    
    // Styling
    getCardStyle?: (item: T, theme: any) => object;
}

export function MobileListShell<T>({
    items,
    total,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    viewOnly = false,
    emptyMessage = "No hay registros",
    keyExtractor,
    renderHeader,
    renderBody,
    onEdit,
    onDelete,
    onView,
    onPreview,
    onExportExcel,
    onExportPdf,
    canEdit = () => true,
    canDelete = () => true,
    canExportExcel = () => true,
    canExportPdf = () => true,
    getCardStyle
}: MobileListShellProps<T>) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: T) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    const handleAction = (action: 'edit' | 'delete' | 'preview' | 'view' | 'excel' | 'pdf') => {
        if (!selectedItem) return;

        switch (action) {
            case 'edit':
                onEdit?.(selectedItem);
                break;
            case 'delete':
                onDelete?.(selectedItem);
                break;
            case 'preview':
                onPreview?.(selectedItem);
                break;
            case 'view':
                onView?.(selectedItem);
                break;
            case 'excel':
                onExportExcel?.(selectedItem);
                break;
            case 'pdf':
                onExportPdf?.(selectedItem);
                break;
        }
        handleMenuClose();
    };

    if (items.length === 0) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>{emptyMessage}</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {items.map((item) => {
                    const customStyle = getCardStyle ? getCardStyle(item, theme) : {};
                    const hasActions = !viewOnly && (onEdit || onDelete || onPreview || onView || onExportExcel || onExportPdf);
                    
                    return (
                        <Card 
                            key={keyExtractor(item)}
                            elevation={0}
                            sx={{ 
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 3,
                                position: 'relative',
                                ...customStyle
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                    <Box sx={{ flex: 1 }}>
                                        {renderHeader && renderHeader(item)}
                                    </Box>
                                    
                                    {hasActions && (
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => handleMenuOpen(e, item)}
                                            sx={{ mt: -0.5, mr: -0.5 }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>

                                {renderBody(item)}
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>

            <TablePagination
                component="div"
                count={total}
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
                PaperProps={{
                    elevation: 3,
                    sx: { borderRadius: 2, minWidth: 180 }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {onView && selectedItem && (
                    <MenuItem onClick={() => handleAction('view')}>
                        <VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                        Ver Detalle
                    </MenuItem>
                )}
                
                {onPreview && selectedItem && (
                    <MenuItem onClick={() => handleAction('preview')}>
                        <VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                        Ver Archivo
                    </MenuItem>
                )}
                
                {onExportPdf && selectedItem && canExportPdf(selectedItem) && (
                    <MenuItem onClick={() => handleAction('pdf')}>
                        <PdfIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
                        Exportar PDF
                    </MenuItem>
                )}
                
                {onExportExcel && selectedItem && canExportExcel(selectedItem) && (
                    <MenuItem onClick={() => handleAction('excel')}>
                        <ExcelIcon fontSize="small" sx={{ mr: 1.5, color: 'success.main' }} />
                        Exportar Excel
                    </MenuItem>
                )}
                
                {!viewOnly && onEdit && selectedItem && canEdit(selectedItem) && (
                    <MenuItem onClick={() => handleAction('edit')}>
                        <EditIcon fontSize="small" color="primary" sx={{ mr: 1.5 }} />
                        Editar
                    </MenuItem>
                )}
                
                {!viewOnly && onDelete && selectedItem && canDelete(selectedItem) && (
                    <MenuItem onClick={() => handleAction('delete')}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
                        <Typography color="error">Eliminar</Typography>
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
}
