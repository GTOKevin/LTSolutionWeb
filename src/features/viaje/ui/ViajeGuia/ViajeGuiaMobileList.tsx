import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    IconButton,
    Menu,
    MenuItem,
    alpha,
    useTheme,
    TablePagination
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    Person as PersonIcon,
    LocalShipping as LocalShippingIcon,
    ListAlt as ListAltIcon
} from '@mui/icons-material';
import { useState } from 'react';
import type { ViajeGuia } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';

interface Props {
    items: ViajeGuia[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    tiposGuia: SelectItem[];
    onEdit?: (item: ViajeGuia) => void;
    onDelete?: (id: number) => void;
    onPreview?: (path: string) => void;
}

export function ViajeGuiaMobileList({ 
    items, 
    total, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    viewOnly, 
    tiposGuia, 
    onEdit, 
    onDelete,
    onPreview 
}: Props) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState<ViajeGuia | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: ViajeGuia) => {
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
                onDelete?.(selectedItem.viajeGuiaID);
                break;
            case 'preview':
                if (selectedItem.rutaArchivo) {
                    onPreview?.(selectedItem.rutaArchivo);
                }
                break;
        }
        handleMenuClose();
    };

    const getGuideTypeIcon = (text: string) => {
        if (text.toLowerCase().includes('remitente')) return <PersonIcon fontSize="small" />;
        if (text.toLowerCase().includes('transportista')) return <LocalShippingIcon fontSize="small" />;
        return <ListAltIcon fontSize="small" />;
    };

    const getGuideTypeColor = (text: string) => {
        if (text.toLowerCase().includes('remitente')) return theme.palette.primary.main;
        if (text.toLowerCase().includes('transportista')) return theme.palette.success.main;
        return theme.palette.text.secondary;
    };

    const getGuideTypeBg = (text: string) => {
        if (text.toLowerCase().includes('remitente')) return alpha(theme.palette.primary.main, 0.1);
        if (text.toLowerCase().includes('transportista')) return alpha(theme.palette.success.main, 0.1);
        return alpha(theme.palette.text.secondary, 0.1);
    };

    if (items.length === 0) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No hay guías registradas</Box>;
    }

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {items.map((item) => {
                    const tipo = tiposGuia.find(t => t.id === item.tipoGuiaID);
                    const tipoText = tipo?.text || item.tipoGuia?.descripcion || 'Desconocido';

                    return (
                        <Card 
                            key={item.viajeGuiaID}
                            elevation={0}
                            sx={{ 
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 3,
                                position: 'relative'
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Box sx={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: 1,
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 10,
                                        bgcolor: getGuideTypeBg(tipoText),
                                        color: getGuideTypeColor(tipoText)
                                    }}>
                                        {getGuideTypeIcon(tipoText)}
                                        <Typography variant="caption" fontWeight="bold">
                                            {tipoText}
                                        </Typography>
                                    </Box>
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => handleMenuOpen(e, item)}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Typography variant="subtitle1" fontFamily="monospace" fontWeight="bold" sx={{ mb: 1 }}>
                                    {item.serie}-{item.numero}
                                </Typography>

                                {item.rutaArchivo && (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1,
                                        color: 'primary.main',
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        p: 1,
                                        borderRadius: 1,
                                        cursor: 'pointer'
                                    }} onClick={() => onPreview?.(item.rutaArchivo!)}>
                                        <VisibilityIcon fontSize="small" />
                                        <Typography variant="caption" fontWeight="bold">Ver Archivo Adjunto</Typography>
                                    </Box>
                                )}
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
            >
                {selectedItem?.rutaArchivo && (
                    <MenuItem onClick={() => handleAction('preview')}>
                        <VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                        Ver Archivo
                    </MenuItem>
                )}
                
                {!viewOnly && (
                    <MenuItem onClick={() => handleAction('edit')}>
                        <EditIcon fontSize="small" color="primary" sx={{ mr: 1.5 }} />
                        Editar
                    </MenuItem>
                )}
                
                {!viewOnly && (
                    <MenuItem onClick={() => handleAction('delete')}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
                        <Typography color="error">Eliminar</Typography>
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
}