import { logger } from '@/shared/utils/logger';
import { 
    Box, Button, Typography, Paper, TextField, Grid,
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
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ViajeMercaderia } from '@/entities/viaje/model/types';
import type { SelectItem } from '@/shared/model/types';
import { useCreateViajeMercaderia, useUpdateViajeMercaderia } from '@/features/viaje/hooks/useViajeMercaderias';
import { viajeMercaderiaSchema, type ViajeMercaderiaFormData } from '../../model/schema';
import { handleAddressKeyDown } from '@/shared/utils/input-validators';
import { SubFormHeader } from '@/shared/components/ui/SubFormHeader';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { handleBackendErrors } from '@/shared/utils/form-validation';

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

    const isEditing = !!editItem;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm<ViajeMercaderiaFormData>({
        resolver: zodResolver(viajeMercaderiaSchema),
        defaultValues: {
            mercaderiaID: 0, 
            descripcion: '',
            tipoMedidaID: 0,
            alto: 0,
            largo: 0,
            ancho: 0,
            tipoPesoID: 0,
            peso: 0
        }
    });

    useEffect(() => {
        if (editItem) {
            reset({
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
        } else {
            reset({
                mercaderiaID: 0, 
                descripcion: '',
                tipoMedidaID: 0,
                alto: 0,
                largo: 0,
                ancho: 0,
                tipoPesoID: 0,
                peso: 0
            });
        }
    }, [editItem, reset]);

    const onSubmit = async (data: ViajeMercaderiaFormData) => {
        if (!viajeId) return;

        try {
            const payload = {
                ...data,
                descripcion: data.descripcion || undefined,
                alto: data.alto || undefined,
                largo: data.largo || undefined,
                ancho: data.ancho || undefined,
                peso: data.peso || undefined
            };

            if (editItem) {
                await updateMutation.mutateAsync({ id: editItem.viajeMercaderiaID, data: payload, viajeId });
                onCancelEdit();
            } else {
                await createMutation.mutateAsync({ viajeId, data: payload });
            }
            
            reset({
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
            logger.error("Error saving mercaderia:", error);
            handleBackendErrors<ViajeMercaderiaFormData>(error, setError);
        }
    };

    return (
        <Paper 
            id="mercaderia-form"
            elevation={0} 
            sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 3, 
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(editItem ? theme.palette.warning.main : theme.palette.primary.main, 0.02)
            }}
        >
            <SubFormHeader 
                isEditing={isEditing}
                titleAdd="Agregar Mercadería"
                titleEdit="Editar Mercadería"
                onCancel={onCancelEdit}
            />

            <Grid container spacing={2}>
                {/* Fila 1: Producto, Descripción */}
                <Grid size={{xs:12, md:4}}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                        Producto
                    </Typography>
                    <Controller
                        name="mercaderiaID"
                        control={control}
                        render={({ field }) => (
                            <FormSelect
                                label=""
                                options={mercaderias}
                                value={field.value}
                                onChange={(e) => {
                                    const id = Number(e.target.value);
                                    field.onChange(id);
                                    const selected = mercaderias.find(m => m.id === id);
                                    if (selected) {
                                        setValue('descripcion', selected.text);
                                    }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                error={!!errors.mercaderiaID}
                                helperText={errors.mercaderiaID?.message}
                            />
                        )}
                    />
                </Grid>
                <Grid size={{xs:12, md:8}}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                        Descripción Detallada
                    </Typography>
                    <Controller
                        name="descripcion"
                        control={control}
                        render={({ field }) => (
                            <TextField 
                                {...field}
                                fullWidth 
                                size="small"
                                placeholder="Ingrese especificaciones, marcas o modelos..."
                                error={!!errors.descripcion}
                                helperText={errors.descripcion?.message}
                                onKeyDown={handleAddressKeyDown}
                            />
                        )}
                    />
                </Grid>

                {/* Fila 2: Dimensiones y Peso */}
                <Grid size={{xs:12, md:7}}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper' }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                            <Straighten fontSize="inherit" /> Dimensiones (Largo x Alto x Ancho)
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="largo"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        placeholder="Largo"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        InputProps={{ sx: { textAlign: 'center', '& input': { textAlign: 'center' } } }}
                                        variant="standard"
                                        error={!!errors.largo}
                                    />
                                )}
                            />
                            <Typography color="text.secondary" variant="caption">×</Typography>
                            <Controller
                                name="ancho"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        placeholder="Ancho"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        InputProps={{ sx: { textAlign: 'center', '& input': { textAlign: 'center' } } }}
                                        variant="standard"
                                        error={!!errors.ancho}
                                    />
                                )}
                            />
                            <Typography color="text.secondary" variant="caption">×</Typography>
                            <Controller
                                name="alto"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        placeholder="Alto"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        InputProps={{ sx: { textAlign: 'center', '& input': { textAlign: 'center' } } }}
                                        variant="standard"
                                        error={!!errors.alto}
                                    />
                                )}
                            />
                            <Box sx={{ minWidth: 100, ml: 1 }}>
                                <Controller
                                    name="tipoMedidaID"
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label=""
                                            options={tiposMedida}
                                            value={field.value}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            variant="standard"
                                            error={!!errors.tipoMedidaID}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>
                        {(errors.largo || errors.ancho || errors.alto || errors.tipoMedidaID) && (
                             <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                                {errors.tipoMedidaID?.message || "Revise las dimensiones"}
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{xs:12, md:5}}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper' }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                            <MonitorWeight fontSize="inherit" /> Peso
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="peso"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        placeholder="Peso Total"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        variant="standard"
                                        InputProps={{ sx: { textAlign: 'center', '& input': { textAlign: 'center' } } }}
                                        error={!!errors.peso}
                                    />
                                )}
                            />
                            <Box sx={{ minWidth: 100, ml: 1 }}>
                                <Controller
                                    name="tipoPesoID"
                                    control={control}
                                    render={({ field }) => (
                                        <FormSelect
                                            label=""
                                            options={tiposPeso}
                                            value={field.value}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            variant="standard"
                                            error={!!errors.tipoPesoID}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>
                        {(errors.peso || errors.tipoPesoID) && (
                             <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                                {errors.tipoPesoID?.message || errors.peso?.message}
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{xs:12}}>
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                        {editItem && (
                            <Button 
                                variant="outlined" 
                                color="inherit" 
                                onClick={onCancelEdit}
                                startIcon={<CloseIcon />}
                            >
                                Cancelar
                            </Button>
                        )}
                        <Button 
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            variant="contained" 
                            color={editItem ? "warning" : "primary"}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : (editItem ? <SaveIcon /> : <AddIcon />)}
                            disabled={isLoading}
                        >
                            {editItem ? 'Actualizar' : 'Agregar a la Lista'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}