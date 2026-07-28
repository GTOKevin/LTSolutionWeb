import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { createResumenGeneralDataFromViaje, type ResumenGeneralData } from '@features/viaje/edit';
import { useViajeIncidenteOptions } from '@features/viaje/options';
import { VIAJE_QUERY_KEYS } from '@features/viaje/model/query-keys';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';

const READ_ONLY_GENERAL_TAB_CHANGE: (changes: Partial<ResumenGeneralData>) => void = () => undefined;

export function useViajeDetailPageController() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const viajeId = parseInt(id || '0', 10);
    const canManageViajes = usePermission(PERMISSIONS.VIAJES.GESTIONAR);
    const isViewOnly = searchParams.get('mode') === 'view' || !canManageViajes;

    const { data: viaje, isLoading, isError } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.detail(viajeId),
        queryFn: () => viajeApi.getById(viajeId),
        enabled: !!viajeId && viajeId > 0,
    });

    const { tiposIncidente } = useViajeIncidenteOptions(true);

    const resumenGeneralData = useMemo(
        () => createResumenGeneralDataFromViaje(viaje),
        [viaje]
    );

    return {
        viajeId,
        viaje,
        isLoading,
        isError,
        isViewOnly,
        tiposIncidente: tiposIncidente || [],
        resumenGeneralData,
        onReadOnlyGeneralTabChange: READ_ONLY_GENERAL_TAB_CHANGE,
    };
}
