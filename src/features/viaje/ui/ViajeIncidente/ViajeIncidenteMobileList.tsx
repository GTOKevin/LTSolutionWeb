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
    Chip,
    Grid,
    Button
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    MoreVert as MoreVertIcon,
    History as HistoryIcon,
    Place as PlaceIcon,
    Image as ImageIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { useState } from 'react';
import type { ViajeIncidente } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import { formatDate, formatTime } from '@/shared/utils/date-utils';

interface Props {
    items: ViajeIncidente[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    tiposIncidente: SelectItem[];
    onEdit?: (item: ViajeIncidente) => void;
    onDelete?: (id: number) => void;
    onPreview?: (path: string) => void;
}

export function ViajeIncidenteMobileList({ 
    items, 
    total, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    viewOnly, 
    tiposIncidente,
    onEdit, 
    onDelete,
    onPreview
}: Props) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState<ViajeIncidente | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: ViajeIncidente) => {
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
            onDelete(selectedItem.viajeIncidenteID);
        }
        handleMenuClose();
    };

    const getIncidenteColor = (text: string = '') => {
        const lower = text.toLowerCase();
        if (lower.includes('accidente')) return theme.palette.error;
        if (lower.includes('robo')) return theme.palette.error;
        if (lower.includes('falla')) return theme.palette.warning;
        if (lower.includes('clima')) return theme.palette.info;
        if (lower.includes('bloqueo')) return theme.palette.warning;
        return theme.palette.primary;
    };

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {items.map((item) => {
                    const tipo = tiposIncidente.find(t => t.id === item.tipoIncidenteID);
                    const tipoText = tipo?.text || item.tipoIncidente?.descripcion || 'Otro';
                    const colorPalette = getIncidenteColor(tipoText);

                    return (
                        <Card 
                            key={item.viajeIncidenteID} 
                            elevation={0} 
                            sx={{ 
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 3,
                                position: 'relative',
                                borderLeft: `4px solid ${colorPalette.main}`
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                    <Chip 
                                        label={tipoText} 
                                        size="small" 
                                        sx={{ 
                                            height: 24,
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            bgcolor: alpha(colorPalette.main, 0.1),
                                            color: colorPalette.dark,
                                            border: `1px solid ${alpha(colorPalette.main, 0.2)}`
                                        }} 
                                    />
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
                                    <Grid size={{xs:12}}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                            <HistoryIcon sx={{ fontSize: 16 }} />
                                            <Typography variant="caption">Fecha y Hora</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {formatDate(item.fechaHora)} - {formatTime(item.fechaHora)}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{xs:12}}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                            <PlaceIcon sx={{ fontSize: 16 }} />
                                            <Typography variant="caption">Lugar</Typography>
                                        </Box>
                                        <Typography variant="body2">
                                            {item.lugar || 'N/A'}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{xs:12}}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                            <DescriptionIcon sx={{ fontSize: 16 }} />
                                            <Typography variant="caption">Descripción</Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ 
                                            display: '-webkit-box',
                                            overflow: 'hidden',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 3
                                        }}>
                                            {item.descripcion}
                                        </Typography>
                                    </Grid>

                                    {item.rutaFoto && (
                                        <Grid size={{xs:12}}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<ImageIcon />}
                                                onClick={() => onPreview?.(item.rutaFoto!)}
                                                fullWidth
                                                sx={{ 
                                                    mt: 1, 
                                                    borderColor: theme.palette.divider,
                                                    color: 'text.secondary',
                                                    justifyContent: 'flex-start'
                                                }}
                                            >
                                                Ver Evidencia
                                            </Button>
                                        </Grid>
                                    )}
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
