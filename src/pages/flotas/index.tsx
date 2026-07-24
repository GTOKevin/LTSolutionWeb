import { FlotasPageContent, useFlotasPageController } from '@features/flota/list';

export function FlotasPage() {
    const controller = useFlotasPageController();
    return <FlotasPageContent controller={controller} />;
}
