import { MisPagosPageContent, useMisPagosPageController } from '@features/employee/pagos';

export function MisPagosPage() {
    const controller = useMisPagosPageController();

    return <MisPagosPageContent controller={controller} />;
}
