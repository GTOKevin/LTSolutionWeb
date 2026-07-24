import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthApi } from '@shared/api/health.api';
import { env } from '@shared/config/env';
import { appThemePresets, orderedAppThemeIds } from '@shared/config/theme/palette';
import { useThemeStore } from '@shared/store/theme.store';

function getHealthCheckErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'detail' in error && typeof error.detail === 'string') {
        return error.detail;
    }

    return 'No se pudo verificar el estado del backend.';
}

export function useHealthCheckPageController() {
    const { themeId, setThemeId } = useThemeStore();
    const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null);
    const themeMenuOpen = Boolean(themeAnchorEl);
    const themeOptions = useMemo(
        () => orderedAppThemeIds.map((id) => appThemePresets[id]),
        [],
    );

    const healthQuery = useQuery({
        queryKey: ['health-check'],
        queryFn: healthApi.check,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const apiStatus = healthQuery.isFetching
        ? 'checking'
        : healthQuery.isError
            ? 'error'
            : 'connected';

    const apiMessage = healthQuery.isError
        ? getHealthCheckErrorMessage(healthQuery.error)
        : healthQuery.data
            ? 'El endpoint de salud del backend responde correctamente.'
            : '';

    return {
        themeId,
        setThemeId,
        themeAnchorEl,
        setThemeAnchorEl,
        themeMenuOpen,
        themeOptions,
        apiStatus,
        apiMessage,
        checkApiConnection: healthQuery.refetch,
        isDev: env.isDev,
    };
}
