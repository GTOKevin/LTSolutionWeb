import { useRolesPageController } from '@features/rol-usuario/list/hooks/useRolesPageController';
import { RolesPageContent } from '@features/rol-usuario/list/ui/RolesPageContent';

export function RolesPage() {
    const controller = useRolesPageController();
    return <RolesPageContent controller={controller} />;
}
