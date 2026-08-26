import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { APP_PATHS } from '@shared/config/app-routes';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import type { UpdateViajeDto } from '@/entities/viaje/model/types';
import { estadoApi } from '@entities/estado/api/estado.api';
import { ESTADO_SECTIONS } from '@entities/master-data/model/constants';
import { useViajeIncidenteOptions } from '@features/viaje/options/hooks/useViajeScopedOptions';
import { useViajeEstadoTransition, type ViajeEstadoTransitionSource } from '@features/viaje/list/hooks/useViajeEstadoTransition';
import { useToast } from '@/shared/components/ui/Toast';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { createResumenGeneralDataFromViaje, getViajeEditTabs } from '../model/viaje-edit-tabs';
import type { ResumenGeneralData } from '../model/viaje-edit-tabs';
import { ViajeEditShell } from './ViajeEditShell';
import { VIAJE_QUERY_KEYS } from '@features/viaje/model/query-keys';
import { ViajeEditContent } from './ViajeEditContent';

export function ViajeEditPageContent() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const viajeId = parseInt(id || '0', 10);
    const canManageViajes = usePermission(PERMISSIONS.VIAJES.GESTIONAR);
    const isViewOnly = searchParams.get('mode') === 'view' || !canManageViajes;
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState<ResumenGeneralData>(() => createResumenGeneralDataFromViaje());
    const tabs = getViajeEditTabs({ requiereEscolta: formData.requiereEscolta });

    const { data: viaje, isLoading, isError } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.edit(viajeId),
        queryFn: () => viajeApi.getById(viajeId),
        enabled: !!viajeId && viajeId > 0,
    });

    const { tiposIncidente } = useViajeIncidenteOptions(true);

    const { modals, handleAdvanceEstado, getNextEstadoLabel, getNextEstadoAvailable } = useViajeEstadoTransition();

    const { data: viajeEstados } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.estados(),
        queryFn: async () => (await estadoApi.getSelect('', 20, ESTADO_SECTIONS.VIAJE)) ?? [],
    });

    useEffect(() => {
        if (viaje) {
            const resetUiTimer = window.setTimeout(() => {
                setFormData(createResumenGeneralDataFromViaje(viaje));
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [viaje]);

    const updateMutation = useMutation({
        mutationFn: (data: UpdateViajeDto) => viajeApi.update(data.viajeID, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.edit(viajeId) });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.detail(viajeId) });
            showToast({ entity: 'Viaje', action: 'update' });
        },
        onError: () => {
            showToast({ entity: 'Viaje', action: 'update', isError: true });
        }
    });

    const handleSave = () => {
        if (!viaje) return;

        // Guard explícito: nunca enviar `estadoID: 0`. Si el formulario no proyectó
        // un estado (ni siquiera el del viaje), se bloquea el guardado.
        const estadoID = formData.estadoID || viaje.estadoID;
        if (!estadoID) {
            showToast({ entity: 'Viaje', action: 'update', isError: true, message: 'El viaje no tiene un estado válido para guardar.' });
            return;
        }

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
            estadoID,
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

    const estadoSource: ViajeEstadoTransitionSource = {
        viajeID: viaje.viajeID,
        cerrado: viaje.cerrado ?? false,
        estadoCodigo: viaje.estado?.codigo,
        fechaPartida: viaje.fechaPartida,
        fechaDescarga: viaje.fechaDescarga,
    };
    const nextEstadoLabel = getNextEstadoLabel(estadoSource);
    const canShowAdvance =
        canManageViajes && !isViewOnly && !estadoSource.cerrado && Boolean(getNextEstadoAvailable(estadoSource));

    return (
        <>
            <ViajeEditShell
                viajeCodigo={viaje.codigo || `#${viaje.viajeID}`}
                statusLabel={viaje.estado?.nombre || ''}
                activeTab={activeTab}
                onTabChange={(_, newValue) => setActiveTab(newValue)}
                tabs={tabs}
                onBack={() => navigate(APP_PATHS.viajes)}
                headerActions={
                    canShowAdvance ? (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => handleAdvanceEstado(estadoSource)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                            Pasar a {nextEstadoLabel}
                        </Button>
                    ) : undefined
                }
            >
                <ViajeEditContent
                    activeTab={activeTab}
                    viaje={viaje}
                    formData={formData}
                    onFormDataChange={(changes) => setFormData((prev) => ({ ...prev, ...changes }))}
                    onSaveResumen={handleSave}
                    isSavingResumen={updateMutation.isPending}
                    isViewOnly={isViewOnly}
                    canGestionar={canManageViajes}
                    viajeId={viajeId}
                    tiposIncidente={tiposIncidente || []}
                    viajeEstados={viajeEstados}
                />
            </ViajeEditShell>

            {modals}
        </>
    );
}
