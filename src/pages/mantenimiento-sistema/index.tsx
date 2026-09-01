import { MantenimientoSistemaPageContent, useMantenimientoSistemaPageController } from '@features/mantenimiento-sistema';

export function MantenimientoSistemaPage() {
    const controller = useMantenimientoSistemaPageController();
    return <MantenimientoSistemaPageContent controller={controller} />;
}
