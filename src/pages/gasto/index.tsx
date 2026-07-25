import { GastoPageContent, useGastoPageController } from '@features/gasto';

export function GastoPage() {
    const controller = useGastoPageController();
    return <GastoPageContent controller={controller} />;
}
