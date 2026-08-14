import { SolicitudesDocumentosPageContent, useSolicitudesDocumentosPageController } from '@features/colaborador/solicitudes-documentos';

export function ColaboradorSolicitudesDocumentosPage() {
    const controller = useSolicitudesDocumentosPageController();

    return <SolicitudesDocumentosPageContent controller={controller} />;
}
