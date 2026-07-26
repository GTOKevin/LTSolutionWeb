import { Box, Typography, Paper, Grid, Divider, Alert } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { Assignment, RouteOutlined, GroupAdd, Inventory2, CheckCircleOutline } from '@mui/icons-material';
import type { ViajeWizardFormData } from '../../../model/schema';
import type { SelectItem } from '@/shared/model/types';
import { useUbigeoDetails } from '@/shared/hooks/useUbigeoDetails';

interface Props {
    options: {
        clientes?: SelectItem[];
        estados?: SelectItem[];
        tractos?: SelectItem[];
        carretas?: SelectItem[];
        colaboradores?: SelectItem[];
        mercaderias?: SelectItem[];
        tiposMedida?: SelectItem[];
        tiposPeso?: SelectItem[];
    };
}

export function Step5Resumen({ options }: Props) {
    const { watch } = useFormContext<ViajeWizardFormData>();
    const formData = watch();

    const getLabel = (items?: SelectItem[], id?: number) => {
        if (!items || !id) return 'No especificado';
        const found = items.find(i => i.id === id);
        return found ? found.text : 'No especificado';
    };

    const { data: origenDetails } = useUbigeoDetails(formData.origenID);
    const { data: destinoDetails } = useUbigeoDetails(formData.destinoID);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Alert icon={<CheckCircleOutline fontSize="inherit" />} severity="success" sx={{ borderRadius: 2 }}>
                Por favor, revise la información del viaje antes de confirmar. Si todo está correcto, presione "Confirmar y Guardar Viaje".
            </Alert>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Assignment color="primary" />
                            <Typography variant="h6" fontWeight={700}>Información General</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box><Typography variant="caption" color="text.secondary">Cliente Contratante</Typography><Typography variant="body2" fontWeight={600}>{getLabel(options.clientes, formData.clienteID)}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Estado Inicial</Typography><Typography variant="body2" fontWeight={600}>{getLabel(options.estados, formData.estadoID)}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Fecha de Carga</Typography><Typography variant="body2" fontWeight={600}>{formData.fechaCarga || 'No especificada'}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Cotización Referencia</Typography><Typography variant="body2" fontWeight={600}>{formData.cotizacionID || 'Sin cotización asociada'}</Typography></Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <RouteOutlined color="primary" />
                            <Typography variant="h6" fontWeight={700}>Ruta y Ubicaciones</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box><Typography variant="caption" color="text.secondary">Origen</Typography><Typography variant="body2" fontWeight={600}>{origenDetails ? `${origenDetails.departamento}, ${origenDetails.provincia}, ${origenDetails.distrito}` : 'No especificado'}</Typography></Box>
                            {formData.direccionOrigen && <Box><Typography variant="caption" color="text.secondary">Dir. Exacta Origen</Typography><Typography variant="body2">{formData.direccionOrigen}</Typography></Box>}

                            <Box mt={1}><Typography variant="caption" color="text.secondary">Destino</Typography><Typography variant="body2" fontWeight={600}>{destinoDetails ? `${destinoDetails.departamento}, ${destinoDetails.provincia}, ${destinoDetails.distrito}` : 'No especificado'}</Typography></Box>
                            {formData.direccionDestino && <Box><Typography variant="caption" color="text.secondary">Dir. Exacta Destino</Typography><Typography variant="body2">{formData.direccionDestino}</Typography></Box>}
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <GroupAdd color="primary" />
                            <Typography variant="h6" fontWeight={700}>Recursos Asignados</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box><Typography variant="caption" color="text.secondary">Conductor</Typography><Typography variant="body2" fontWeight={600}>{getLabel(options.colaboradores, formData.colaboradorID)}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Tracto Asignado</Typography><Typography variant="body2" fontWeight={600}>{getLabel(options.tractos, formData.tractoID)}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Carreta Asignada</Typography><Typography variant="body2" fontWeight={600}>{getLabel(options.carretas, formData.carretaID)}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Ejes Totales (Tracto + Carreta)</Typography><Typography variant="body2" fontWeight={600}>{(formData.ejesTracto || 0) + (formData.ejesCarreta || 0)} ejes</Typography></Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Inventory2 color="primary" />
                            <Typography variant="h6" fontWeight={700}>Detalles de la Carga</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {formData.mercaderias && formData.mercaderias.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {formData.mercaderias.map((m, idx) => (
                                    <Box key={idx} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                                        <Typography variant="body2" fontWeight={600} color="primary.main">
                                            {getLabel(options.mercaderias, m.mercaderiaID)}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            Dimensiones: {m.largo || '-'}x{m.ancho || '-'}x{m.alto || '-'} {getLabel(options.tiposMedida, m.tipoMedidaID)}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            Peso: {m.peso || '-'} {getLabel(options.tiposPeso, m.tipoPesoID)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No se especificaron mercaderías.
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
