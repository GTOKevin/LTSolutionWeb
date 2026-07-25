import { DashboardPageContent, useDashboardPageController } from '@features/dashboard';

export function DashboardPage() {
    const controller = useDashboardPageController();

    return <DashboardPageContent controller={controller} />;
}
