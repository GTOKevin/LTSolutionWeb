import { ClientesPageContent, useClientesPageController } from '@features/cliente';

export function ClientesPage() {
    const controller = useClientesPageController();

    return <ClientesPageContent controller={controller} />;
}
