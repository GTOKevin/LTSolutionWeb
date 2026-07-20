import { ClientesPageContent, useClientesPageController } from '@features/cliente/list';

export function ClientesPage() {
    const controller = useClientesPageController();

    return <ClientesPageContent controller={controller} />;
}
