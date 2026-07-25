import { FacturasPageContent, useFacturasPageController } from '@features/factura';

export function FacturasPage() {
    const controller = useFacturasPageController();

    return <FacturasPageContent controller={controller} />;
}
