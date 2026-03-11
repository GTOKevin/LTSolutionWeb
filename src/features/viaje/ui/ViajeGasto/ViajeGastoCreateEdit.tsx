import { 
    Box, Button, Typography, Paper, TextField, Grid, MenuItem, Checkbox, FormControlLabel,
    useTheme, alpha, CircularProgress
} from '@mui/material';
import { 
    AddCircle as AddCircleIcon, 
    Save as SaveIcon,
    Edit as EditIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import type { CreateViajeGastoDto, ViajeGasto } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { useCreateViajeGasto, useUpdateViajeGasto } from '@/features/viaje/hooks/useViajeGastos';

interface Props {
    viajeId: number;
    tiposGasto: SelectItem[];
    monedas: SelectItem[]; 
    gasto?: ViajeGasto | null;
    onCancel?: () => void;
}

export function ViajeGastoCreateEdit({ viajeId, tiposGasto, monedas, gasto, onCancel }: Props) {
    const theme = useTheme();
    const createMutation = useCreateViajeGasto();
    const updateMutation = useUpdateViajeGasto();

    const [newItem, setNewItem] = useState<CreateViajeGastoDto>({
        gastoID: 0,
        fechaGasto: new Date().toISOString().split('T')[0],
        monedaID: 1, // Default PEN
        monto: 0,
        comprobante: false,
        numeroComprobante: '',
        descripcion: ''
    });

    const isEditing = !!gasto;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (gasto) {
            setNewItem({
                gastoID: gasto.gastoID,
                fechaGasto: gasto.fechaGasto ? String(gasto.fechaGasto).split('T')[0] : new Date().toISOString().split('T')[0],
                monedaID: gasto.monedaID,
                monto: Number(gasto.monto),
                comprobante: gasto.comprobante,
                numeroComprobante: gasto.numeroComprobante || '',
                descripcion: gasto.descripcion || ''
            });
        } else {
            setNewItem({
                gastoID: 0,
                fechaGasto: new Date().toISOString().split('T')[0],
                monedaID: 1,
                monto: 0,
                comprobante: false,
                numeroComprobante: '',
                descripcion: ''
            });
        }
    }, [gasto]);

    const handleSave = async () => {
        if (!viajeId) return;
        if (!newItem.gastoID || !newItem.monto || !newItem.monedaID) return;

        try {
            if (isEditing && gasto) {
                await updateMutation.mutateAsync({ 
                    id: gasto.viajeGastoID, 
                    data: newItem, 
                    viajeId 
                });
            } else {
                await createMutation.mutateAsync({ viajeId, data: newItem });
            }
            
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
            
            if (onCancel) onCancel();
        } catch (error) {
            console.error("Error saving gasto:", error);
        }
    };

    return (
        <Paper 
            elevation={0}
            sx={{ 
                p: 3, 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.02)
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                        bgcolor: isEditing ? theme.palette.warning.main : theme.palette.primary.main, 
                        color: 'white', 
                        p: 0.5, 
                        borderRadius: '50%', 
                        display: 'flex' 
                    }}>
                        {isEditing ? <EditIcon fontSize="small" /> : <AddCircleIcon fontSize="small" />}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        {isEditing ? "Editar Gasto" : "Registro de Nuevo Gasto"}
                    </Typography>
                </Box>
                {isEditing && (
                    <Button 
                        size="small" 
                        color="inherit" 
                        onClick={onCancel}
                        startIcon={<CancelIcon />}
                    >
                        Cancelar Edición
                    </Button>
                )}
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
                        Moneda
                    </Typography>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        value={newItem.monedaID}
                        onChange={(e) => setNewItem({ ...newItem, monedaID: Number(e.target.value) })}
                        sx={{ bgcolor: 'background.paper' }}
                    >
                        {monedas.map((moneda) => (
                            <MenuItem key={moneda.id} value={moneda.id}>{moneda.text}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{xs:12, sm:6, md:3}}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                        Monto
                    </Typography>
                    <TextField
                        type="number"
                        fullWidth
                        size="small"
                        placeholder="0.00"
                        value={newItem.monto}
                        onChange={(e) => setNewItem({ ...newItem, monto: Number(e.target.value) })}
                        sx={{ bgcolor: 'background.paper' }}
                    />
                </Grid>

                <Grid size={{xs:12, md:3}}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                        Comprobante
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControlLabel
                            control={
                                <Checkbox 
                                    checked={newItem.comprobante} 
                                    onChange={(e) => setNewItem({ ...newItem, comprobante: e.target.checked })}
                                    size="small"
                                />
                            }
                            label={<Typography variant="body2">¿Tiene comprobante?</Typography>}
                        />
                        {newItem.comprobante && (
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="N° Comprobante"
                                value={newItem.numeroComprobante}
                                onChange={(e) => setNewItem({ ...newItem, numeroComprobante: e.target.value })}
                                sx={{ bgcolor: 'background.paper' }}
                            />
                        )}
                    </Box>
                </Grid>

                <Grid size={{xs:12, sm:6}}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                        Descripción (Opcional)
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
                
                <Grid size={{xs:12}} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                        variant="contained"
                        color={isEditing ? "warning" : "primary"}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={!newItem.gastoID || !newItem.monto || !newItem.monedaID || isLoading}
                        sx={{ 
                            px: 4,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: theme.shadows[2]
                        }}
                    >
                        {isEditing ? "Guardar Cambios" : "Registrar Gasto"}
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
}
