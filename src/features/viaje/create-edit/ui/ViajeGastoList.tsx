import { 
    Box, Button, IconButton, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Typography, Paper, TextField, Grid, MenuItem, Checkbox, FormControlLabel,
    useTheme, alpha, Card, CardContent, Divider, useMediaQuery
} from '@mui/material';
import { 
    AddCircle as AddCircleIcon, 
    Delete as DeleteIcon, 
    Edit as EditIcon,
    ReceiptLong as ReceiptIcon,
    CalendarToday as CalendarIcon,
    ConfirmationNumber as TicketIcon,
    AttachMoney as MoneyIcon,
    Save as SaveIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import type { CreateViajeGastoDto } from '@/entities/viaje/model/types';
import type{ SelectItem } from '@/shared/model/types';

interface Props {
    viewOnly?: boolean;
    tiposGasto: SelectItem[];
    monedas: SelectItem[]; 
}

export function ViajeGastoList({ viewOnly, tiposGasto, monedas }: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "viajeGastos"
    });

    const [newItem, setNewItem] = useState<CreateViajeGastoDto>({
        gastoID: 0,
        fechaGasto: new Date().toISOString().split('T')[0],
        monedaID: 1, // Default PEN
        monto: 0,
        comprobante: false,
        numeroComprobante: '',
        descripcion: ''
    });

    const handleAdd = () => {
        if (!newItem.gastoID || !newItem.monto || !newItem.monedaID) return;
        append(newItem);
        // Reset form but keep defaults
        setNewItem({
            gastoID: 0,
            fechaGasto: new Date().toISOString().split('T')[0],
            monedaID: 1,
            monto: 0,
            comprobante: false,
            numeroComprobante: '',
            descripcion: ''
        });
    };

    // Calculate totals
    const totalPEN = fields.reduce((acc, item: any) => {
        const moneda = monedas.find(m => m.id === item.monedaID);
        return acc + (moneda?.extra === 'PEN' || item.monedaID === 1 ? Number(item.monto) : 0);
    }, 0);

    const totalUSD = fields.reduce((acc, item: any) => {
        const moneda = monedas.find(m => m.id === item.monedaID);
        return acc + (moneda?.extra === 'USD' || item.monedaID === 2 ? Number(item.monto) : 0);
    }, 0);

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: isMobile ? 10 : 0 }}>
            {/* Inline Form Section */}
            {!viewOnly && (
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <Box sx={{ 
                            bgcolor: theme.palette.primary.main, 
                            color: 'white', 
                            p: 0.5, 
                            borderRadius: '50%', 
                            display: 'flex' 
                        }}>
                            <AddCircleIcon fontSize="small" />
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                            Registro de Nuevo Gasto
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                Tipo de Gasto
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={newItem.gastoID}
                                onChange={(e) => setNewItem({ ...newItem, gastoID: Number(e.target.value) })}
                                SelectProps={{ displayEmpty: true }}
                                sx={{ bgcolor: 'background.paper' }}
                            >
                                <MenuItem value={0} disabled>Seleccione tipo</MenuItem>
                                {tiposGasto.map((tipo) => (
                                    <MenuItem key={tipo.id} value={tipo.id}>{tipo.text}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{xs:12, sm:6, md:3}}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                Fecha Gasto
                            </Typography>
                            <TextField
                                type="date"
                                fullWidth
                                size="small"
                                value={newItem.fechaGasto}
                                onChange={(e) => setNewItem({ ...newItem, fechaGasto: e.target.value })}
                                sx={{ bgcolor: 'background.paper' }}
                            />
                        </Grid>

                        <Grid size={{xs:12, md:3}}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                Moneda y Monto
                            </Typography>
                            <Box sx={{ display: 'flex', borderRadius: 1, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                                <TextField
                                    select
                                    size="small"
                                    value={newItem.monedaID}
                                    onChange={(e) => setNewItem({ ...newItem, monedaID: Number(e.target.value) })}
                                    sx={{ 
                                        width: 80, 
                                        bgcolor: alpha(theme.palette.action.hover, 0.5),
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                                    }}
                                >
                                    {monedas.map((moneda) => (
                                        <MenuItem key={moneda.id} value={moneda.id}>{moneda.text}</MenuItem>
                                    ))}
                                </TextField>
                                <Divider orientation="vertical" flexItem />
                                <TextField
                                    type="number"
                                    fullWidth
                                    size="small"
                                    placeholder="0.00"
                                    value={newItem.monto === 0 ? '' : newItem.monto}
                                    onChange={(e) => setNewItem({ ...newItem, monto: Number(e.target.value) })}
                                    sx={{ 
                                        bgcolor: 'background.paper',
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                                    }}
                                />
                            </Box>
                        </Grid>

                        <Grid size={{xs:12, md:3}}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                ¿Tiene Comprobante?
                            </Typography>
                            <Box sx={{ display: 'flex', height: 40, alignItems: 'center' }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox 
                                            checked={newItem.comprobante}
                                            onChange={(e) => setNewItem({ ...newItem, comprobante: e.target.checked })}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2" color="text.secondary">Sí, incluir número</Typography>}
                                />
                            </Box>
                        </Grid>

                        {newItem.comprobante && (
                            <Grid size={{xs:12, md:3}}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                    Número de Comprobante
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Ejem: F001-00123"
                                    value={newItem.numeroComprobante}
                                    onChange={(e) => setNewItem({ ...newItem, numeroComprobante: e.target.value })}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                            </Grid>
                        )}

                        <Grid size={{xs:12, md:newItem.comprobante ? 6 : 9}}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                Descripción / Observaciones
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Detalles adicionales..."
                                value={newItem.descripcion}
                                onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })}
                                sx={{ bgcolor: 'background.paper' }}
                            />
                        </Grid>

                        <Grid size={{xs:12, md:3}} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <Button 
                                fullWidth
                                variant="contained" 
                                onClick={handleAdd}
                                startIcon={<SaveIcon />}
                                disabled={!newItem.gastoID || !newItem.monto}
                                sx={{ 
                                    height: 40, 
                                    textTransform: 'none', 
                                    fontWeight: 'bold',
                                    borderRadius: 2,
                                    boxShadow: theme.shadows[2]
                                }}
                            >
                                Registrar Gasto
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon color="action" />
                    <Typography variant="subtitle1" fontWeight="bold">
                        Gastos Registrados
                    </Typography>
                </Box>
                <Box sx={{ 
                    px: 1.5, py: 0.5, 
                    borderRadius: 1, 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                }}>
                    Total: {fields.length} registros
                </Box>
            </Box>

            {/* Desktop Table View */}
            {!isMobile ? (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}
                >
                    <Table size="small">
                        <TableHead sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tipo de Gasto</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Fecha Gasto</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Comprobante</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Monto</TableCell>
                                {!viewOnly && <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Acciones</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fields.map((item: any, index) => {
                                const tipo = tiposGasto.find(t => t.id === item.gastoID);
                                const moneda = monedas.find(m => m.id === item.monedaID);
                                const tipoText = tipo?.text || 'Otro';
                                
                                return (
                                    <TableRow key={item.id} hover>
                                        <TableCell>
                                            <Box sx={{ 
                                                display: 'inline-block',
                                                px: 1.5, py: 0.5, 
                                                borderRadius: 1, 
                                                bgcolor: getGastoBg(tipoText),
                                                color: getGastoColor(tipoText),
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {tipoText}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                            {item.fechaGasto}
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>
                                            {item.comprobante ? item.numeroComprobante : 'Sin comprobante'}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                            {moneda?.extra || 'PEN'} {Number(item.monto).toFixed(2)}
                                        </TableCell>
                                        {!viewOnly && (
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                    <IconButton 
                                                        size="small" 
                                                        color="error" 
                                                        onClick={() => remove(index)}
                                                        sx={{ 
                                                            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                                            bgcolor: alpha(theme.palette.error.main, 0.05)
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                            {fields.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No hay gastos registrados
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        
                        {/* Summary Footer for Desktop */}
                        {fields.length > 0 && (
                            <TableBody>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                                    <TableCell colSpan={3} align="right">
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                            Total Gastos
                                        </Typography>
                                    </TableCell>
                                    <TableCell colSpan={2}>
                                        <Box sx={{ display: 'flex', gap: 3 }}>
                                            <Box>
                                                <Typography variant="caption" display="block" color="text.secondary" fontWeight="bold">PEN</Typography>
                                                <Typography variant="subtitle2" fontWeight="bold">S/ {totalPEN.toFixed(2)}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" display="block" color="text.secondary" fontWeight="bold">USD</Typography>
                                                <Typography variant="subtitle2" fontWeight="bold">$ {totalUSD.toFixed(2)}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>
                </Paper>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {fields.map((item: any, index) => {
                        const tipo = tiposGasto.find(t => t.id === item.gastoID);
                        const moneda = monedas.find(m => m.id === item.monedaID);
                        const tipoText = tipo?.text || 'Otro';
                        
                        return (
                            <Card key={item.id} elevation={0} sx={{ 
                                borderRadius: 3, 
                                border: `1px solid ${theme.palette.divider}`,
                                borderLeft: `4px solid ${getGastoColor(tipoText)}`
                            }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box sx={{ 
                                            px: 1.5, py: 0.5, 
                                            borderRadius: 1, 
                                            bgcolor: getGastoBg(tipoText),
                                            color: getGastoColor(tipoText),
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}>
                                            {tipoText}
                                        </Box>
                                        {!viewOnly && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton 
                                                    size="small" 
                                                    color="error" 
                                                    onClick={() => remove(index)}
                                                    sx={{ 
                                                        p: 0.5,
                                                        bgcolor: alpha(theme.palette.error.main, 0.05),
                                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                <CalendarIcon sx={{ fontSize: 14 }} />
                                                <Typography variant="caption">{item.fechaGasto}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                <TicketIcon sx={{ fontSize: 14 }} />
                                                <Typography variant="caption">
                                                    {item.comprobante ? item.numeroComprobante : 'S/C'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="subtitle1" fontWeight="900">
                                            {moneda?.extra || 'PEN'} {Number(item.monto).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                    {fields.length === 0 && (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                            No hay gastos registrados
                        </Typography>
                    )}
                </Box>
            )}

            {/* Mobile Fixed Summary Bar */}
            {isMobile && fields.length > 0 && (
                <Paper 
                    elevation={4}
                    sx={{ 
                        position: 'fixed', 
                        bottom: 16, 
                        left: 16, 
                        right: 16, 
                        zIndex: 1000,
                        bgcolor: theme.palette.primary.main,
                        color: 'primary.contrastText',
                        borderRadius: 3,
                        p: 2
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold', letterSpacing: 1 }}>TOTAL (PEN)</Typography>
                            <Typography variant="h6" fontWeight="900">S/ {totalPEN.toFixed(2)}</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold', letterSpacing: 1 }}>TOTAL (USD)</Typography>
                            <Typography variant="subtitle1" fontWeight="bold">$ {totalUSD.toFixed(2)}</Typography>
                        </Box>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}