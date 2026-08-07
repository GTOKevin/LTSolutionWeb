import { Info as InfoIcon, Save as SaveIcon } from '@mui/icons-material';
import { Box, Button, Divider, InputAdornment, TextField, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { useMisViajeDetailPageController } from '../../hooks/useMisViajeDetailPageController';
import { employeeViajeDetailStyles } from '../../model/view-helpers';
import { SummaryItem } from '../shared/SummaryItem';

interface MisViajeKmsSectionProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

export function MisViajeKmsSection({ controller }: MisViajeKmsSectionProps) {
    const viaje = controller.viaje;
    const isCerrado = Boolean(viaje?.cerrado);

    if (!viaje) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
            <Box sx={{ width: { xs: '100%', lg: '33%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ ...employeeViajeDetailStyles.card }}>
                    <Typography variant="overline" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3 }}>
                        Contexto del viaje
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <SummaryItem label="Ruta" value={`${viaje.origenDescripcion} -> ${viaje.destinoDescripcion}`} />
                        <SummaryItem label="Cliente" value={viaje.clienteRazonSocial} />
                        <SummaryItem label="Tracto" value={viaje.tractoPlaca || 'Sin informacion'} />
                        <SummaryItem label="Carreta" value={viaje.carretaPlaca || 'Sin informacion'} />
                    </Box>
                </Box>
            </Box>

            <Box sx={{ width: { xs: '100%', lg: '67%' } }}>
                <Box sx={{ ...employeeViajeDetailStyles.card, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Registro de Kilometraje
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Introduzca los valores actuales para actualizar la hoja de ruta.
                            </Typography>
                        </Box>
                    </Box>

                    <Box component="form" onSubmit={controller.kmsForm.handleSubmit(controller.onSubmitKms)} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                            <Box>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                                    KM INICIO DE RUTA
                                </Typography>
                                <Controller
                                    name="kmInicio"
                                    control={controller.kmsForm.control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type="number"
                                            placeholder="0"
                                            disabled={!controller.canManageViajeKms || isCerrado}
                                            error={!!controller.kmsForm.formState.errors.kmInicio}
                                            helperText={controller.kmsForm.formState.errors.kmInicio?.message}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography fontWeight="bold" color="text.secondary">
                                                            KM
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    fontSize: '1.5rem',
                                                    fontWeight: 'bold',
                                                    bgcolor: 'action.hover',
                                                    borderRadius: 2,
                                                    '& fieldset': { border: 'none' },
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                            <Box>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                                    KM LLEGADA DESTINO
                                </Typography>
                                <Controller
                                    name="kmLlegada"
                                    control={controller.kmsForm.control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type="number"
                                            placeholder="0"
                                            disabled={!controller.canManageViajeKms || isCerrado}
                                            error={!!controller.kmsForm.formState.errors.kmLlegada}
                                            helperText={controller.kmsForm.formState.errors.kmLlegada?.message}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography fontWeight="bold" color="text.secondary">
                                                            KM
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    fontSize: '1.5rem',
                                                    fontWeight: 'bold',
                                                    bgcolor: 'action.hover',
                                                    borderRadius: 2,
                                                    '& fieldset': { border: 'none' },
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                                KM REGRESO A BASE (FINAL)
                            </Typography>
                            <Controller
                                name="kmLlegadaBase"
                                control={controller.kmsForm.control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="number"
                                        placeholder="0"
                                        disabled={!controller.canManageViajeKms || isCerrado}
                                        error={!!controller.kmsForm.formState.errors.kmLlegadaBase}
                                        helperText={controller.kmsForm.formState.errors.kmLlegadaBase?.message}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography fontWeight="bold" color="text.secondary">
                                                        KM TOTAL
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                fontSize: '2rem',
                                                fontWeight: 'bold',
                                                bgcolor: 'action.hover',
                                                borderRadius: 2,
                                                '& fieldset': { border: 'none' },
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
                                <InfoIcon fontSize="small" />
                                <Typography variant="body2">
                                    Los campos se bloquearán una vez guardado el cierre de viaje.
                                </Typography>
                            </Box>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!controller.canManageViajeKms || isCerrado || controller.updateKmsMutation.isPending}
                                startIcon={<SaveIcon />}
                                sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', fontSize: '1rem' }}
                            >
                                Guardar Kilometraje
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
