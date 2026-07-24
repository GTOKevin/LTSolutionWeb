import { RolesColaboradorPageContent, useRolesColaboradorPageController } from '@features/rol-colaborador/list';

export function RolesColaboradorPage() {
    const controller = useRolesColaboradorPageController();
    return <RolesColaboradorPageContent controller={controller} />;
}
