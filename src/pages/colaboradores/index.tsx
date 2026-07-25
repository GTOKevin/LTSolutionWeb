import { ColaboradoresPageContent, useColaboradoresPageController } from '@features/colaborador';

export function ColaboradoresPage() {
    const controller = useColaboradoresPageController();
    return <ColaboradoresPageContent controller={controller} />;
}
