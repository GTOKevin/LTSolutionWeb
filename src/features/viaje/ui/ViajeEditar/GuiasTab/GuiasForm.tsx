import { Box, Typography, Button, TextField, MenuItem, useTheme, alpha, CircularProgress } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateViajeGuia } from '@features/viaje/hooks/useViajeGuias';
import { useViajeGuiaOptions } from '@features/viaje/options/hooks/useViajeScopedOptions';
import { viajeGuiaSchema, type ViajeGuiaFormData } from '@features/viaje/model/schema';
import { ImageUpload } from '@/shared/components/ui/ImageUpload';
import { logger } from '@/shared/utils/logger';

interface GuiasFormProps {
    viajeID: number;
}

export function GuiasForm({ viajeID }: GuiasFormProps) {
    const theme = useTheme();
    const createMutation = useCreateViajeGuia();
    const { tiposGuia } = useViajeGuiaOptions(true);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<ViajeGuiaFormData>({
        resolver: zodResolver(viajeGuiaSchema),
        defaultValues: {
            tipoGuiaID: 0,
            serie: '',
            numero: '',
            rutaArchivo: ''
        }
    });

    const onSubmit = async (data: ViajeGuiaFormData) => {
        try {
            await createMutation.mutateAsync({
                viajeId: viajeID,
                data: {
                    ...data,
                    rutaArchivo: data.rutaArchivo || undefined
                }
            });
            reset();
        } catch (error) {
            logger.error("Error al registrar guía", error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1.5 }}>
                    Nueva Guía de Remisión
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ 
                    mt: 2, p: 3, 
                    bgcolor: 'background.default', 
                    borderRadius: 3, 
                    border: '1px solid', 
                    borderColor: alpha(theme.palette.divider, 0.5),
                    display: 'flex', flexDirection: 'column', gap: 3
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block' }}>
                                Tipo de Guía
                            </Typography>
                            <Controller
                                name="tipoGuiaID"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        size="small"
                                        error={!!errors.tipoGuiaID}
                                        helperText={errors.tipoGuiaID?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' } }}
                                    >
                                        <MenuItem value={0} disabled>Seleccione un tipo</MenuItem>
                                        {tiposGuia?.map((tipo) => (
                                            <MenuItem key={tipo.id} value={tipo.id}>{tipo.text}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2 }}>
                            <Box>
                                <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block' }}>
                                    Serie
                                </Typography>
                                <Controller
                                    name="serie"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            size="small"
                                            placeholder="T001"
                                            error={!!errors.serie}
                                            helperText={errors.serie?.message}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' } }}
                                        />
                                    )}
                                />
                            </Box>
                            <Box>
                                <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block' }}>
                                    Número
                                </Typography>
                                <Controller
                                    name="numero"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            size="small"
                                            placeholder="00012456"
                                            error={!!errors.numero}
                                            helperText={errors.numero?.message}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' } }}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, mb: 1, display: 'block' }}>
                            Imagen del Documento
                        </Typography>
                        <Controller
                            name="rutaArchivo"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <ImageUpload
                                    value={value || undefined}
                                    onChange={onChange}
                                    helperText="JPG, PNG o PDF (Max 5MB)"
                                />
                            )}
                        />
                    </Box>

                    <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth 
                        disabled={createMutation.isPending}
                        startIcon={createMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{ 
                            py: 1.5, 
                            borderRadius: 3, 
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #005da8 0%, #0076d2 100%)',
                            boxShadow: '0 4px 14px rgba(0, 93, 168, 0.3)'
                        }}
                    >
                        Registrar Guía
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
