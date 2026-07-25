import { RolesColaboradorPageContent, useRolesColaboradorPageController } from '@features/rol-colaborador';

export function RolesColaboradorPage() {
    const controller = useRolesColaboradorPageController();
    return <RolesColaboradorPageContent controller={controller} />;
}
