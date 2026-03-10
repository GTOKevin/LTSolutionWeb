import { 
    Box, 
    Button, 
    IconButton, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Typography, 
    Paper, 
    TextField, 
    Grid, 
    MenuItem,
    useTheme,
    alpha,
    InputAdornment,
    Tooltip
} from '@mui/material';
import { 
    Add as AddIcon, 
    Delete as DeleteIcon, 
    Edit as EditIcon, 
    Straighten, 
    MonitorWeight, 
    Search as SearchIcon,
    Save as SaveIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import type { CreateViajeMercaderiaDto } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';

interface Props {
    viewOnly?: boolean;
    tiposMedida: SelectItem[];
    tiposPeso: SelectItem[];
    mercaderias: SelectItem[];
}

export function ViajeMercaderiaList({ viewOnly, tiposMedida, tiposPeso, mercaderias }: Props) {
    const theme = useTheme();
    const { control } = useFormContext();
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "viajeMercaderia"
    });

    const [editIndex, setEditIndex] = useState<number | null>(null);
    
    // Local state for new item form
    const [newItem, setNewItem] = useState<CreateViajeMercaderiaDto>({
        mercaderiaID: 0, 
        descripcion: '',
        tipoMedidaID: 0,
        alto: 0,
        largo: 0,
        ancho: 0,
        tipoPesoID: 0,
        peso: 0
    });

    const handleAdd = () => {
        // Validaciones básicas
        if (newItem.mercaderiaID === 0 && !newItem.descripcion) return;

        if (editIndex !== null) {
            update(editIndex, newItem);
            setEditIndex(null);
        } else {
            append(newItem);
        }
        
        // Reset form
        setNewItem({
            mercaderiaID: 0,
            descripcion: '',
            tipoMedidaID: 0,
            alto: 0,
            largo: 0,
            ancho: 0,
            tipoPesoID: 0,
            peso: 0
        });
    };

    const handleEdit = (index: number, item: any) => {
        setEditIndex(index);
        setNewItem(item);
        // Scroll to form if needed
        const formElement = document.getElementById('mercaderia-form');
        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditIndex(null);
        setNewItem({
            mercaderiaID: 0,
            descripcion: '',
            tipoMedidaID: 0,
            alto: 0,
            largo: 0,
            ancho: 0,
            tipoPesoID: 0,
            peso: 0
        });
    };

    // Calcular totales y máximos
    const totalPeso = fields.reduce((acc, item: any) => acc + (Number(item.peso) || 0), 0);
    // Calcular dimensiones máximas para la plataforma (Largo se suma, Ancho y Alto son máximos)
    const totalLargo = fields.reduce((acc, item: any) => acc + (Number(item.largo) || 0), 0);
    const maxAncho = fields.length > 0 ? Math.max(...fields.map((item: any) => Number(item.ancho) || 0)) : 0;
    const maxAlto = fields.length > 0 ? Math.max(...fields.map((item: any) => Number(item.alto) || 0)) : 0;

    return (
        <Box>
            {/* Formulario Compacto de Registro - Inline */}
            {!viewOnly && (
                <Paper 
                    id="mercaderia-form"
                    variant="outlined" 
                    sx={{ 
                        p: 3, 
                        mb: 4, 
                        borderRadius: 3, 
                        bgcolor: alpha(theme.palette.background.default, 0.4),
                        borderColor: theme.palette.divider
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <AddIcon color="primary" />
                        <Typography variant="h6" fontSize="1rem" fontWeight="bold">
                            {editIndex !== null ? 'Editar Mercadería' : 'Registro de Mercadería'}
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        {/* Fila 1: Producto, Descripción */}
                        <Grid size={{xs:12,md:4}}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                Producto
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={newItem.mercaderiaID}
                                onChange={(e) => {
                                    const id = Number(e.target.value);
                                    const selected = mercaderias.find(m => m.id === id);
                                    setNewItem({
                                        ...newItem, 
                                        mercaderiaID: id,
                                        descripcion: selected ? selected.text : newItem.descripcion
                                    });
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                    
                                }}
                            >
                                <MenuItem value={0} disabled sx={{ color: 'text.secondary' }}>Seleccionar producto...</MenuItem>
                                {mercaderias.map(m => (
                                    <MenuItem key={m.id} value={m.id}>{m.text}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{xs:12,md:8}}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                Descripción Detallada
                            </Typography>
                            <TextField 
                                fullWidth 
                                size="small"
                                placeholder="Ingrese especificaciones, marcas o modelos..."
                                value={newItem.descripcion} 
                                onChange={e => setNewItem({...newItem, descripcion: e.target.value})}
                            />
                        </Grid>

                        {/* Fila 2: Dimensiones y Peso */}
                        <Grid size={{xs:12,md:7}}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper' }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                                    <Straighten fontSize="inherit" /> Dimensiones
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <TextField
                                        placeholder="Largo"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={newItem.largo || ''}
                                        onChange={e => setNewItem({...newItem, largo: Number(e.target.value)})}
                                        InputProps={{ sx: { textAlign: 'center', '& input': { textAlign: 'center' } } }}
                                        variant="standard"
                                    />
                                    <Typography color="text.secondary" variant="caption">×</Typography>
                                    <TextField
                                        placeholder="Ancho"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={newItem.ancho || ''}
                                        onChange={e => setNewItem({...newItem, ancho: Number(e.target.value)})}
                                        InputProps={{ sx: { textAlign: 'center', '& input': { textAlign: 'center' } } }}
                                        variant="standard"
                                    />
                                    <Typography color="text.secondary" variant="caption">×</Typography>
                                    <TextField
                                        placeholder="Alto"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={newItem.alto || ''}
                                        onChange={e => setNewItem({...newItem, alto: Number(e.target.value)})}
                                        InputProps={{ sx: { textAlign: 'center', '& input': { textAlign: 'center' } } }}
                                        variant="standard"
                                    />
                                    <Box width={80}>
                                        <TextField
                                            select
                                            size="small"
                                            fullWidth
                                            value={newItem.tipoMedidaID}
                                            onChange={e => setNewItem({...newItem, tipoMedidaID: Number(e.target.value)})}
                                            variant="standard"
                                            InputProps={{ disableUnderline: true, sx: { fontWeight: 'bold', color: 'primary.main', textAlign: 'center', fontSize: '0.875rem' } }}
                                        >
                                            <MenuItem value={0} disabled>Unidad</MenuItem>
                                            {tiposMedida.map(t => (
                                                <MenuItem key={t.id} value={t.id}>{t.text}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid size={{xs:12,md:5}}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper' }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                                    <MonitorWeight fontSize="inherit" /> Peso Total
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <TextField
                                        placeholder="0.00"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={newItem.peso || ''}
                                        onChange={e => setNewItem({...newItem, peso: Number(e.target.value)})}
                                        variant="standard"
                                        InputProps={{ sx: { textAlign: 'right', '& input': { textAlign: 'right' } } }}
                                    />
                                    <Box width={60}>
                                        <TextField
                                            select
                                            size="small"
                                            fullWidth
                                            value={newItem.tipoPesoID}
                                            onChange={e => setNewItem({...newItem, tipoPesoID: Number(e.target.value)})}
                                            variant="standard"
                                            InputProps={{ disableUnderline: true, sx: { fontWeight: 'bold', color: 'primary.main', fontSize: '0.875rem' } }}
                                        >
                                            <MenuItem value={0} disabled>Unidad</MenuItem>
                                            {tiposPeso.map(t => (
                                                <MenuItem key={t.id} value={t.id}>{t.text}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        
                        <Grid size={{xs:12, md:6}} display="flex" alignItems="end" alignSelf="flex-end" gap={1}>
                            {editIndex !== null && (
                                <Button 
                                    variant="outlined" 
                                    color="inherit"
                                    onClick={handleCancel}
                                    fullWidth
                                    sx={{ height: 48, borderRadius: 2 }}
                                >
                                    <CloseIcon />
                                </Button>
                            )}
                            <Button 
                                variant="contained" 
                                color="primary" 
                                fullWidth 
                                onClick={handleAdd}
                                startIcon={editIndex !== null ? <SaveIcon /> : <AddIcon />}
                                sx={{ 
                                    height: 48, 
                                    borderRadius: 2, 
                                    boxShadow: theme.shadows[4],
                                    fontWeight: 'bold'
                                }}
                            >
                                {editIndex !== null ? 'Guardar' : 'Agregar'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Listado de Mercadería */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} px={1}>
                <Typography variant="subtitle1" fontWeight="bold">Ítems Registrados ({fields.length})</Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Descripción Principal</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Dimensiones (L x A x A)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Peso</TableCell>
                            {!viewOnly && <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map((item: any, index) => {
                            const medida = tiposMedida.find(t => t.id === item.tipoMedidaID)?.text || '';
                            const pesoUnit = tiposPeso.find(t => t.id === item.tipoPesoID)?.text || '';
                            const mercaderiaNombre = mercaderias.find(m => m.id === item.mercaderiaID)?.text;

                            return (
                                <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ py: 2 }}>
                                        <Box display="flex" flexDirection="column">
                                            <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                {item.descripcion || mercaderiaNombre || 'Sin descripción'}
                                            </Typography>
                                            {mercaderiaNombre && item.descripcion && item.descripcion !== mercaderiaNombre && (
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    Categoría: {mercaderiaNombre}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1} color="text.secondary" fontSize="0.875rem">
                                            <Box 
                                                component="span" 
                                                sx={{ 
                                                    bgcolor: alpha(theme.palette.background.default, 1), 
                                                    px: 1, 
                                                    py: 0.5, 
                                                    borderRadius: 1, 
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    color: 'text.primary'
                                                }}
                                            >
                                                {item.largo || 0} × {item.ancho || 0} × {item.alto || 0} {medida}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" fontWeight="600">
                                                {item.peso}
                                            </Typography>
                                            <Box 
                                                component="span" 
                                                sx={{ 
                                                    bgcolor: alpha(theme.palette.background.default, 1), 
                                                    px: 0.8, 
                                                    py: 0.3, 
                                                    borderRadius: 1, 
                                                    color: 'text.secondary',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'bold',
                                                    border: `1px solid ${theme.palette.divider}`
                                                }}
                                            >
                                                {pesoUnit}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    {!viewOnly && (
                                        <TableCell align="right" sx={{ py: 2 }}>
                                            <Box display="flex" justifyContent="flex-end" gap={1}>
                                                <Tooltip title="Editar">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleEdit(index, item)}
                                                        sx={{ 
                                                            color: 'text.secondary', 
                                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                            borderRadius: 2,
                                                            '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) } 
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton 
                                                        size="small" 
                                                        color="error" 
                                                        onClick={() => remove(index)}
                                                        sx={{ 
                                                            color: 'text.secondary', 
                                                            bgcolor: alpha(theme.palette.error.main, 0.05),
                                                            borderRadius: 2,
                                                            '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) } 
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                        {fields.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    <Typography variant="body2">No hay mercadería registrada</Typography>
                                    <Typography variant="caption">Complete el formulario superior para agregar ítems</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Footer Totales */}
            {fields.length > 0 && (
                <Box mt={3} display="flex" justifyContent="flex-end" flexWrap="wrap" gap={2}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            px: 3, 
                            py: 2, 
                            borderRadius: 3, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 3,
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                            borderColor: theme.palette.divider
                        }}
                    >
                        <Box display="flex" flexDirection="column">
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', lineHeight: 1, mb: 0.5 }}>
                                Dimensiones Carga (L x A x A)
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {totalLargo} x {maxAncho} x {maxAlto}
                            </Typography>
                        </Box>
                        <Box width="1px" height="32px" bgcolor="divider" />
                        <Box display="flex" flexDirection="column">
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', lineHeight: 1, mb: 0.5 }}>
                                Peso Total
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" color="primary.main">
                                {totalPeso.toFixed(2)} KG
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            )}
        </Box>
    );
}