import { SolicitudesLicenciasPageContent, useSolicitudesLicenciasPageController } from '@features/colaborador/solicitudes-licencias';

export function SolicitudesLicenciasPage() {
    const controller = useSolicitudesLicenciasPageController();

    return <SolicitudesLicenciasPageContent controller={controller} />;
}