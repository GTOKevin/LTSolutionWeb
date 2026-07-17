import { useGastoPageController } from '@features/gasto/list/hooks/useGastoPageController';
import { GastoPageContent } from '@features/gasto/list/ui/GastoPageContent';

export function GastoPage() {
    const controller = useGastoPageController();
    return <GastoPageContent controller={controller} />;
}
