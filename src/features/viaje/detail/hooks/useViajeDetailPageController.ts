import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { useViajeIncidenteOptions } from '@features/viaje/options';
import { VIAJE_QUERY_KEYS } from '@features/viaje/model/query-keys';

interface UseViajeDetailPageControllerOptions {
    mode?: 'view';
}

export function useViajeDetailPageController({ mode = 'view' }: UseViajeDetailPageControllerOptions = {}) {
    const { id } = useParams<{ id: string }>();
    const viajeId = parseInt(id || '0', 10);
    const isViewOnly = mode === 'view';

    const { data: viaje, isLoading, isError, error } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.detail(viajeId),
        queryFn: () => viajeApi.getDetail(viajeId),
        enabled: !!viajeId && viajeId > 0,
    });

    const { tiposIncidente } = useViajeIncidenteOptions(true);

    return {
        viajeId,
        viaje,
        isLoading,
        isError,
        error,
        isViewOnly,
        tiposIncidente: tiposIncidente || [],
    };
}
