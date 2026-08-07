import { Box, Stack, Typography } from '@mui/material';
import type { MiViajeDetailDto } from '@entities/employee/model/types';
import {
    employeeViajeDetailStyles,
    formatEmployeeViajeDateLabel,
    formatEmployeeViajeKmLabel,
} from '../../model/view-helpers';
import { SummaryItem } from '../shared/SummaryItem';

interface MisViajeResumenSectionProps {
    viaje: MiViajeDetailDto;
}

export function MisViajeResumenSection({ viaje }: MisViajeResumenSectionProps) {
    const isCerrado = viaje.cerrado;
    const isFacturado = viaje.facturado;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' }, gap: 3 }}>
                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 5' } }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                        Resumen operativo
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        <SummaryItem label="Cliente" value={viaje.clienteRazonSocial} />
                        <SummaryItem label="Ruta" value={`${viaje.origenDescripcion} -> ${viaje.destinoDescripcion}`} />
                        <SummaryItem label="Fecha de carga" value={formatEmployeeViajeDateLabel(viaje.fechaCarga)} />
                        <SummaryItem label="Fecha de partida" value={formatEmployeeViajeDateLabel(viaje.fechaPartida)} />
                        <SummaryItem label="Fecha de llegada" value={formatEmployeeViajeDateLabel(viaje.fechaLlegada)} />
                        <SummaryItem label="Fecha de descarga" value={formatEmployeeViajeDateLabel(viaje.fechaDescarga)} />
                        <SummaryItem label="Llegada a base" value={formatEmployeeViajeDateLabel(viaje.fechaLlegadaBase)} />
                        <SummaryItem label="Estado actual" value={viaje.estadoNombre} />
                    </Box>
                </Box>

                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 3' } }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                        Unidad asignada
                    </Typography>
                    <Stack spacing={3}>
                        <SummaryItem label="Tracto" value={viaje.tractoPlaca || 'Sin informacion'} />
                        <SummaryItem label="Carreta" value={viaje.carretaPlaca || 'Sin informacion'} />
                        <SummaryItem label="Viaje cerrado" value={isCerrado ? 'Si' : 'No'} />
                        <SummaryItem label="Viaje facturado" value={isFacturado ? 'Si' : 'No'} />
                    </Stack>
                </Box>

                <Box sx={{ ...employeeViajeDetailStyles.card, gridColumn: { xs: 'span 1', xl: 'span 4' } }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 3, textTransform: 'uppercase' }}>
                        Kilometraje registrado
                    </Typography>
                    <Stack spacing={3}>
                        <SummaryItem label="Inicio de ruta" value={formatEmployeeViajeKmLabel(viaje.kmInicio)} />
                        <SummaryItem label="Llegada a destino" value={formatEmployeeViajeKmLabel(viaje.kmLlegada)} />
                        <SummaryItem label="Regreso a base" value={formatEmployeeViajeKmLabel(viaje.kmLlegadaBase)} />
                    </Stack>
                    <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                        <Typography variant="body2" color="text.secondary">
                            Desde esta pantalla también puedes gestionar el flujo del viaje, registrar incidentes, adjuntar guías y revisar permisos.
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
