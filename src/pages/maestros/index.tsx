import { MaestrosPageContent, useMaestrosPageController } from '@features/tipo-maestro/list';

export function MaestrosPage() {
    const controller = useMaestrosPageController();
    return <MaestrosPageContent controller={controller} />;
}
