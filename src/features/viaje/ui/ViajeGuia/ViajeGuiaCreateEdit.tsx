import { 
    Box, 
    Button, 
    Typography, 
    Paper, 
    TextField, 
    Grid, 
    useTheme,
    alpha,
    CircularProgress
} from '@mui/material';
import { 
    AddCircle as AddCircleIcon,
    Save as SaveIcon,
    Person as PersonIcon,
    LocalShipping as LocalShippingIcon,
    ListAlt as ListAltIcon,
    Edit as EditIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import type { CreateViajeGuiaDto, ViajeGuia } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { ImageUpload } from '@/shared/components/ui/ImageUpload';
import { useCreateViajeGuia, useUpdateViajeGuia } from '@/features/viaje/hooks/useViajeGuias';

interface Props {
    viajeId: number;
    tiposGuia: SelectItem[];
    guia?: ViajeGuia | null;
    onCancel?: () => void;
}

export function ViajeGuiaCreateEdit({ viajeId, tiposGuia, guia, onCancel }: Props) {
    const theme = useTheme();
    const createMutation = useCreateViajeGuia();
    const updateMutation = useUpdateViajeGuia();

    const [newItem, setNewItem] = useState<CreateViajeGuiaDto>({
        tipoGuiaID: 0,
        serie: '',
        numero: '',
        rutaArchivo: ''
    });

    const isEditing = !!guia;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (guia) {
            setNewItem({
                tipoGuiaID: guia.tipoGuiaID,
                serie: guia.serie,
                numero: guia.numero,
                rutaArchivo: guia.rutaArchivo || ''
            });
        } else {
            setNewItem({
                tipoGuiaID: 0,
                serie: '',
                numero: '',
                rutaArchivo: ''
            });
        }
    }, [guia]);

    const handleSave = async () => {
        if (!viajeId) return;
        if (!newItem.tipoGuiaID || !newItem.serie || !newItem.numero) return;

        try {
            if (isEditing && guia) {
                await updateMutation.mutateAsync({ 
                    id: guia.viajeGuiaID, 
                    data: newItem, 
                    viajeId 
                });
            } else {
                await createMutation.mutateAsync({ viajeId, data: newItem });
            }
            
            // Reset form
            setNewItem({
                tipoGuiaID: 0,
                serie: '',
                numero: '',
                rutaArchivo: ''
            });
            
            if (onCancel) onCancel();
        } catch (error) {
            console.error("Error saving guia:", error);
        }
    };

    const getGuideTypeIcon = (text: string) => {
        if (text.toLowerCase().includes('remitente')) return <PersonIcon fontSize="small" />;
        if (text.toLowerCase().includes('transportista')) return <LocalShippingIcon fontSize="small" />;
        return <ListAltIcon fontSize="small" />;
    };

    const getGuideTypeColor = (text: string) => {
        if (text.toLowerCase().includes('remitente')) return theme.palette.primary.main;
        if (text.toLowerCase().includes('transportista')) return theme.palette.success.main;
        return theme.palette.text.secondary;
    };

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 3, 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                bgcolor: 'background.paper'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: alpha(isEditing ? theme.palette.warning.main : theme.palette.primary.main, 0.1),
                        color: isEditing ? 'warning.main' : 'primary.main',
                        display: 'flex'
                    }}>
                        {isEditing ? <EditIcon fontSize="small" /> : <AddCircleIcon fontSize="small" />}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {isEditing ? "Editar Guía" : "Registro de Nueva Guía"}
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

            <Grid container spacing={4}>
                <Grid size={{xs:12, lg:6}}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Tipo de Guía */}
                        <Box>
                            <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
                                Tipo de Guía
                            </Typography>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    gap: 1, 
                                    p: 0.5, 
                                    bgcolor: alpha(theme.palette.background.default, 0.5), 
                                    borderRadius: 2 
                                }}
                            >
                                {tiposGuia.map((tipo) => {
                                    const isSelected = newItem.tipoGuiaID === tipo.id;
                                    const color = getGuideTypeColor(tipo.text);
                                    
                                    return (
                                        <Box 
                                            key={tipo.id}
                                            onClick={() => setNewItem({ ...newItem, tipoGuiaID: tipo.id })}
                                            sx={{
                                                flex: 1,
                                                cursor: 'pointer',
                                                py: 1.5,
                                                px: 2,
                                                borderRadius: 1.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1,
                                                bgcolor: isSelected ? 'background.paper' : 'transparent',
                                                color: isSelected ? color : 'text.secondary',
                                                boxShadow: isSelected ? theme.shadows[1] : 'none',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    color: isSelected ? color : 'text.primary'
                                                }
                                            }}
                                        >
                                            {getGuideTypeIcon(tipo.text)}
                                            <Typography variant="body2" fontWeight={isSelected ? 'bold' : 'medium'}>
                                                {tipo.text}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>

                        {/* Serie y Número */}
                        <Grid container spacing={2}>
                            <Grid size={{xs:4}}>
                                <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>
                                    Serie
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="T001"
                                    value={newItem.serie}
                                    onChange={(e) => setNewItem({ ...newItem, serie: e.target.value })}
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>
                            <Grid size={{xs:8}}>
                                <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>
                                    Número
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="00000000"
                                    value={newItem.numero}
                                    onChange={(e) => setNewItem({ ...newItem, numero: e.target.value })}
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            color={isEditing ? "warning" : "primary"}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={!newItem.tipoGuiaID || !newItem.serie || !newItem.numero || isLoading}
                            sx={{ 
                                mt: 1,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                boxShadow: `0 4px 12px ${alpha(isEditing ? theme.palette.warning.main : theme.palette.primary.main, 0.2)}`
                            }}
                        >
                            {isEditing ? "Guardar Cambios" : "Agregar Guía"}
                        </Button>
                    </Box>
                </Grid>

                <Grid size={{xs:12, lg:6}}>
                    <Box sx={{ height: '100%' }}>
                        <ImageUpload
                            value={newItem.rutaArchivo}
                            onChange={(path) => setNewItem({ ...newItem, rutaArchivo: path })}
                            label="Foto de la Guía"
                        />
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}
