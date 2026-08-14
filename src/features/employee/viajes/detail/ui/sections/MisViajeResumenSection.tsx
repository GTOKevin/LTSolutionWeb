import {
    AssignmentTurnedInOutlined as AssignmentTurnedInOutlinedIcon,
    LocalShippingOutlined as LocalShippingOutlinedIcon,
    PlaceOutlined as PlaceOutlinedIcon,
    RouteOutlined as RouteOutlinedIcon,
    TimelineOutlined as TimelineOutlinedIcon,
} from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import type { useMisViajeDetailPageController } from '../../hooks/useMisViajeDetailPageController';
import {
    employeeViajeDetailStyles,
    formatEmployeeViajeDateLabel,
    formatEmployeeViajeKmLabel,
} from '../../model/view-helpers';
import {
    getEmployeeViajeWorkflowSteps,
    getEmployeeViajeWorkflowSummary,
} from '../../../model/workflow';
import { DetailSectionHeader } from '../shared/DetailSectionHeader';
import { OperationalStatusBadge } from '../shared/OperationalStatusBadge';
import { SummaryItem } from '../shared/SummaryItem';
import { WorkflowTimeline } from '../shared/WorkflowTimeline';

interface MisViajeResumenSectionProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

export function MisViajeResumenSection({ controller }: MisViajeResumenSectionProps) {
    const viaje = controller.viaje;

    if (!viaje) {
        return null;
    }

    const workflowSummary = getEmployeeViajeWorkflowSummary(viaje);
    const workflowSteps = getEmployeeViajeWorkflowSteps(viaje);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 5' } }}>
                    <DetailSectionHeader
                        eyebrow="Resumen operativo"
                        title="Estado y progreso del viaje"
                        description="Este bloque resume la situación actual del viaje y la siguiente acción disponible."
                        aside={<OperationalStatusBadge label={workflowSummary.statusLabel} tone={workflowSummary.statusTone} />}
                    />

                    <Stack spacing={3}>
                        <WorkflowTimeline steps={workflowSteps} />

                        <Box sx={{ ...employeeViajeDetailStyles.softPanel }}>
                            <Stack spacing={2}>
                                <SummaryItem label="Estado actual" value={viaje.estadoNombre} />
                                <SummaryItem label="Siguiente estado" value={controller.nextEstado?.text ?? 'No disponible'} />
                                <SummaryItem label="Bloqueo operativo" value={controller.isWorkflowBlocked ? 'Sí' : 'No'} />
                            </Stack>
                        </Box>
                    </Stack>
                </Box>

                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 4' } }}>
                    <DetailSectionHeader
                        eyebrow="Línea de tiempo"
                        title="Fechas clave del viaje"
                        description="Las fechas automáticas y manuales del flujo se centralizan aquí."
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        <SummaryItem label="Fecha de carga" value={formatEmployeeViajeDateLabel(viaje.fechaCarga)} />
                        <SummaryItem label="Fecha de partida" value={formatEmployeeViajeDateLabel(viaje.fechaPartida)} />
                        <SummaryItem label="Fecha de llegada" value={formatEmployeeViajeDateLabel(viaje.fechaLlegada)} />
                        <SummaryItem label="Fecha de descarga" value={formatEmployeeViajeDateLabel(viaje.fechaDescarga)} />
                        <SummaryItem label="Llegada a base" value={formatEmployeeViajeDateLabel(viaje.fechaLlegadaBase)} />
                    </Box>
                </Box>

                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 3' } }}>
                    <DetailSectionHeader
                        eyebrow="Ruta y unidad"
                        title="Asignación operativa"
                        description="Datos principales que el conductor necesita consultar antes de ejecutar acciones."
                    />

                    <Stack spacing={2.5}>
                        <SummaryItem label="Cliente" value={viaje.clienteRazonSocial} />
                        <SummaryItem label="Origen" value={viaje.origenDescripcion} />
                        <SummaryItem label="Destino" value={viaje.destinoDescripcion} />
                        <SummaryItem label="Tracto" value={viaje.tractoPlaca || 'Sin información'} />
                        <SummaryItem label="Carreta" value={viaje.carretaPlaca || 'Sin información'} />
                    </Stack>
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 8' } }}>
                    <DetailSectionHeader
                        eyebrow="Registro operativo"
                        title="Indicadores del detalle"
                        description="Resumen rápido de control, registros y documentos asociados a este viaje."
                    />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
                            gap: 2,
                        }}
                    >
                        <Box sx={employeeViajeDetailStyles.mutedCard}>
                            <Stack spacing={1}>
                                <RouteOutlinedIcon color="primary" />
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Kilometraje
                                </Typography>
                                <Typography variant="h6" fontWeight={800}>
                                    {formatEmployeeViajeKmLabel(viaje.kmInicio)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Inicio / {formatEmployeeViajeKmLabel(viaje.kmLlegada)} / {formatEmployeeViajeKmLabel(viaje.kmLlegadaBase)}
                                </Typography>
                            </Stack>
                        </Box>

                        <Box sx={employeeViajeDetailStyles.mutedCard}>
                            <Stack spacing={1}>
                                <TimelineOutlinedIcon color="primary" />
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Flujo
                                </Typography>
                                <Typography variant="h6" fontWeight={800}>
                                    {controller.nextEstado?.text ?? 'Sin transición'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Próximo movimiento operativo disponible
                                </Typography>
                            </Stack>
                        </Box>

                        <Box sx={employeeViajeDetailStyles.mutedCard}>
                            <Stack spacing={1}>
                                <AssignmentTurnedInOutlinedIcon color="primary" />
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Documentos
                                </Typography>
                                <Typography variant="h6" fontWeight={800}>
                                    {controller.guias.length} guías
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {controller.permisos.length} permisos visibles en el viaje
                                </Typography>
                            </Stack>
                        </Box>

                        <Box sx={employeeViajeDetailStyles.mutedCard}>
                            <Stack spacing={1}>
                                <LocalShippingOutlinedIcon color="primary" />
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Seguimiento
                                </Typography>
                                <Typography variant="h6" fontWeight={800}>
                                    {controller.incidentes.length} incidentes
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {viaje.cerrado ? 'Viaje cerrado' : 'Viaje operativo para seguimiento'}
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 4' } }}>
                    <DetailSectionHeader
                        eyebrow="Lectura rápida"
                        title="Qué revisar ahora"
                        description="Orientación visual para reducir tiempo de decisión dentro del detalle."
                    />

                    <Stack spacing={2}>
                        <Box sx={employeeViajeDetailStyles.softPanel}>
                            <Stack direction="row" spacing={1.5}>
                                <PlaceOutlinedIcon color="primary" />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={800}>
                                        Validar fechas y progresión
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Confirma si la llegada ya fue registrada antes de avanzar el flujo.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>

                        <Box sx={employeeViajeDetailStyles.softPanel}>
                            <Stack direction="row" spacing={1.5}>
                                <RouteOutlinedIcon color="primary" />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={800}>
                                        Completar kilometraje
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Registra los kilómetros cuando ya cuentes con datos confiables del tramo.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}
