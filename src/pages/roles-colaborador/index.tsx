import { useRolesColaboradorPageController } from '@features/rol-colaborador/list/hooks/useRolesColaboradorPageController';
import { RolesColaboradorPageContent } from '@features/rol-colaborador/list/ui/RolesColaboradorPageContent';

export function RolesColaboradorPage() {
    const controller = useRolesColaboradorPageController();
    return <RolesColaboradorPageContent controller={controller} />;
}
