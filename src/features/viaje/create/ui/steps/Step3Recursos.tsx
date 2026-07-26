import { Box, Typography, Paper, Grid, TextField, Alert, useTheme } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { FormSelect } from '@/shared/components/ui/FormSelect';
import { Badge, LocalShipping, RvHookup, WarningAmber } from '@mui/icons-material';
import type { SelectItem } from '@/shared/model/types';
import type { ViajeWizardFormData } from '../../../model/schema';

interface Props {
    options: {
        tractos?: SelectItem[];
        carretas?: SelectItem[];
        colaboradores?: SelectItem[];
    };
}

export function Step3Recursos({ options }: Props) {
    const theme = useTheme();
    const { register, control, setValue, formState: { errors } } = useFormContext<ViajeWizardFormData>();
    const { tractos, carretas, colaboradores } = options;

    const handleTractoChange = (tractoID: number, onChangeField: (value: number) => void) => {
        onChangeField(tractoID);
        if (tractoID && tractos) {
            const selectedTracto = tractos.find(t => t.id === tractoID);
            if (selectedTracto?.extraTwo) {
                setValue('ejesTracto', parseInt(selectedTracto.extraTwo, 10), { shouldValidate: true, shouldDirty: true });
            }
        }
    };

    const handleCarretaChange = (carretaID: number, onChangeField: (value: number) => void) => {
        onChangeField(carretaID);
        if (carretaID && carretas) {
            const selectedCarreta = carretas.find(c => c.id === carretaID);
            if (selectedCarreta?.extraTwo) {
                setValue('ejesCarreta', parseInt(selectedCarreta.extraTwo, 10), { shouldValidate: true, shouldDirty: true });
            }
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Alert
                icon={<WarningAmber fontSize="inherit" />}
                severity="info"
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'info.light',
                    '& .MuiAlert-message': { width: '100%' }
                }}
            >
                <Typography variant="subtitle2" fontWeight={700}>Verificación de Documentos</Typography>
                <Typography variant="body2">Asegúrese de que los recursos asignados no tengan notificaciones pendientes (Ej. SOAT, Revisiones Técnicas o Licencias vencidas).</Typography>
            </Alert>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: (currentTheme) => `${currentTheme.palette.primary.main}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
                                <Badge />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight={800}>Personal Asignado</Typography>
                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Conductor del Viaje</Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                    Seleccione Conductor <Typography component="span" color="error">*</Typography>
                                </Typography>
                                <FormSelect
                                    label=""
                                    registration={register('colaboradorID', { valueAsNumber: true })}
                                    options={colaboradores || []}
                                    defaultValue={0}
                                    error={!!errors.colaboradorID}
                                    helperText={errors.colaboradorID?.message as string}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'info.light', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'info.dark' }}>
                                    <LocalShipping />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={800}>Unidad Tractora</Typography>
                                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Vehículo Principal</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                        Placa del Tracto <Typography component="span" color="error">*</Typography>
                                    </Typography>
                                    <Controller
                                        name="tractoID"
                                        control={control}
                                        render={({ field }) => (
                                            <FormSelect
                                                label=""
                                                registration={{
                                                    name: field.name,
                                                    onBlur: async () => { field.onBlur(); },
                                                    onChange: async (e) => {
                                                        field.onChange(e);
                                                        handleTractoChange(Number(e.target.value), field.onChange);
                                                    },
                                                    ref: field.ref
                                                }}
                                                options={tractos || []}
                                                value={field.value || 0}
                                                error={!!errors.tractoID}
                                                helperText={errors.tractoID?.message as string}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                        Número de Ejes <Typography component="span" color="error">*</Typography>
                                    </Typography>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        size="medium"
                                        placeholder="Automático"
                                        {...register('ejesTracto', { valueAsNumber: true })}
                                        error={!!errors.ejesTracto}
                                        helperText={errors.ejesTracto?.message as string}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Box>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[4] } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'warning.light', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'warning.dark' }}>
                                    <RvHookup />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={800}>Unidad de Carga</Typography>
                                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Remolque / Semirremolque</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                        Placa de la Carreta
                                    </Typography>
                                    <Controller
                                        name="carretaID"
                                        control={control}
                                        render={({ field }) => (
                                            <FormSelect
                                                label=""
                                                registration={{
                                                    name: field.name,
                                                    onBlur: async () => { field.onBlur(); },
                                                    onChange: async (e) => {
                                                        field.onChange(e);
                                                        handleCarretaChange(Number(e.target.value), field.onChange);
                                                    },
                                                    ref: field.ref
                                                }}
                                                options={carretas || []}
                                                value={field.value || 0}
                                                error={!!errors.carretaID}
                                                helperText={errors.carretaID?.message as string}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            />
                                        )}
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                        Número de Ejes
                                    </Typography>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        size="medium"
                                        placeholder="Automático"
                                        {...register('ejesCarreta', { valueAsNumber: true })}
                                        error={!!errors.ejesCarreta}
                                        helperText={errors.ejesCarreta?.message as string}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
