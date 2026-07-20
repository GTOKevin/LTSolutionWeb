import { useMaestrosPageController } from '@features/tipo-maestro/list/hooks/useMaestrosPageController';
import { MaestrosPageContent } from '@features/tipo-maestro/list/ui/MaestrosPageContent';

export function MaestrosPage() {
    const controller = useMaestrosPageController();
    return <MaestrosPageContent controller={controller} />;
}
