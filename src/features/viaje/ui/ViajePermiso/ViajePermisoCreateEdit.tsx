import { 
    Box, Button, Typography, Paper, TextField, Grid,
    useTheme, alpha, CircularProgress
} from '@mui/material';
import { 
    Save as SaveIcon,
    Edit as EditIcon,
    Cancel as CancelIcon,
    AddCircle as AddCircleIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import type { CreateViajePermisoDto, ViajePermiso } from '@/entities/viaje/model/types';
import { ImageUpload } from '@/shared/components/ui/ImageUpload';
import { useCreateViajePermiso, useUpdateViajePermiso } from '@/features/viaje/hooks/useViajePermisos';

interface Props {
    viajeId: number;
    permiso?: ViajePermiso | null;
    onCancel?: () => void;
}

export function ViajePermisoCreateEdit({ viajeId, permiso, onCancel }: Props) {
    const theme = useTheme();
    const createMutation = useCreateViajePermiso();
    const updateMutation = useUpdateViajePermiso();

    const [newItem, setNewItem] = useState<CreateViajePermisoDto>({
        fechaVigencia: new Date().toISOString().split('T')[0],
        fechaVencimiento: undefined,
        rutaArchivo: ''
    });

    // Local state for dates to handle nulls properly
    const [fechaVigencia, setFechaVigencia] = useState(new Date().toISOString().split('T')[0]);
    const [fechaVencimiento, setFechaVencimiento] = useState('');

    const isEditing = !!permiso;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (permiso) {
            setNewItem({
                fechaVigencia: permiso.fechaVigencia,
                fechaVencimiento: permiso.fechaVencimiento ?? undefined,
                rutaArchivo: permiso.rutaArchivo || ''
            });
            setFechaVigencia(String(permiso.fechaVigencia));
            setFechaVencimiento(permiso.fechaVencimiento ? String(permiso.fechaVencimiento) : '');
        } else {
            const today = new Date().toISOString().split('T')[0];
            setNewItem({
                fechaVigencia: today,
                fechaVencimiento: undefined,
                rutaArchivo: ''
            });
            setFechaVigencia(today);
            setFechaVencimiento('');
        }
    }, [permiso]);

    useEffect(() => {
        setNewItem(prev => ({
            ...prev,
            fechaVigencia: fechaVigencia,
            fechaVencimiento: fechaVencimiento ? fechaVencimiento : undefined
        }));
    }, [fechaVigencia, fechaVencimiento]);

    const handleSave = async () => {
        if (!viajeId) return;
        if (!newItem.fechaVigencia) return;

        try {
            if (isEditing && permiso) {
                await updateMutation.mutateAsync({ 
                    id: permiso.viajePermisoID, 
                    data: newItem, 
                    viajeId 
                });
            } else {
                await createMutation.mutateAsync({ viajeId, data: newItem });
            }
            
            // Reset form
            const today = new Date().toISOString().split('T')[0];
            setFechaVigencia(today);
            setFechaVencimiento('');
            setNewItem({
                fechaVigencia: today,
                fechaVencimiento: undefined,
                rutaArchivo: ''
            });
            
            if (onCancel) onCancel();
        } catch (error) {
            console.error("Error saving permiso:", error);
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
                        {isEditing ? "Editar Permiso" : "Agregar Permiso"}
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

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Fecha Vigencia"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={fechaVigencia}
                            onChange={e => setFechaVigencia(e.target.value)}
                            sx={{ bgcolor: 'background.paper' }}
                        />
                        <TextField
                            label="Fecha Vencimiento"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={fechaVencimiento}
                            onChange={e => setFechaVencimiento(e.target.value)}
                            sx={{ bgcolor: 'background.paper' }}
                        />
                        
                        <Button
                            variant="contained"
                            color={isEditing ? "warning" : "primary"}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={!newItem.fechaVigencia || isLoading}
                            sx={{ 
                                mt: 2,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                boxShadow: theme.shadows[2]
                            }}
                        >
                            {isEditing ? "Guardar Cambios" : "Agregar Permiso"}
                        </Button>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ height: '100%' }}>
                        <ImageUpload
                            value={newItem.rutaArchivo}
                            onChange={(path) => setNewItem({ ...newItem, rutaArchivo: path })}
                            label="Documento / Permiso (Imagen o PDF)"
                        />
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}
