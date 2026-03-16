import { 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    Stack, 
    IconButton, 
    Menu, 
    MenuItem, 
    useTheme, 
    alpha,
    TablePagination,
    Grid
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    MoreVert as MoreVertIcon,
    Inventory2 as InventoryIcon,
    Straighten as RulerIcon,
    Scale as ScaleIcon
} from '@mui/icons-material';
import { useState } from 'react';
import type { ViajeMercaderia } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';

interface Props {
    items: ViajeMercaderia[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    tiposMedida: SelectItem[];
    tiposPeso: SelectItem[];
    mercaderias: SelectItem[];
    onEdit?: (item: ViajeMercaderia) => void;
    onDelete?: (id: number) => void;
}

export function ViajeMercaderiaMobileList({ 
    items, 
    total, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    viewOnly, 
    tiposMedida,
    tiposPeso,
    mercaderias,
    onEdit, 
    onDelete 
}: Props) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState<ViajeMercaderia | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: ViajeMercaderia) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    const handleEdit = () => {
        if (selectedItem && onEdit) {
            onEdit(selectedItem);
        }
        handleMenuClose();
    };

    const handleDelete = () => {
        if (selectedItem && onDelete) {
            onDelete(selectedItem.viajeMercaderiaID);
        }
        handleMenuClose();
    };

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {items.map((item) => {
                    const medida = tiposMedida.find(t => t.id === item.tipoMedidaID)?.text || '';
                    const pesoUnit = tiposPeso.find(t => t.id === item.tipoPesoID)?.text || '';
                    const mercaderiaNombre = mercaderias.find(m => m.id === item.mercaderiaID)?.text;
                    const displayName = item.descripcion || mercaderiaNombre || 'Sin descripción';
                    const secondaryName = (mercaderiaNombre && item.descripcion && item.descripcion !== mercaderiaNombre) ? mercaderiaNombre : null;

                    return (
                        <Card 
                            key={item.viajeMercaderiaID} 
                            elevation={0} 
                            sx={{ 
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 3,
                                position: 'relative'
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
                                        <Box sx={{ 
                                            p: 1, 
                                            borderRadius: 2, 
                                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                            color: theme.palette.secondary.main,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <InventoryIcon fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                                {displayName}
                                            </Typography>
                                            {secondaryName && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {secondaryName}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    {!viewOnly && (
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => handleMenuOpen(e, item)}
                                            sx={{ mt: -0.5, mr: -0.5 }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid size={{xs:6}}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                            <RulerIcon sx={{ fontSize: 16 }} />
                                            <Typography variant="caption">Dimensiones</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {Number(item.largo).toFixed(2)} x {Number(item.ancho).toFixed(2)} x {Number(item.alto).toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                            {medida}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{xs:6}}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                            <ScaleIcon sx={{ fontSize: 16 }} />
                                            <Typography variant="caption">Peso</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold" color="text.primary">
                                            {Number(item.peso).toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ 
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            bgcolor: alpha(theme.palette.action.active, 0.05),
                                            px: 0.5,
                                            borderRadius: 0.5
                                        }}>
                                            {pesoUnit}
                                        </Typography>
                                    </Grid>
                                </Grid>
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
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleEdit}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Editar
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Eliminar
                </MenuItem>
            </Menu>
        </Box>
    );
}
