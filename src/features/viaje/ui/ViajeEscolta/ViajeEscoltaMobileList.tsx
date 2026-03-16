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
    Chip
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    MoreVert as MoreVertIcon,
    Person as PersonIcon,
    DirectionsCar as CarIcon,
    Security as SecurityIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import { useState } from 'react';
import type { ViajeEscolta } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';

interface Props {
    items: ViajeEscolta[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    flotas: SelectItem[];
    colaboradores: SelectItem[];
    onEdit?: (item: ViajeEscolta) => void;
    onDelete?: (id: number) => void;
}

export function ViajeEscoltaMobileList({ 
    items, 
    total, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    viewOnly, 
    flotas,
    colaboradores,
    onEdit, 
    onDelete 
}: Props) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState<ViajeEscolta | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: ViajeEscolta) => {
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
            onDelete(selectedItem.viajeEscoltaID);
        }
        handleMenuClose();
    };

    const getEscoltaInfo = (item: ViajeEscolta) => {
        if (item.tercero) {
            return {
                tipo: 'Tercero',
                conductor: item.nombreConductor || '-',
                vehiculo: item.empresa || '-' 
            };
        }
        const flota = flotas.find(f => f.id === item.flotaID)?.text || item.flota?.placa || '-';
        const colab = colaboradores.find(c => c.id === item.colaboradorID)?.text || item.colaborador?.nombres || '-';
        return {
            tipo: 'Propio',
            conductor: colab,
            vehiculo: flota
        };
    };

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {items.map((item) => {
                    const info = getEscoltaInfo(item);
                    const isPropio = info.tipo === 'Propio';
                    
                    return (
                        <Card 
                            key={item.viajeEscoltaID} 
                            elevation={0} 
                            sx={{ 
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 3,
                                position: 'relative',
                                borderLeft: `4px solid ${isPropio ? theme.palette.primary.main : theme.palette.warning.main}`
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                    <Chip 
                                        label={info.tipo} 
                                        size="small" 
                                        icon={<SecurityIcon sx={{ fontSize: '1rem !important' }} />}
                                        sx={{ 
                                            height: 24,
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            bgcolor: isPropio ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                                            color: isPropio ? 'primary.main' : 'warning.main',
                                            border: `1px solid ${isPropio ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.warning.main, 0.2)}`
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
                                            <PersonIcon sx={{ fontSize: 16 }} />
                                            <Typography variant="caption">Conductor / Personal</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {info.conductor}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{xs:12}}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                            {isPropio ? <CarIcon sx={{ fontSize: 16 }} /> : <BusinessIcon sx={{ fontSize: 16 }} />}
                                            <Typography variant="caption">
                                                {isPropio ? 'Vehículo' : 'Empresa'}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2">
                                            {info.vehiculo}
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
