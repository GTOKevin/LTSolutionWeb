import { MantenimientosPageContent, useMantenimientos } from '@features/mantenimiento/list';

export function MantenimientosPage() {
    const controller = useMantenimientos();

    return <MantenimientosPageContent controller={controller} />;
}
