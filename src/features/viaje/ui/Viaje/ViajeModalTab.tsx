import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Tabs, Tab } from '@mui/material';
import { FormProvider } from 'react-hook-form';
import type { Viaje } from '@/entities/viaje/model/types';
import { TabPanel } from '@/shared/components/ui/TabPanel';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { ViajeCreateEdit } from './ViajeCreateEdit';
import { ViajeMercaderia } from '../ViajeMercaderia/Index';
import { ViajeGasto } from '../ViajeGasto/Index';
import { ViajeGuia } from '../ViajeGuia/Index';
import { ViajeIncidente } from '../ViajeIncidente/Index';
import { ViajePermiso } from '../ViajePermiso/Index';
import { ViajeEscolta } from '../ViajeEscolta/Index';
import { ESTADO_VIAJE_ID } from '@/shared/constants/constantes';
import { useViajeForm, TAB_INDICES } from '../../hooks/useViajeForm';

interface Props {
    open: boolean;
    onClose: () => void;
    viaje?: Viaje | null;
    isViewOnly?: boolean;
}

export function ViajeModalTab({ open, onClose, viaje, isViewOnly = false }: Props) {
    const {
        methods,
        activeTab,
        handleTabChange,
        onSubmit,
        showConfirmDialog,
        setShowConfirmDialog,
        pendingData,
        handleConfirmSave,
        mutation,
        options,
        requiereEscolta,
        requierePermiso,
        currentViajeId
    } = useViajeForm({ open, onClose, viaje });

    const { 
        flotasEscolta, colaboradores, 
        tiposMedida, tiposPeso, tiposGasto, monedas,
        tiposGuia, tiposIncidente, mercaderias
    } = options;

    const { handleSubmit } = methods;

    return (
        <Dialog open={open} maxWidth="xl" fullWidth>
            <DialogTitle>{viaje ? (isViewOnly ? 'Detalle de Viaje' : 'Editar Viaje') : 'Nuevo Viaje'}</DialogTitle>
            <DialogContent>
                <FormProvider {...methods}>
                    <form id="viaje-form" onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                                <Tab label="General" value={TAB_INDICES.GENERAL} />
                                <Tab label="Mercadería" value={TAB_INDICES.MERCADERIA} />
                                <Tab label="Guías" value={TAB_INDICES.GUIAS} />
                                <Tab label="Gastos" value={TAB_INDICES.GASTOS} />
                                <Tab label="Incidentes" value={TAB_INDICES.INCIDENTES} />
                                {requierePermiso && <Tab label="Permisos" value={TAB_INDICES.PERMISOS} />}
                                {requiereEscolta && <Tab label="Escolta" value={TAB_INDICES.ESCOLTA} />}
                            </Tabs>
                        </Box>

                        <TabPanel value={activeTab} index={TAB_INDICES.GENERAL}>
                            <ViajeCreateEdit 
                                viaje={viaje} 
                                isViewOnly={isViewOnly} 
                                options={options}
                                isPending={mutation.isPending}
                            />
                        </TabPanel>

                        <TabPanel value={activeTab} index={TAB_INDICES.MERCADERIA}>
                            <ViajeMercaderia 
                                viewOnly={isViewOnly} 
                                tiposMedida={tiposMedida || []} 
                                tiposPeso={tiposPeso || []} 
                                mercaderias={mercaderias || []}
                                viajeId={currentViajeId}
                            />
                        </TabPanel>

                        <TabPanel value={activeTab} index={TAB_INDICES.GUIAS}>
                            <ViajeGuia
                                viewOnly={isViewOnly}
                                tiposGuia={tiposGuia || []}
                                viajeId={currentViajeId}
                            />
                        </TabPanel>

                        <TabPanel value={activeTab} index={TAB_INDICES.GASTOS}>
                            <ViajeGasto 
                                viewOnly={isViewOnly} 
                                tiposGasto={tiposGasto || []} 
                                monedas={monedas || []}
                                viajeId={currentViajeId}
                            />
                        </TabPanel>

                        <TabPanel value={activeTab} index={TAB_INDICES.INCIDENTES}>
                            <ViajeIncidente
                                viewOnly={isViewOnly}
                                tiposIncidente={tiposIncidente || []}
                                viajeId={currentViajeId}
                            />
                        </TabPanel>

                        {requierePermiso && (
                            <TabPanel value={activeTab} index={TAB_INDICES.PERMISOS}>
                                <ViajePermiso viajeId={currentViajeId} viewOnly={isViewOnly} />
                            </TabPanel>
                        )}

                        {requiereEscolta && (
                            <TabPanel value={activeTab} index={TAB_INDICES.ESCOLTA}>
                                <ViajeEscolta 
                                    viewOnly={isViewOnly} 
                                    viajeId={currentViajeId}
                                    flotas={flotasEscolta || []}
                                    colaboradores={colaboradores || []}
                                />
                            </TabPanel>
                        )}
                    </form>
                </FormProvider>
            </DialogContent>
            <DialogActions>
                <Button  onClick={onClose} variant="contained" color="inherit" >Cerrar</Button>
            </DialogActions>

            <ConfirmDialog
                open={showConfirmDialog}
                severity={pendingData?.estadoID === ESTADO_VIAJE_ID.CANCELADO ? 'error' : 'info'}
                title={pendingData?.estadoID === ESTADO_VIAJE_ID.CANCELADO ? 'Confirmar Cancelación' : 'Confirmar Finalización'}
                content={pendingData?.estadoID === ESTADO_VIAJE_ID.CANCELADO 
                    ? "Una vez cancelado el viaje no podrá editarse." 
                    : "Una vez completado el registro no podrá editarse, ¿desea continuar con el registro?"}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirmSave}
                isLoading={mutation.isPending}
            />
        </Dialog>
    );
}
