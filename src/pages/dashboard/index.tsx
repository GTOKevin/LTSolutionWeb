import { useDashboardPageController } from '@features/dashboard';
import { DashboardOverview } from '@widgets/dashboard';

export function DashboardPage() {
    const controller = useDashboardPageController();

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
