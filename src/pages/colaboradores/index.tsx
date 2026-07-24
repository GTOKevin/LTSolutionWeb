import { ColaboradoresPageContent, useColaboradoresPageController } from '@features/colaborador/list';

export function ColaboradoresPage() {
    const controller = useColaboradoresPageController();
    return <ColaboradoresPageContent controller={controller} />;
}
