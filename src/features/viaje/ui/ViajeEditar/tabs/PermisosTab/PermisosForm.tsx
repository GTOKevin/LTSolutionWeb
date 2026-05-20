import { Box, Button, Typography, TextField, Paper, alpha, useTheme } from '@mui/material';
import { AddModerator as AddModeratorIcon, Sync as SyncIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { viajePermisoSchema, type ViajePermisoFormData } from '@/features/viaje/model/schema';
import { useCreateViajePermiso } from '@/features/viaje/hooks/useViajePermisos';
import { ImageUpload } from '@/shared/components/ui/ImageUpload';
import { getCurrentDateISO } from '@/shared/utils/date-utils';

interface PermisosFormProps {
    viajeId: number;
}

export function PermisosForm({ viajeId }: PermisosFormProps) {
    const theme = useTheme();
    const createMutation = useCreateViajePermiso();

    const { control, handleSubmit, reset, formState: { errors } } = useForm<ViajePermisoFormData>({
        resolver: zodResolver(viajePermisoSchema),
        defaultValues: {
            fechaVigencia: getCurrentDateISO(),
            fechaVencimiento: '',
            rutaArchivo: ''
        }
    });

    const onSubmit = (data: ViajePermisoFormData) => {
        createMutation.mutate({ viajeId, data }, {
            onSuccess: () => {
                reset();
            }
        });
    };

    return (
        <Paper 
            variant="outlined" 
            sx={{ 
                p: 3, 
                bgcolor: alpha(theme.palette.background.default, 0.5),
                height: '100%'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AddModeratorIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Nuevo Permiso
                </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Controller
                    name="fechaVigencia"
                    control={control}
                    render={({ field }) => (
                        <Box>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
                                Fecha Vigencia
                            </Typography>
                            <TextField
                                {...field}
                                type="date"
                                fullWidth
                                size="small"
                                error={!!errors.fechaVigencia}
                                helperText={errors.fechaVigencia?.message}
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 1 } }}
                            />
                        </Box>
                    )}
                />

                <Controller
                    name="fechaVencimiento"
                    control={control}
                    render={({ field }) => (
                        <Box>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
                                Fecha Vencimiento
                            </Typography>
                            <TextField
                                {...field}
                                type="date"
                                fullWidth
                                size="small"
                                error={!!errors.fechaVencimiento}
                                helperText={errors.fechaVencimiento?.message}
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 1 } }}
                            />
                        </Box>
                    )}
                />

                <Controller
                    name="rutaArchivo"
                    control={control}
                    render={({ field }) => (
                        <Box>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
                                Archivo
                            </Typography>
                            <ImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                folder="permisos"
                                label="Documento del Permiso"
                                error={!!errors.rutaArchivo}
                                helperText={errors.rutaArchivo?.message}
                            />
                        </Box>
                    )}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={createMutation.isPending}
                    startIcon={createMutation.isPending ? <SyncIcon sx={{ animation: 'spin 2s linear infinite' }} /> : undefined}
                    sx={{ 
                        mt: 1, 
                        py: 1.5, 
                        fontWeight: 'bold', 
                        letterSpacing: 1, 
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                    }}
                >
                    {createMutation.isPending ? 'Procesando...' : 'Registrar Permiso'}
                </Button>
            </form>
        </Paper>
    );
}
