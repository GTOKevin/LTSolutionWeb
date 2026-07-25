import { UsuariosPageContent, useUsuariosPageController } from '@features/usuario';

export function UsuariosPage() {
    const controller = useUsuariosPageController();

    return <UsuariosPageContent controller={controller} />;
}
