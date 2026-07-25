import { MaestrosPageContent, useMaestrosPageController } from '@features/tipo-maestro';

export function MaestrosPage() {
    const controller = useMaestrosPageController();
    return <MaestrosPageContent controller={controller} />;
}
