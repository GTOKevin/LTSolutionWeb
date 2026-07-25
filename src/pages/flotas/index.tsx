import { FlotasPageContent, useFlotasPageController } from '@features/flota';

export function FlotasPage() {
    const controller = useFlotasPageController();
    return <FlotasPageContent controller={controller} />;
}
