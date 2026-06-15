import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DASHBOARD_QUERY_KEYS, dashboardApi } from '@entities/dashboard/api/dashboard.api';
import type { DashboardOverviewParams, DashboardPeriod } from '@entities/dashboard/model/types';

const DEFAULT_OVERVIEW_PARAMS: Required<Pick<DashboardOverviewParams, 'recentViajes' | 'securityAlerts'>> = {
    recentViajes: 5,
    securityAlerts: 10,
};

export function useDashboardOverview(initialPeriod: DashboardPeriod = 'week') {
    const [period, setPeriod] = useState<DashboardPeriod>(initialPeriod);

    const params = useMemo<DashboardOverviewParams>(() => ({
        period,
        recentViajes: DEFAULT_OVERVIEW_PARAMS.recentViajes,
        securityAlerts: DEFAULT_OVERVIEW_PARAMS.securityAlerts,
    }), [period]);

    const query = useQuery({
        queryKey: DASHBOARD_QUERY_KEYS.overview(params),
        queryFn: () => dashboardApi.getOverview(params),
        placeholderData: previousData => previousData,
    });

    return {
        ...query,
        period,
        setPeriod,
    };
}
