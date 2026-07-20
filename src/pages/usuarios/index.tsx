import { UsuariosPageContent, useUsuariosPageController } from '@features/usuario/list';

export function UsuariosPage() {
    const controller = useUsuariosPageController();

    return <UsuariosPageContent controller={controller} />;
}
