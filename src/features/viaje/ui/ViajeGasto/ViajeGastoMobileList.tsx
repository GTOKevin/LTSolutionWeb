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
    CalendarToday as CalendarIcon,
    LocalGasStation as GasIcon,
    AttachMoney as MoneyIcon,
    ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import { useState } from 'react';
import type { ViajeGasto } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { ROWS_PER_PAGE_OPTIONS } from '@/shared/constants/constantes';
import { formatDateShort } from '@/shared/utils/date-utils';

interface Props {
    items: ViajeGasto[];
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    viewOnly?: boolean;
    tiposGasto: SelectItem[];
    monedas: SelectItem[];
    onEdit?: (item: ViajeGasto) => void;
    onDelete?: (id: number) => void;
}

export function ViajeGastoMobileList({ 
    items, 
    total, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    viewOnly, 
    tiposGasto,
    monedas,
    onEdit, 
    onDelete 
}: Props) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedItem, setSelectedItem] = useState<ViajeGasto | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: ViajeGasto) => {
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
            onDelete(selectedItem.viajeGastoID);
        }
        handleMenuClose();
    };

    const getGastoColor = (text: string = '') => {
        const lower = text.toLowerCase();
        if (lower.includes('combustible')) return theme.palette.primary.main;
        if (lower.includes('peaje')) return theme.palette.success.main;
        if (lower.includes('viatico')) return theme.palette.warning.main;
        if (lower.includes('mantenimiento')) return theme.palette.error.main;
        return theme.palette.info.main;
    };

    const getGastoBg = (text: string = '') => {
        return alpha(getGastoColor(text), 0.1);
    };

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2} sx={{ mb: 2 }}>
                {items.map((item) => {
                    const tipo = tiposGasto.find(t => t.id === item.gastoID);
                    const moneda = monedas.find(m => m.id === item.monedaID);
                    const tipoText = tipo?.text || item.gasto?.descripcion || 'Otro';
                    const monedaSymbol = moneda?.extra || 'PEN';
                    
                    return (
                        <Card 
                            key={item.viajeGastoID} 
                            elevation={0} 
                            sx={{ 
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 3,
                                position: 'relative',
                                borderLeft: `4px solid ${getGastoColor(tipoText)}`
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                    <Box sx={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: 1,
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 1,
                                        bgcolor: getGastoBg(tipoText),
                                        color: getGastoColor(tipoText),
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase'
                                    }}>
                                        {tipoText}
                                    </Box>
                                    {!viewOnly && (
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => handleMenuOpen(e, item)}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid size={{xs:6}}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                            <CalendarIcon sx={{ fontSize: 16 }} />
                                            <Typography variant="caption">Fecha</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {formatDateShort(item.fechaGasto)}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{xs:6}}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                            <MoneyIcon sx={{ fontSize: 16 }} />
                                            <Typography variant="caption">Monto</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold" color="primary">
                                            {monedaSymbol} {Number(item.monto).toFixed(2)}
                                        </Typography>
                                    </Grid>

                                    {(item.numeroComprobante || item.comprobante) && (
                                        <Grid size={{xs:12}}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                                                <TicketIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption">Comprobante</Typography>
                                            </Box>
                                            <Typography variant="body2" fontFamily="monospace">
                                                {item.numeroComprobante || 'Sin número'}
                                            </Typography>
                                        </Grid>
                                    )}

                                    {item.combustible && (
                                        <Grid size={{xs:12}}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 1, 
                                                bgcolor: alpha(theme.palette.info.main, 0.05),
                                                p: 1,
                                                borderRadius: 1
                                            }}>
                                                <GasIcon sx={{ fontSize: 16, color: 'info.main' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Galones:
                                                </Typography>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {Number(item.galones).toFixed(2)}
                                                </Typography>
                                            </Box>
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
