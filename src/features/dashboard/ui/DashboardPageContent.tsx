import { DashboardOverview } from '@widgets/dashboard';
import type { useDashboardPageController } from '../hooks/useDashboardPageController';

interface DashboardPageContentProps {
    controller: ReturnType<typeof useDashboardPageController>;
}

export function DashboardPageContent({ controller }: DashboardPageContentProps) {
    return (
        <DashboardOverview
            data={controller.data}
            period={controller.period}
            onPeriodChange={controller.setPeriod}
            isLoading={controller.isLoading}
            isFetching={controller.isFetching}
            isError={controller.isError}
            onRetry={() => {
                void controller.refetch();
            }}
        />
    );
}
