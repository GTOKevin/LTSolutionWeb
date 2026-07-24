import { RolesPageContent, useRolesPageController } from '@features/rol-usuario/list';

export function RolesPage() {
    const controller = useRolesPageController();
    return <RolesPageContent controller={controller} />;
}
