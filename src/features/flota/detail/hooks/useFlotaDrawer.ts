import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { Flota } from '@entities/flota/model/types';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';
import { APP_PATHS, buildAppDetailPath, buildAppExpedientePath } from '@shared/config/app-routes';

export function useFlotaDrawer() {
    const navigate = useNavigate();
    const [flota, setFlota] = useState<Flota | null>(null);
    const flotaId = flota?.flotaID ?? 0;
    const open = Boolean(flota);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.expediente(flotaId),
        queryFn: () => flotaApi.getExpediente(flotaId),
        enabled: open && flotaId > 0,
    });

    const openDrawer = useCallback((value: Flota) => {
        setFlota(value);
    }, []);

    const closeDrawer = useCallback(() => {
        setFlota(null);
    }, []);

    const handleEdit = useCallback(() => {
        if (flota) {
            navigate(buildAppDetailPath(APP_PATHS.flotas, flota.flotaID));
        }
    }, [flota, navigate]);

    const handleVerExpediente = useCallback(() => {
        if (flota) {
            navigate(buildAppExpedientePath(APP_PATHS.flotas, flota.flotaID));
        }
    }, [flota, navigate]);

    const handleProgramarTaller = useCallback(() => {
        if (flota) {
            navigate(`${APP_PATHS.mantenimientos}/nuevo?flotaID=${flota.flotaID}`);
        }
    }, [flota, navigate]);

    return {
        flota,
        open,
        openDrawer,
        closeDrawer,
        expediente: data,
        isLoading,
        isError,
        refetch,
        handleEdit,
        handleVerExpediente,
        handleProgramarTaller,
    };
}
