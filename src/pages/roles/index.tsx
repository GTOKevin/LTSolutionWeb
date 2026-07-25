import { RolesPageContent, useRolesPageController } from '@features/rol-usuario';

export function RolesPage() {
    const controller = useRolesPageController();
    return <RolesPageContent controller={controller} />;
}
