import { useEffect } from 'react';
import { useLayoutStore } from '@shared/store/layout.store';
import { useDashboardOverview } from '@features/dashboard';
import { DashboardOverview } from '@widgets/dashboard';

export function DashboardPage() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
        period,
        setPeriod,
    } = useDashboardOverview();

    useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

    return (
        <DashboardOverview
            data={data}
            period={period}
            onPeriodChange={setPeriod}
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            onRetry={() => {
                void refetch();
            }}
        />
    );
}
