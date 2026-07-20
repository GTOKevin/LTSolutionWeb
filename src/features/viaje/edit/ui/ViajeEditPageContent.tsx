import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import type { UpdateViajeDto } from '@/entities/viaje/model/types';
import { useViajeIncidenteOptions } from '@features/viaje/options/hooks/useViajeScopedOptions';
import { useToast } from '@/shared/components/ui/Toast';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { createResumenGeneralDataFromViaje, getViajeEditTabs } from '../model/viaje-edit-tabs';
import type { ResumenGeneralData } from './tabs/ResumenGeneralTab';
import { ViajeEditShell } from '@widgets/viaje-workspace/ui/ViajeEditShell';
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
        queryKey: VIAJE_QUERY_KEYS.detail(viajeId),
        queryFn: () => viajeApi.getById(viajeId),
        enabled: !!viajeId && viajeId > 0,
    });

    const { tiposIncidente } = useViajeIncidenteOptions(true);

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
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.detail(viajeId) });
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
        <ViajeEditShell
            viajeCodigo={viaje.codigo || `#${viaje.viajeID}`}
            statusLabel={viaje.estado?.nombre || ''}
            activeTab={activeTab}
            onTabChange={(_, newValue) => setActiveTab(newValue)}
            tabs={tabs}
            onBack={() => navigate('/app/viajes')}
            onSave={handleSave}
            isSaving={updateMutation.isPending}
            isViewOnly={isViewOnly}
        >
            <ViajeEditContent
                activeTab={activeTab}
                viaje={viaje}
                formData={formData}
                onFormDataChange={(changes) => setFormData((prev) => ({ ...prev, ...changes }))}
                isViewOnly={isViewOnly}
                viajeId={viajeId}
                tiposIncidente={tiposIncidente || []}
            />
        </ViajeEditShell>
    );
}
