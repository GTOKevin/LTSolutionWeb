import { FacturasPageContent, useFacturasPageController } from '@features/factura/list';

export function FacturasPage() {
    const controller = useFacturasPageController();

    return <FacturasPageContent controller={controller} />;
}
