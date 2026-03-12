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
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ViajeGuia } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { ImageUpload } from '@/shared/components/ui/ImageUpload';
import { useCreateViajeGuia, useUpdateViajeGuia } from '@/features/viaje/hooks/useViajeGuias';
import { viajeGuiaSchema, type ViajeGuiaFormData } from '../../model/schema';

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

    const isEditing = !!guia;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<ViajeGuiaFormData>({
        resolver: zodResolver(viajeGuiaSchema),
        defaultValues: {
            tipoGuiaID: 0,
            serie: '',
            numero: '',
            rutaArchivo: ''
        }
    });

    const tipoGuiaID = watch('tipoGuiaID');

    useEffect(() => {
        if (guia) {
            reset({
                tipoGuiaID: guia.tipoGuiaID,
                serie: guia.serie,
                numero: guia.numero,
                rutaArchivo: guia.rutaArchivo || ''
            });
        } else {
            reset({
                tipoGuiaID: 0,
                serie: '',
                numero: '',
                rutaArchivo: ''
            });
        }
    }, [guia, reset]);

    const onSubmit = async (data: ViajeGuiaFormData) => {
        if (!viajeId) return;

        try {
            // Transform undefined/empty optional fields if necessary (though schema handles validation)
            const payload = {
                ...data,
                rutaArchivo: data.rutaArchivo || undefined
            };

            if (isEditing && guia) {
                await updateMutation.mutateAsync({ 
                    id: guia.viajeGuiaID, 
                    data: payload, 
                    viajeId 
                });
            } else {
                await createMutation.mutateAsync({ viajeId, data: payload });
            }
            
            reset({
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
                bgcolor: alpha(isEditing ? theme.palette.warning.main : theme.palette.primary.main, 0.02)
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                        p: 0.5, 
                        borderRadius: '50%', 
                        bgcolor: isEditing ? theme.palette.warning.main : theme.palette.primary.main,
                        color: 'white',
                        display: 'flex'
                    }}>
                        {isEditing ? <EditIcon fontSize="small" /> : <AddCircleIcon fontSize="small" />}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {isEditing ? "Editar Guía" : "Agregar Guía"}
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
                            <Controller
                                name="tipoGuiaID"
                                control={control}
                                render={({ field }) => (
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            gap: 1, 
                                            p: 0.5, 
                                            bgcolor: alpha(theme.palette.background.default, 0.5), 
                                            borderRadius: 2,
                                            border: errors.tipoGuiaID ? `1px solid ${theme.palette.error.main}` : 'none'
                                        }}
                                    >
                                        {tiposGuia.map((tipo) => {
                                            const isSelected = field.value === tipo.id;
                                            const color = getGuideTypeColor(tipo.text);
                                            
                                            return (
                                                <Box 
                                                    key={tipo.id}
                                                    onClick={() => field.onChange(tipo.id)}
                                                    sx={{
                                                        flex: 1,
                                                        p: 1.5,
                                                        borderRadius: 1.5,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: 0.5,
                                                        transition: 'all 0.2s',
                                                        bgcolor: isSelected ? alpha(color, 0.1) : 'transparent',
                                                        border: `1px solid ${isSelected ? color : 'transparent'}`,
                                                        '&:hover': {
                                                            bgcolor: alpha(color, 0.05)
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ color: isSelected ? color : 'text.secondary' }}>
                                                        {getGuideTypeIcon(tipo.text)}
                                                    </Box>
                                                    <Typography 
                                                        variant="caption" 
                                                        fontWeight={isSelected ? "bold" : "medium"}
                                                        color={isSelected ? color : 'text.secondary'}
                                                        align="center"
                                                        sx={{ lineHeight: 1.2 }}
                                                    >
                                                        {tipo.text.replace('GUIA', '').trim()}
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}
                            />
                            {errors.tipoGuiaID && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                    {errors.tipoGuiaID.message}
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Controller
                                name="serie"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Serie"
                                        placeholder="001"
                                        fullWidth
                                        size="small"
                                        error={!!errors.serie}
                                        helperText={errors.serie?.message}
                                        sx={{ flex: 1 }}
                                    />
                                )}
                            />
                            <Controller
                                name="numero"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Número"
                                        placeholder="000123"
                                        fullWidth
                                        size="small"
                                        error={!!errors.numero}
                                        helperText={errors.numero?.message}
                                        sx={{ flex: 2 }}
                                    />
                                )}
                            />
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{xs:12, lg:6}}>
                    <Box sx={{ height: '100%' }}>
                        <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
                            Documento Escaneado (Opcional)
                        </Typography>
                        <Controller
                            name="rutaArchivo"
                            control={control}
                            render={({ field }) => (
                                <ImageUpload
                                    value={field.value || undefined}
                                    onChange={(base64) => field.onChange(base64)}
                                    label="Documento / Guía (Imagen o PDF)"
                                />
                            )}
                        />
                    </Box>
                </Grid>

                <Grid size={{xs:12}}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
                        <Button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            variant="contained"
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            disabled={isLoading}
                            sx={{ 
                                px: 4,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            {isEditing ? "Actualizar Guía" : "Guardar Guía"}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}