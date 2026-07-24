import { MisLicenciasPageContent, useMisLicenciasPageController } from '@features/employee/licencias';

export function MisLicenciasPage() {
    const controller = useMisLicenciasPageController();

    return <MisLicenciasPageContent controller={controller} />;
}
