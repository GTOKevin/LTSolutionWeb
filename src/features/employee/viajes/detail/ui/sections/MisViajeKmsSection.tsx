import {
    Info as InfoIcon,
    Save as SaveIcon,
    SpeedOutlined as SpeedOutlinedIcon,
    TimelineOutlined as TimelineOutlinedIcon,
} from '@mui/icons-material';
import { Box, Button, Divider, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { useMisViajeDetailPageController } from '../../hooks/useMisViajeDetailPageController';
import { employeeViajeDetailStyles } from '../../model/view-helpers';
import { DetailSectionHeader } from '../shared/DetailSectionHeader';
import { OperationalStatusBadge } from '../shared/OperationalStatusBadge';
import { SummaryItem } from '../shared/SummaryItem';

interface MisViajeKmsSectionProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

function resolveKmCompletionLabel(values: Array<number | null | undefined>) {
    const completed = values.filter((value) => value !== null && value !== undefined).length;

    if (completed === 0) {
        return 'Pendiente';
    }

    if (completed < values.length) {
        return 'Parcial';
    }

    return 'Completo';
}

export function MisViajeKmsSection({ controller }: MisViajeKmsSectionProps) {
    const viaje = controller.viaje;
    const isCerrado = controller.isCerrado;

    if (!viaje) {
        return null;
    }

    const kmStatus = resolveKmCompletionLabel([viaje.kmInicio, viaje.kmLlegada, viaje.kmLlegadaBase]);

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
            <Box sx={{ gridColumn: { xs: 'span 1', xl: 'span 4' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={employeeViajeDetailStyles.card}>
                    <DetailSectionHeader
                        eyebrow="Contexto del viaje"
                        title="Base de captura"
                        description="Consulta el contexto operativo antes de registrar el kilometraje."
                    />
                    <Stack spacing={2.5}>
                        <SummaryItem label="Ruta" value={`${viaje.origenDescripcion} -> ${viaje.destinoDescripcion}`} />
                        <SummaryItem label="Cliente" value={viaje.clienteRazonSocial} />
                        <SummaryItem label="Tracto" value={viaje.tractoPlaca || 'Sin información'} />
                        <SummaryItem label="Carreta" value={viaje.carretaPlaca || 'Sin información'} />
                    </Stack>
                </Box>

                <Box sx={employeeViajeDetailStyles.card}>
                    <DetailSectionHeader
                        eyebrow="Consistencia"
                        title="Estado del registro"
                        description="Te ayuda a saber si ya completaste la captura principal del viaje."
                        aside={
                            <OperationalStatusBadge
                                label={kmStatus}
                                tone={kmStatus === 'Completo' ? 'success' : kmStatus === 'Parcial' ? 'warning' : 'neutral'}
                            />
                        }
                    />

                    <Stack spacing={2}>
                        <Box sx={employeeViajeDetailStyles.softPanel}>
                            <Stack direction="row" spacing={1.5}>
                                <SpeedOutlinedIcon color="primary" />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={800}>
                                        Cierre operativo
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Una vez cerrado el viaje, la edición de kilometraje queda bloqueada para evitar inconsistencias.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>

                        <Box sx={employeeViajeDetailStyles.softPanel}>
                            <Stack direction="row" spacing={1.5}>
                                <TimelineOutlinedIcon color="primary" />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={800}>
                                        Referencia actual
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Inicio: {viaje.kmInicio ?? 'Sin registrar'} / Destino: {viaje.kmLlegada ?? 'Sin registrar'} / Base: {viaje.kmLlegadaBase ?? 'Sin registrar'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>
                </Box>
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 1', xl: 'span 8' } }}>
                <Box sx={{ ...employeeViajeDetailStyles.card, height: '100%' }}>
                    <DetailSectionHeader
                        eyebrow="Captura de kilometraje"
                        title="Actualizar hoja de ruta"
                        description="Registra los kilómetros clave del viaje para mantener consistencia en el seguimiento."
                        aside={
                            controller.canManageViajeKms && !isCerrado
                                ? <OperationalStatusBadge label="Editable" tone="success" />
                                : <OperationalStatusBadge label="Bloqueado" tone="warning" />
                        }
                    />

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
                                            helperText={controller.kmsForm.formState.errors.kmInicio?.message ?? 'Registro de salida del viaje'}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography fontWeight="bold" color="text.secondary">
                                                            KM
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    fontSize: '1.35rem',
                                                    fontWeight: 'bold',
                                                    bgcolor: 'action.hover',
                                                    borderRadius: 2.5,
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
                                            helperText={controller.kmsForm.formState.errors.kmLlegada?.message ?? 'Registro al llegar al destino'}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography fontWeight="bold" color="text.secondary">
                                                            KM
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    fontSize: '1.35rem',
                                                    fontWeight: 'bold',
                                                    bgcolor: 'action.hover',
                                                    borderRadius: 2.5,
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
                                KM REGRESO A BASE
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
                                        helperText={controller.kmsForm.formState.errors.kmLlegadaBase?.message ?? 'Último kilometraje del ciclo completo'}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography fontWeight="bold" color="text.secondary">
                                                        KM TOTAL
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                fontSize: '1.6rem',
                                                fontWeight: 'bold',
                                                bgcolor: 'action.hover',
                                                borderRadius: 2.5,
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
                                    Los campos se bloquearán una vez guardado el cierre del viaje.
                                </Typography>
                            </Box>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!controller.canManageViajeKms || isCerrado || controller.updateKmsMutation.isPending}
                                startIcon={<SaveIcon />}
                                sx={{ px: 4, py: 1.5, borderRadius: 2.5, fontWeight: 'bold', fontSize: '1rem' }}
                            >
                                Guardar kilometraje
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
