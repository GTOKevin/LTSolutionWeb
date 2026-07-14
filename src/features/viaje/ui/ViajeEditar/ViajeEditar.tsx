import { useState, useEffect } from 'react';
import { 
    Box, Tabs, Tab, Typography, CircularProgress, Paper, Stack, Button, Chip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import type { UpdateViajeDto } from '@/entities/viaje/model/types';
import dayjs from 'dayjs';

import { ResumenGeneralTab, type ResumenGeneralData } from './ResumenGeneralTab';
import { PlanificacionRutaTab } from './RutaTab/PlanificacionRutaTab';
import { GuiasTab } from './GuiasTab';
import { PermisosTab } from './PermisosTab/PermisosTab';
import { GastosTab } from './GastosTab';
import { EscoltaTab } from './EscoltaTab/EscoltaTab';
import { ViajeIncidente } from './IncidenteTab/ViajeIncidente';
import { useViajeOptions } from '@features/viaje/hooks/useViajeOptions';
import { useToast } from '@/shared/components/ui/Toast';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';

const createResumenGeneralData = (viaje?: Awaited<ReturnType<typeof viajeApi.getById>>): ResumenGeneralData => ({
    fechaCarga: viaje?.fechaCarga ? dayjs(viaje.fechaCarga) : null,
    fechaPartida: viaje?.fechaPartida ? dayjs(viaje.fechaPartida) : null,
    fechaLlegada: viaje?.fechaLlegada ? dayjs(viaje.fechaLlegada) : null,
    fechaDescarga: viaje?.fechaDescarga ? dayjs(viaje.fechaDescarga) : null,
    fechaLlegadaBase: viaje?.fechaLlegadaBase ? dayjs(viaje.fechaLlegadaBase) : null,
    kmInicio: viaje?.kmInicio ?? '',
    kmLlegada: viaje?.kmLlegada ?? '',
    kmLlegadaBase: viaje?.kmLlegadaBase ?? '',
    largo: viaje?.largo ?? '',
    ancho: viaje?.ancho ?? '',
    alto: viaje?.alto ?? '',
    peso: viaje?.peso ?? '',
    requiereEscolta: !!viaje?.requiereEscolta,
});

export function ViajeEditar() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const viajeId = parseInt(id || '0', 10);
    const canManageViajes = usePermission(PERMISSIONS.VIAJES.GESTIONAR);
    const isViewOnly = searchParams.get('mode') === 'view' || !canManageViajes;

    const [activeTab, setActiveTab] = useState(0);

    const [formData, setFormData] = useState<ResumenGeneralData>(() => createResumenGeneralData());

    const { data: viaje, isLoading, isError } = useQuery({
        queryKey: ['viaje', viajeId],
        queryFn: () => viajeApi.getById(viajeId),
        enabled: !!viajeId && viajeId > 0,
    });

    const options = useViajeOptions(true);
    const { tiposIncidente } = options;

    useEffect(() => {
        if (viaje) {
            const resetUiTimer = window.setTimeout(() => {
                setFormData(createResumenGeneralData(viaje));
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [viaje]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleFormDataChange = (changes: Partial<ResumenGeneralData>) => {
        setFormData(prev => ({ ...prev, ...changes }));
    };

    const updateMutation = useMutation({
        mutationFn: (data: UpdateViajeDto) => viajeApi.update(data.viajeID, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['viajes'] });
            queryClient.invalidateQueries({ queryKey: ['viaje', viajeId] });
            showToast({ entity: 'Viaje', action: 'update' });
            navigate('/app/viajes');
        },
        onError: () => {
            showToast({ entity: 'Viaje', action: 'update', isError: true });
        }
    });

    const handleSave = () => {
        if (!viaje) return;

        const payload: UpdateViajeDto = {
            viajeID: viaje.viajeID,
            cotizacionID: viaje.cotizacionID ?? null,
            clienteID: viaje.clienteID,
            tractoID: viaje.tractoID,
            carretaID: viaje.carretaID ?? null,
            colaboradorID: viaje.colaboradorID,
            origenID: viaje.origenID,
            destinoID: viaje.destinoID,
            direccionOrigen: viaje.direccionOrigen || undefined,
            direccionDestino: viaje.direccionDestino || undefined,
            fechaCarga: formData.fechaCarga ? formData.fechaCarga.format('YYYY-MM-DD') : viaje.fechaCarga,
            fechaPartida: formData.fechaPartida ? formData.fechaPartida.format('YYYY-MM-DD') : undefined,
            fechaLlegada: formData.fechaLlegada ? formData.fechaLlegada.format('YYYY-MM-DD') : undefined,
            fechaDescarga: formData.fechaDescarga ? formData.fechaDescarga.format('YYYY-MM-DD') : undefined,
            fechaLlegadaBase: formData.fechaLlegadaBase ? formData.fechaLlegadaBase.format('YYYY-MM-DD') : undefined,
            kmInicio: formData.kmInicio === '' ? undefined : formData.kmInicio,
            kmLlegada: formData.kmLlegada === '' ? undefined : formData.kmLlegada,
            kmLlegadaBase: formData.kmLlegadaBase === '' ? undefined : formData.kmLlegadaBase,
            estadoID: viaje.estadoID,
            requiereEscolta: formData.requiereEscolta,
            tipoMedidaID: viaje.tipoMedidaID,
            largo: formData.largo === '' ? undefined : formData.largo,
            alto: formData.alto === '' ? undefined : formData.alto,
            ancho: formData.ancho === '' ? undefined : formData.ancho,
            tipoPesoID: viaje.tipoPesoID,
            peso: formData.peso === '' ? undefined : formData.peso,
            ejesTracto: viaje.ejesTracto,
            ejesCarreta: viaje.ejesCarreta || undefined,
        };

        updateMutation.mutate(payload);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError || !viaje) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography color="error">Error al cargar los datos del viaje</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{marginBottom:'24px'}}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700} color="text.primary" sx={{letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1}}>
                            Edición de Viaje <Box component="span" sx={{color: 'text.secondary', fontWeight: 400}}>Codigo: {viaje.codigo || `#${viaje.viajeID}`}</Box>
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip label={viaje.estado?.nombre || ''} color="info" size="small" sx={{ fontWeight: 600, mr: 2 }} />
                    <Button onClick={() => navigate('/app/viajes')} variant="outlined" color="inherit" disabled={updateMutation.isPending}>
                        Volver
                    </Button>
                    {!isViewOnly && (
                        <Button variant="contained" color="primary" onClick={handleSave} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
                        </Button>
                    )}
                </Box>
            </Stack>

            <Paper sx={{ borderRadius: 3, boxShadow: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }} elevation={0}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1, bgcolor: 'background.paper' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        variant="scrollable" 
                        scrollButtons="auto"
                        sx={{ 
                            minHeight: 48,
                            '& .MuiTab-root': {
                                py: 2,
                                px: 4,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'text.secondary',
                                textTransform: 'none',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                }
                            },
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderTopLeftRadius: 3,
                                borderTopRightRadius: 3,
                            }
                        }}
                    >
                        <Tab label="Resumen General" />
                        <Tab label="Planificación de Ruta" />
                        <Tab label="Guías de Remisión" />
                        <Tab label="Costos" />
                        <Tab label="Incidentes" />
                        <Tab label="Permisos" />
                        <Tab label="Escolta" disabled={!formData.requiereEscolta} />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3, minHeight: '60vh'}}>
                    <TabPanel value={activeTab} index={0}>
                        <ResumenGeneralTab 
                            viaje={viaje}
                            formData={formData}
                            onChange={handleFormDataChange}
                            isViewOnly={isViewOnly}
                        />
                    </TabPanel>
                    <TabPanel value={activeTab} index={1}>
                        <PlanificacionRutaTab viaje={viaje} isViewOnly={isViewOnly} />
                    </TabPanel>
                    <TabPanel value={activeTab} index={2}>
                        <GuiasTab viaje={viaje} isViewOnly={isViewOnly} />
                    </TabPanel>
                    <TabPanel value={activeTab} index={3}>
                        <GastosTab viaje={viaje} isViewOnly={isViewOnly} />
                    </TabPanel>
                    <TabPanel value={activeTab} index={4}>
                        <Box sx={{p: 2}}>
                            <ViajeIncidente
                                viewOnly={isViewOnly}
                                tiposIncidente={tiposIncidente || []}
                                viajeId={viajeId}
                            />
                        </Box>
                    </TabPanel>
                    <TabPanel value={activeTab} index={5}>
                        <PermisosTab viaje={viaje} isViewOnly={isViewOnly} />
                    </TabPanel>
                    <TabPanel value={activeTab} index={6}>
                        <EscoltaTab viaje={viaje} isViewOnly={isViewOnly} />
                    </TabPanel>
                </Box>
            </Paper>
        </Box>
    );
}
