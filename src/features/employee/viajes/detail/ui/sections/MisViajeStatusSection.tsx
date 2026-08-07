import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { useMisViajeDetailPageController } from '../../hooks/useMisViajeDetailPageController';
import { employeeViajeDetailStyles, formatEmployeeViajeDateLabel } from '../../model/view-helpers';
import { SummaryItem } from '../shared/SummaryItem';

interface MisViajeStatusSectionProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

export function MisViajeStatusSection({ controller }: MisViajeStatusSectionProps) {
    const canEdit = controller.canManageViaje && !controller.isWorkflowBlocked;

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
            <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 4' } }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                    Estado del flujo
                </Typography>
                <Stack spacing={3}>
                    <SummaryItem label="Estado actual" value={controller.viaje?.estadoNombre ?? 'Sin informacion'} />
                    <SummaryItem label="Siguiente estado" value={controller.nextEstado?.text ?? 'No disponible'} />
                    <SummaryItem label="Fecha de partida" value={formatEmployeeViajeDateLabel(controller.viaje?.fechaPartida)} />
                    <SummaryItem label="Fecha de llegada" value={formatEmployeeViajeDateLabel(controller.viaje?.fechaLlegada)} />
                    <SummaryItem label="Fecha de descarga" value={formatEmployeeViajeDateLabel(controller.viaje?.fechaDescarga)} />
                </Stack>
            </Box>

            <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 8' } }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Gestión operativa del viaje
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    El flujo permitido es secuencial: Agendado, Tránsito, Descargando y Completado. Las fechas automáticas se registran desde backend al cambiar de estado.
                </Typography>

                {controller.isWorkflowBlocked ? (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Este viaje ya no permite cambios de flujo porque está cerrado, facturado o completado.
                    </Alert>
                ) : null}

                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Controller
                        name="fechaLlegada"
                        control={controller.statusForm.control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Fecha de llegada"
                                type="date"
                                value={field.value ?? ''}
                                onChange={(event) => field.onChange(event.target.value || null)}
                                disabled={!canEdit || controller.updateStatusMutation.isPending}
                                InputLabelProps={{ shrink: true }}
                                error={!!controller.statusForm.formState.errors.fechaLlegada}
                                helperText={controller.statusForm.formState.errors.fechaLlegada?.message ?? 'Puedes registrar la fecha de llegada sin cambiar de estado.'}
                            />
                        )}
                    />

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <Button
                            variant="outlined"
                            disabled={!canEdit || controller.updateStatusMutation.isPending}
                            onClick={controller.statusForm.handleSubmit((data) => controller.saveFechaLlegada(data.fechaLlegada))}
                        >
                            Guardar fecha de llegada
                        </Button>
                        <Button
                            variant="contained"
                            disabled={!canEdit || !controller.nextEstado || controller.updateStatusMutation.isPending}
                            onClick={controller.statusForm.handleSubmit((data) => controller.submitNextEstado(data.fechaLlegada))}
                        >
                            {controller.nextEstado ? `Pasar a ${controller.nextEstado.text}` : 'Sin transición disponible'}
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}
