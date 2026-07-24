import { GastoPageContent, useGastoPageController } from '@features/gasto/list';

export function GastoPage() {
    const controller = useGastoPageController();
    return <GastoPageContent controller={controller} />;
}
