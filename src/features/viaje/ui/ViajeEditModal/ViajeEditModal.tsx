import { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Box, Tabs, Tab, IconButton, Typography, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import type { ViajeListItem, UpdateViajeDto } from '@/entities/viaje/model/types';
import dayjs from 'dayjs';

import { ResumenGeneralTab, type ResumenGeneralData } from './tabs/ResumenGeneralTab';
import { PlanificacionRutaTab } from './tabs/PlanificacionRutaTab';
import { GuiasTab } from './tabs/GuiasTab';
import { PermisosTab } from './tabs/PermisosTab';
import { GastosTab } from './tabs/GastosTab';
import { EscoltaTab } from './tabs/EscoltaTab';

interface ViajeEditModalProps {
    open: boolean;
    onClose: () => void;
    viajeListItem: ViajeListItem | null;
}

export function ViajeEditModal({ open, onClose, viajeListItem }: ViajeEditModalProps) {
    const [activeTab, setActiveTab] = useState(0);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<ResumenGeneralData>({
        fechaPartida: null,
        fechaLlegada: null,
        kmInicio: '',
        kmLlegada: '',
        largo: '',
        ancho: '',
        alto: '',
        peso: '',
        requiereEscolta: false,
    });

    const { data: viaje, isLoading } = useQuery({
        queryKey: ['viaje', viajeListItem?.viajeID],
        queryFn: () => viajeApi.getById(viajeListItem!.viajeID),
        enabled: !!viajeListItem && open,
    });

    useEffect(() => {
        if (viaje) {
            setFormData({
                fechaPartida: viaje.fechaPartida ? dayjs(viaje.fechaPartida) : null,
                fechaLlegada: viaje.fechaLlegada ? dayjs(viaje.fechaLlegada) : null,
                kmInicio: viaje.kmInicio ?? '',
                kmLlegada: viaje.kmLlegada ?? '',
                largo: viaje.largo ?? '',
                ancho: viaje.ancho ?? '',
                alto: viaje.alto ?? '',
                peso: viaje.peso ?? '',
                requiereEscolta: !!viaje.requiereEscolta,
            });
        }
    }, [viaje]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleFormDataChange = (changes: Partial<ResumenGeneralData>) => {
        setFormData(prev => ({ ...prev, ...changes }));
    };

    const updateMutation = useMutation({
        mutationFn: (data: UpdateViajeDto) => viajeApi.update(data.viajeID, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['viajes'] });
            queryClient.invalidateQueries({ queryKey: ['viaje', viajeListItem?.viajeID] });
            onClose();
        }
    });

    const handleSave = () => {
        if (!viaje) return;

        const payload: UpdateViajeDto = {
            viajeID: viaje.viajeID,
            cotizacionID: viaje.cotizacionID || undefined,
            clienteID: viaje.clienteID,
            tractoID: viaje.tractoID,
            carretaID: viaje.carretaID || 0, // 0 if null, assuming backend handles or ignores if 0
            colaboradorID: viaje.colaboradorID,
            origenID: viaje.origenID,
            destinoID: viaje.destinoID,
            direccionOrigen: viaje.direccionOrigen || undefined,
            direccionDestino: viaje.direccionDestino || undefined,
            fechaCarga: viaje.fechaCarga,
            fechaPartida: formData.fechaPartida ? formData.fechaPartida.format('YYYY-MM-DD') : undefined,
            fechaLlegada: formData.fechaLlegada ? formData.fechaLlegada.format('YYYY-MM-DD') : undefined,
            fechaDescarga: viaje.fechaDescarga || undefined,
            fechaLlegadaBase: viaje.fechaLlegadaBase || undefined,
            kmInicio: formData.kmInicio === '' ? undefined : formData.kmInicio,
            kmLlegada: formData.kmLlegada === '' ? undefined : formData.kmLlegada,
            kmLlegadaBase: viaje.kmLlegadaBase || undefined,
            estadoID: viaje.estadoID,
            requiereEscolta: formData.requiereEscolta,
            requierePermiso: viaje.requierePermiso || undefined,
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

    if (!viajeListItem) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    Modificar Viaje: {viajeListItem.codigo}
                </Typography>
                <IconButton aria-label="close" onClick={onClose} sx={{ color: 'text.secondary' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        variant="scrollable" 
                        scrollButtons="auto"
                        sx={{ minHeight: 48 }}
                    >
                        <Tab label="Resumen General" />
                        <Tab label="Planificación de Ruta" />
                        <Tab label="Guías" />
                        <Tab label="Permisos" />
                        <Tab label="Gastos" />
                        <Tab label="Escolta" disabled={!formData.requiereEscolta} />
                    </Tabs>
                </Box>

                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, bgcolor: 'background.default' }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : viaje ? (
                        <>
                            <TabPanel value={activeTab} index={0}>
                                <ResumenGeneralTab 
                                    viajeListItem={viajeListItem}
                                    formData={formData}
                                    onChange={handleFormDataChange}
                                />
                            </TabPanel>
                            <TabPanel value={activeTab} index={1}>
                                <PlanificacionRutaTab viaje={viaje} />
                            </TabPanel>
                            <TabPanel value={activeTab} index={2}>
                                <GuiasTab viaje={viaje} />
                            </TabPanel>
                            <TabPanel value={activeTab} index={3}>
                                <PermisosTab viaje={viaje} />
                            </TabPanel>
                            <TabPanel value={activeTab} index={4}>
                                <GastosTab viaje={viaje} />
                            </TabPanel>
                            <TabPanel value={activeTab} index={5}>
                                <EscoltaTab viaje={viaje} />
                            </TabPanel>
                        </>
                    ) : (
                        <Typography color="error">Error al cargar los datos del viaje</Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Button onClick={onClose} variant="outlined" color="inherit" disabled={updateMutation.isPending}>
                    Cancelar
                </Button>
                <Button variant="contained" color="primary" onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
