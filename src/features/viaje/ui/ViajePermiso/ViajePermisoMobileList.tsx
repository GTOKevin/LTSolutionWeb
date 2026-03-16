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
    Grid,
    Button
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    MoreVert as MoreVertIcon,
    CalendarToday as CalendarIcon,
    EventBusy as ExpiryIcon,
    Visibility as VisibilityIcon,
    VerifiedUser as PermitIcon
} from '@mui/icons-material';
import { useState } from 'react';
import type { ViajePermiso } from '@/entities/viaje/model/types';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import { formatDateShort } from '@/shared/utils/date-utils';

interface Props {
    items: ViajePermiso[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    onEdit?: (item: ViajePermiso) => void;
    onDelete?: (id: number) => void;
    onPreview?: (path: string) => void;
}

export function ViajePermisoMobileList({ 
    items, 
    total, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    viewOnly, 
    onEdit, 
    onDelete,
    onPreview
}: Props) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState<ViajePermiso | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: ViajePermiso) => {
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
            onDelete(selectedItem.viajePermisoID);
        }
        handleMenuClose();
    };

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {items.map((item) => (
                    <Card 
                        key={item.viajePermisoID} 
                        elevation={0} 
                        sx={{ 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 3,
                            position: 'relative'
                        }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ 
                                        p: 0.5, 
                                        borderRadius: 1, 
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <PermitIcon fontSize="small" />
                                    </Box>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        Permiso de Viaje
                                    </Typography>
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
                                        <CalendarIcon sx={{ fontSize: 16 }} />
                                        <Typography variant="caption">Vigencia</Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        {formatDateShort(item.fechaVigencia)}
                                    </Typography>
                                </Grid>
                                <Grid size={{xs:6}}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                        <ExpiryIcon sx={{ fontSize: 16 }} />
                                        <Typography variant="caption">Vencimiento</Typography>
                                    </Box>
                                    <Typography variant="body2" color={item.fechaVencimiento ? 'text.primary' : 'text.disabled'}>
                                        {item.fechaVencimiento ? formatDateShort(item.fechaVencimiento) : '-'}
                                    </Typography>
                                </Grid>

                                {item.rutaArchivo && (
                                    <Grid size={{xs:12}}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => onPreview?.(item.rutaArchivo!)}
                                            fullWidth
                                            sx={{ 
                                                mt: 1, 
                                                borderColor: theme.palette.divider,
                                                color: 'text.secondary',
                                                justifyContent: 'flex-start'
                                            }}
                                        >
                                            Ver Documento
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                ))}
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
