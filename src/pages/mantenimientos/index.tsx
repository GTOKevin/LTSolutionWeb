import { MantenimientosPageContent, useMantenimientos } from '@features/mantenimiento';

export function MantenimientosPage() {
    const controller = useMantenimientos();

    return <MantenimientosPageContent controller={controller} />;
}
