import { Box, Button, Typography, TextField, Paper, alpha, useTheme, Tabs, Tab } from '@mui/material';
import { AddModerator as AddModeratorIcon, Sync as SyncIcon } from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    createViajeEscoltaDefaultValues,
    viajeEscoltaSchema,
    type ViajeEscoltaFormData,
    type ViajeEscoltaMode,
} from '@/features/viaje/model/schema';
import { useCreateViajeEscolta } from '@/features/viaje/hooks/useViajeEscoltas';
import { useViajeEscoltaOptions } from '@/features/viaje/options/hooks/useViajeScopedOptions';
import { FormSelect } from '@/shared/components/ui/FormSelect';

interface EscoltasFormProps {
    viajeId: number;
}

export function EscoltasForm({ viajeId }: EscoltasFormProps) {
    const theme = useTheme();
    const createMutation = useCreateViajeEscolta();
    const { flotasEscolta, colaboradores } = useViajeEscoltaOptions(viajeId, true);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<ViajeEscoltaFormData>({
        resolver: zodResolver(viajeEscoltaSchema),
        defaultValues: createViajeEscoltaDefaultValues(),
    });

    const isTercero = useWatch({ control, name: 'tercero', defaultValue: false });

    const resetFormForMode = (mode: ViajeEscoltaMode) => {
        reset(createViajeEscoltaDefaultValues(mode));
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        resetFormForMode(newValue === 1 ? 'tercero' : 'propio');
    };

    const onSubmit = (data: ViajeEscoltaFormData) => {
        createMutation.mutate({ viajeId, data }, {
            onSuccess: () => {
                resetFormForMode(isTercero ? 'tercero' : 'propio');
            },
        });
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 3,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                height: '100%',
                borderRadius: 3,
            }}
        >
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="text.primary" mb={0.5}>
                    Asignar Recurso
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Añadir escoltas de seguridad para el viaje actual.
                </Typography>
            </Box>

            <Box sx={{ bgcolor: 'background.paper', p: 0.5, borderRadius: 2, mb: 3 }}>
                <Tabs
                    value={isTercero ? 1 : 0}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        minHeight: 40,
                        '& .MuiTab-root': {
                            minHeight: 40,
                            borderRadius: 1.5,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        },
                        '& .Mui-selected': {
                            bgcolor: 'background.default',
                            color: 'primary.main',
                            boxShadow: 1,
                        },
                        '& .MuiTabs-indicator': {
                            display: 'none',
                        },
                    }}
                >
                    <Tab label="Propio" />
                    <Tab label="Tercero" />
                </Tabs>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {!isTercero ? (
                    <>
                        <Controller
                            name="flotaID"
                            control={control}
                            render={({ field }) => (
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
                                        Vehículo de Flota
                                    </Typography>
                                    <Box sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 } }}>
                                        <FormSelect
                                            label=""
                                            options={flotasEscolta || []}
                                            value={field.value}
                                            onChange={(event) => field.onChange(Number(event.target.value))}
                                            error={!!errors.flotaID}
                                            helperText={errors.flotaID?.message}
                                        />
                                    </Box>
                                </Box>
                            )}
                        />

                        <Controller
                            name="colaboradorID"
                            control={control}
                            render={({ field }) => (
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
                                        Conductor Asignado
                                    </Typography>
                                    <Box sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 } }}>
                                        <FormSelect
                                            label=""
                                            options={colaboradores || []}
                                            value={field.value}
                                            onChange={(event) => field.onChange(Number(event.target.value))}
                                            error={!!errors.colaboradorID}
                                            helperText={errors.colaboradorID?.message}
                                        />
                                    </Box>
                                </Box>
                            )}
                        />
                    </>
                ) : (
                    <>
                        <Controller
                            name="empresa"
                            control={control}
                            render={({ field }) => (
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
                                        Empresa de Seguridad
                                    </Typography>
                                    <TextField
                                        {...field}
                                        fullWidth
                                        size="small"
                                        placeholder="Nombre de la compañía"
                                        error={!!errors.empresa}
                                        helperText={errors.empresa?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 } }}
                                    />
                                </Box>
                            )}
                        />

                        <Controller
                            name="nombreConductor"
                            control={control}
                            render={({ field }) => (
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
                                        Conductor
                                    </Typography>
                                    <TextField
                                        {...field}
                                        fullWidth
                                        size="small"
                                        placeholder="Nombre completo"
                                        error={!!errors.nombreConductor}
                                        helperText={errors.nombreConductor?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 } }}
                                    />
                                </Box>
                            )}
                        />

                        <Controller
                            name="placa"
                            control={control}
                            render={({ field }) => (
                                <Box>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
                                        Placa
                                    </Typography>
                                    <TextField
                                        {...field}
                                        fullWidth
                                        size="small"
                                        placeholder="Placa del vehículo"
                                        error={!!errors.placa}
                                        helperText={errors.placa?.message}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 } }}
                                    />
                                </Box>
                            )}
                        />
                    </>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={createMutation.isPending}
                    startIcon={createMutation.isPending ? <SyncIcon sx={{ animation: 'spin 2s linear infinite' }} /> : <AddModeratorIcon />}
                    sx={{
                        mt: 2,
                        py: 1.5,
                        fontWeight: 'bold',
                        letterSpacing: 1,
                        bgcolor: 'primary.main',
                        borderRadius: 3,
                        '&:hover': { bgcolor: 'primary.dark' },
                    }}
                >
                    {createMutation.isPending ? 'Procesando...' : 'Asignar Escolta'}
                </Button>
            </form>
        </Paper>
    );
}
