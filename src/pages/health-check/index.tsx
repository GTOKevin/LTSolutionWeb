import { HealthCheckPageContent, useHealthCheckPageController } from '@features/health-check';

export function HealthCheckPage() {
    const controller = useHealthCheckPageController();
    return <HealthCheckPageContent controller={controller} />;
}
