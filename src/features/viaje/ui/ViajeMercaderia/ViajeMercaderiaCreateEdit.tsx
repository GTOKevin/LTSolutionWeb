import { 
    Box, Button, Typography, Paper, TextField, Grid, MenuItem,
    useTheme, alpha, InputAdornment, CircularProgress
} from '@mui/material';
import { 
    Add as AddIcon, 
    Save as SaveIcon,
    Close as CloseIcon,
    Straighten, 
    MonitorWeight, 
    Search as SearchIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import type { CreateViajeMercaderiaDto, ViajeMercaderia } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { useCreateViajeMercaderia, useUpdateViajeMercaderia } from '@/features/viaje/hooks/useViajeMercaderias';

interface Props {
    viajeId: number;
    tiposMedida: SelectItem[];
    tiposPeso: SelectItem[];
    mercaderias: SelectItem[];
    editItem: ViajeMercaderia | null;
    onCancelEdit: () => void;
}

export function ViajeMercaderiaCreateEdit({ 
    viajeId, tiposMedida, tiposPeso, mercaderias, editItem, onCancelEdit 
}: Props) {
    const theme = useTheme();
    const createMutation = useCreateViajeMercaderia();
    const updateMutation = useUpdateViajeMercaderia();

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

    useEffect(() => {
        if (editItem) {
            setNewItem({
                mercaderiaID: editItem.mercaderiaID,
                descripcion: editItem.descripcion || '',
                tipoMedidaID: editItem.tipoMedidaID,
                alto: editItem.alto || 0,
                largo: editItem.largo || 0,
                ancho: editItem.ancho || 0,
                tipoPesoID: editItem.tipoPesoID,
                peso: editItem.peso || 0
            });
            // Scroll to form if needed
            const formElement = document.getElementById('mercaderia-form');
            if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, [editItem]);

    const handleSave = async () => {
        if (!viajeId) return;
        // Validaciones básicas
        if (newItem.mercaderiaID === 0 && !newItem.descripcion) return;

        try {
            if (editItem) {
                await updateMutation.mutateAsync({ id: editItem.viajeMercaderiaID, data: newItem, viajeId });
                onCancelEdit();
            } else {
                await createMutation.mutateAsync({ viajeId, data: newItem });
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
        } catch (error) {
            console.error("Error saving mercaderia:", error);
        }
    };

    const handleCancel = () => {
        onCancelEdit();
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

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
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
                    {editItem ? 'Editar Mercadería' : 'Registro de Mercadería'}
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
                
                <Grid size={{xs:12,md:6}} display="flex" alignItems="end" alignSelf="flex-end" gap={1}>
                    {editItem && (
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
                        onClick={handleSave}
                        disabled={isPending}
                        startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : (editItem ? <SaveIcon /> : <AddIcon />)}
                        sx={{ 
                            height: 48, 
                            borderRadius: 2, 
                            boxShadow: theme.shadows[4],
                            fontWeight: 'bold'
                        }}
                    >
                        {isPending ? 'Guardando...' : (editItem ? 'Guardar' : 'Agregar')}
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
}
