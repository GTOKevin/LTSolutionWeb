import {
    EventAvailableOutlined as EventAvailableOutlinedIcon,
    FlagOutlined as FlagOutlinedIcon,
    InfoOutlined as InfoOutlinedIcon,
    NorthEastOutlined as NorthEastOutlinedIcon,
} from '@mui/icons-material';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { useMisViajeDetailPageController } from '../../hooks/useMisViajeDetailPageController';
import {
    employeeViajeDetailStyles,
    formatEmployeeViajeDateLabel,
} from '../../model/view-helpers';
import { getEmployeeViajeWorkflowSteps } from '../../../model/workflow';
import { DetailSectionHeader } from '../shared/DetailSectionHeader';
import { OperationalStatusBadge } from '../shared/OperationalStatusBadge';
import { SummaryItem } from '../shared/SummaryItem';
import { WorkflowTimeline } from '../shared/WorkflowTimeline';

interface MisViajeStatusSectionProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

export function MisViajeStatusSection({ controller }: MisViajeStatusSectionProps) {
    const canEdit = controller.canManageViaje && !controller.isWorkflowBlocked;
    const workflowSteps = getEmployeeViajeWorkflowSteps(controller.viaje);

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
            <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 4' } }}>
                <DetailSectionHeader
                    eyebrow="Progreso del flujo"
                    title="Estado del viaje"
                    description="Visualiza el punto actual del proceso y los hitos que ya fueron completados."
                    aside={
                        <OperationalStatusBadge
                            label={controller.viaje?.estadoNombre ?? 'Sin información'}
                            tone={controller.isWorkflowBlocked ? 'warning' : 'info'}
                        />
                    }
                />

                <Stack spacing={3}>
                    <WorkflowTimeline steps={workflowSteps} />

                    <Box sx={employeeViajeDetailStyles.softPanel}>
                        <Stack spacing={2.25}>
                            <SummaryItem label="Estado actual" value={controller.viaje?.estadoNombre ?? 'Sin información'} />
                            <SummaryItem label="Siguiente estado" value={controller.nextEstado?.text ?? 'No disponible'} />
                            <SummaryItem label="Fecha de partida" value={formatEmployeeViajeDateLabel(controller.viaje?.fechaPartida)} />
                            <SummaryItem label="Fecha de llegada" value={formatEmployeeViajeDateLabel(controller.viaje?.fechaLlegada)} />
                            <SummaryItem label="Fecha de descarga" value={formatEmployeeViajeDateLabel(controller.viaje?.fechaDescarga)} />
                        </Stack>
                    </Box>
                </Stack>
            </Box>

            <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 8' } }}>
                <DetailSectionHeader
                    eyebrow="Gestión operativa"
                    title="Actualizar flujo del viaje"
                    description="El flujo permitido es secuencial. Las fechas automáticas se registran desde backend al cambiar de estado."
                    aside={
                        canEdit
                            ? <OperationalStatusBadge label="Editable" tone="success" />
                            : <OperationalStatusBadge label="Bloqueado" tone="warning" />
                    }
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' }, gap: 3 }}>
                    <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 8' } }}>
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
                                    startIcon={<EventAvailableOutlinedIcon />}
                                    disabled={!canEdit || controller.updateStatusMutation.isPending}
                                    onClick={controller.statusForm.handleSubmit((data) => controller.saveFechaLlegada(data.fechaLlegada))}
                                >
                                    Guardar fecha de llegada
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<NorthEastOutlinedIcon />}
                                    disabled={!canEdit || !controller.nextEstado || controller.updateStatusMutation.isPending}
                                    onClick={controller.statusForm.handleSubmit((data) => controller.submitNextEstado(data.fechaLlegada))}
                                >
                                    {controller.nextEstado ? `Pasar a ${controller.nextEstado.text}` : 'Sin transición disponible'}
                                </Button>
                            </Stack>
                        </Box>
                    </Box>

                    <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 4' } }}>
                        <Stack spacing={2}>
                            <Box sx={employeeViajeDetailStyles.softPanel}>
                                <Stack direction="row" spacing={1.5}>
                                    <FlagOutlinedIcon color="primary" />
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={800}>
                                            Regla del flujo
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            El viaje avanza solo por la secuencia Agendado, Tránsito, Descargando y Completado.
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            <Box sx={employeeViajeDetailStyles.softPanel}>
                                <Stack direction="row" spacing={1.5}>
                                    <InfoOutlinedIcon color="primary" />
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={800}>
                                            Fechas del proceso
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Partida y descarga se generan automáticamente. La llegada puede guardarse manualmente.
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
