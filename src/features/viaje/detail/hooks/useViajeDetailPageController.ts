import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { createResumenGeneralDataFromViaje, type ResumenGeneralData } from '@features/viaje/edit';
import { useViajeIncidenteOptions } from '@features/viaje/options';
import { VIAJE_QUERY_KEYS } from '@features/viaje/model/query-keys';

const READ_ONLY_GENERAL_TAB_CHANGE: (changes: Partial<ResumenGeneralData>) => void = () => undefined;

interface UseViajeDetailPageControllerOptions {
    mode?: 'view';
}

export function useViajeDetailPageController({ mode = 'view' }: UseViajeDetailPageControllerOptions = {}) {
    const { id } = useParams<{ id: string }>();
    const viajeId = parseInt(id || '0', 10);
    const isViewOnly = mode === 'view';

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
