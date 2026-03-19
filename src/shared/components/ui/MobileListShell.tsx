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
    Visibility as VisibilityIcon
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
    onPreview?: (item: T) => void; // Si hay un archivo principal
    
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
    onPreview,
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

    const handleAction = (action: 'edit' | 'delete' | 'preview') => {
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
                                    
                                    {!viewOnly && (onEdit || onDelete || onPreview) && (
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
                {onPreview && selectedItem && (
                    <MenuItem onClick={() => handleAction('preview')}>
                        <VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                        Ver Archivo
                    </MenuItem>
                )}
                
                {!viewOnly && onEdit && (
                    <MenuItem onClick={() => handleAction('edit')}>
                        <EditIcon fontSize="small" color="primary" sx={{ mr: 1.5 }} />
                        Editar
                    </MenuItem>
                )}
                
                {!viewOnly && onDelete && (
                    <MenuItem onClick={() => handleAction('delete')}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
                        <Typography color="error">Eliminar</Typography>
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
}
