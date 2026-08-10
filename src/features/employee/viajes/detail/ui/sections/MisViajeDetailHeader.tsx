import {
    ArrowBack as ArrowBackIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    LocalShipping as LocalShippingIcon,
    PlaceOutlined as PlaceOutlinedIcon,
    RouteOutlined as RouteOutlinedIcon,
} from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { useMisViajeDetailPageController } from '../../hooks/useMisViajeDetailPageController';
import { employeeViajeDetailStyles, formatEmployeeViajeDateLabel } from '../../model/view-helpers';
import { getEmployeeViajeWorkflowSummary } from '../../../model/workflow';
import { DetailHeroStat } from '../shared/DetailHeroStat';
import { OperationalStatusBadge } from '../shared/OperationalStatusBadge';

interface MisViajeDetailHeaderProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

export function MisViajeDetailHeader({ controller }: MisViajeDetailHeaderProps) {
    const viaje = controller.viaje;

    if (!viaje) {
        return null;
    }

    const workflowSummary = getEmployeeViajeWorkflowSummary(viaje);
    const subtitle = controller.isWorkflowBlocked
        ? 'El viaje ya no admite nuevas acciones operativas desde el portal.'
        : controller.nextEstado
            ? `Siguiente acción sugerida: avanzar a ${controller.nextEstado.text}.`
            : 'Revisa el detalle operativo y los documentos asociados al viaje.';

    return (
        <>
            <Box
                sx={{
                    ...employeeViajeDetailStyles.heroHeader,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    px: { xs: 2, md: 4 },
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                        <Button
                            onClick={controller.handleBack}
                            sx={{
                                minWidth: 'auto',
                                p: 1,
                                borderRadius: '50%',
                                color: 'text.secondary',
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            <ArrowBackIcon />
                        </Button>

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                                Portal del Empleado / Mis Viajes
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="text.primary">
                                Viaje {viaje.codigo}
                            </Typography>
                        </Box>
                    </Stack>

                    <OperationalStatusBadge
                        label={workflowSummary.statusLabel}
                        tone={workflowSummary.statusTone}
                    />
                </Stack>
            </Box>

            <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 }, bgcolor: 'background.default' }}>
                <Box sx={{ ...employeeViajeDetailStyles.card, p: { xs: 2.5, md: 3.5 } }}>
                    <Stack spacing={3}>
                        <Box>
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
                                        <OperationalStatusBadge label={viaje.estadoNombre} tone="info" />
                                        <OperationalStatusBadge label={viaje.cerrado ? 'Cerrado' : 'Abierto'} tone={viaje.cerrado ? 'warning' : 'success'} />
                                        <OperationalStatusBadge label={viaje.facturado ? 'Facturado' : 'Pendiente de facturar'} tone={viaje.facturado ? 'success' : 'neutral'} />
                                    </Stack>

                                    <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                                        {viaje.origenDescripcion} {'->'} {viaje.destinoDescripcion}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                        Cliente: {viaje.clienteRazonSocial}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {subtitle}
                                    </Typography>
                                </Box>

                                <Box sx={{ ...employeeViajeDetailStyles.softPanel, minWidth: { xs: '100%', md: 280 } }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                                        Visión rápida
                                    </Typography>
                                    <Stack spacing={1.25}>
                                        <Typography variant="body2" color="text.secondary">
                                            Unidad principal: <strong>{viaje.tractoPlaca || 'Sin información'}</strong>
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Carreta: <strong>{viaje.carretaPlaca || 'Sin información'}</strong>
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Fecha de carga: <strong>{formatEmployeeViajeDateLabel(viaje.fechaCarga)}</strong>
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Próxima transición: <strong>{controller.nextEstado?.text ?? 'Sin transición disponible'}</strong>
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Box>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
                                gap: 2,
                            }}
                        >
                            <DetailHeroStat
                                label="Ruta"
                                value={`${viaje.origenDescripcion} -> ${viaje.destinoDescripcion}`}
                                helper="Trayecto principal asignado al conductor"
                                icon={<RouteOutlinedIcon />}
                            />
                            <DetailHeroStat
                                label="Unidad"
                                value={viaje.tractoPlaca || 'Sin información'}
                                helper={viaje.carretaPlaca ? `Carreta ${viaje.carretaPlaca}` : 'Sin carreta asociada'}
                                icon={<LocalShippingIcon />}
                            />
                            <DetailHeroStat
                                label="Llegada registrada"
                                value={formatEmployeeViajeDateLabel(viaje.fechaLlegada)}
                                helper="Actualizable desde el flujo operativo"
                                icon={<PlaceOutlinedIcon />}
                            />
                            <DetailHeroStat
                                label="Seguimiento"
                                value={`${controller.incidentes.length} incidentes / ${controller.guias.length} guías`}
                                helper={`${controller.permisos.length} permisos visibles`}
                                icon={<AssignmentTurnedInIcon />}
                            />
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </>
    );
}
