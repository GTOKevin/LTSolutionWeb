import { 
    Box, Button, TextField, MenuItem, FormControlLabel, Switch,
    Paper, Typography, Grid, useTheme, alpha, CircularProgress
} from '@mui/material';
import { 
    Save as SaveIcon,
    Edit as EditIcon,
    Cancel as CancelIcon,
    Security as SecurityIcon,
    AddCircle as AddCircleIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import type { CreateViajeEscoltaDto, ViajeEscolta } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { useCreateViajeEscolta, useUpdateViajeEscolta } from '@/features/viaje/hooks/useViajeEscoltas';

interface Props {
    viajeId: number;
    flotas: SelectItem[];
    colaboradores: SelectItem[];
    escolta?: ViajeEscolta | null;
    onCancel?: () => void;
}

export function ViajeEscoltaCreateEdit({ viajeId, flotas, colaboradores, escolta, onCancel }: Props) {
    const theme = useTheme();
    const createMutation = useCreateViajeEscolta();
    const updateMutation = useUpdateViajeEscolta();

    const [newItem, setNewItem] = useState<CreateViajeEscoltaDto>({
        tercero: false,
        flotaID: 0,
        colaboradorID: 0,
        nombreConductor: '',
        empresa: ''
    });

    const isEditing = !!escolta;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (escolta) {
            setNewItem({
                tercero: escolta.tercero ?? false,
                flotaID: escolta.flotaID || 0,
                colaboradorID: escolta.colaboradorID || 0,
                nombreConductor: escolta.nombreConductor || '',
                empresa: escolta.empresa || ''
            });
        } else {
            setNewItem({
                tercero: false,
                flotaID: 0,
                colaboradorID: 0,
                nombreConductor: '',
                empresa: ''
            });
        }
    }, [escolta]);

    const handleSave = async () => {
        if (!viajeId) return;
        
        // Basic validation
        if (newItem.tercero) {
            if (!newItem.nombreConductor || !newItem.empresa) return;
        } else {
            if (!newItem.flotaID && !newItem.colaboradorID) return;
        }

        try {
            if (isEditing && escolta) {
                await updateMutation.mutateAsync({ 
                    id: escolta.viajeEscoltaID, 
                    data: newItem, 
                    viajeId 
                });
            } else {
                await createMutation.mutateAsync({ viajeId, data: newItem });
            }
            
            // Reset form
            setNewItem({
                tercero: false,
                flotaID: 0,
                colaboradorID: 0,
                nombreConductor: '',
                empresa: ''
            });
            
            if (onCancel) onCancel();
        } catch (error) {
            console.error("Error saving escolta:", error);
        }
    };

    return (
        <Paper 
            elevation={0}
            sx={{ 
                p: 3, 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(isEditing ? theme.palette.warning.main : theme.palette.primary.main, 0.02)
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
                        {isEditing ? "Editar Escolta" : "Asignar Escolta"}
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
                <Grid size={12}>
                    <FormControlLabel
                        control={
                            <Switch 
                                checked={!!newItem.tercero} 
                                onChange={e => setNewItem({ ...newItem, tercero: e.target.checked })} 
                            />
                        }
                        label={<Typography variant="body2" fontWeight="bold">Es Servicio Tercero</Typography>}
                    />
                </Grid>

                {!newItem.tercero ? (
                    <>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                Vehículo Escolta
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={newItem.flotaID || 0}
                                onChange={e => setNewItem({...newItem, flotaID: Number(e.target.value)})}
                                sx={{ bgcolor: 'background.paper' }}
                            >
                                <MenuItem value={0}>Seleccione</MenuItem>
                                {flotas.map(f => (
                                    <MenuItem key={f.id} value={f.id}>{f.text}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                Personal de Seguridad
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={newItem.colaboradorID || 0}
                                onChange={e => setNewItem({...newItem, colaboradorID: Number(e.target.value)})}
                                sx={{ bgcolor: 'background.paper' }}
                            >
                                <MenuItem value={0}>Seleccione</MenuItem>
                                {colaboradores.map(c => (
                                    <MenuItem key={c.id} value={c.id}>{c.text}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </>
                ) : (
                    <>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                Nombre Conductor / Personal
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={newItem.nombreConductor}
                                onChange={e => setNewItem({...newItem, nombreConductor: e.target.value})}
                                sx={{ bgcolor: 'background.paper' }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                                Empresa
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={newItem.empresa}
                                onChange={e => setNewItem({...newItem, empresa: e.target.value})}
                                sx={{ bgcolor: 'background.paper' }}
                            />
                        </Grid>
                    </>
                )}

                <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                        variant="contained"
                        color={isEditing ? "warning" : "primary"}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={
                            isLoading || 
                            (newItem.tercero ? (!newItem.nombreConductor || !newItem.empresa) : (!newItem.flotaID && !newItem.colaboradorID))
                        }
                        sx={{ 
                            px: 4,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: theme.shadows[2]
                        }}
                    >
                        {isEditing ? "Guardar Cambios" : "Asignar Escolta"}
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
}
