import { MisViajeDetailPageContent, useMisViajeDetailPageController } from '@features/employee/viajes';

export function MisViajesDetallePage() {
    const controller = useMisViajeDetailPageController();

    return <MisViajeDetailPageContent controller={controller} />;
}
