import { MisViajesPageContent, useMisViajesPageController } from '@features/employee/viajes';

export function MisViajesPage() {
    const controller = useMisViajesPageController();

    return <MisViajesPageContent controller={controller} />;
}
