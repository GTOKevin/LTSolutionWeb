import { MisDocumentosPageContent, useMisDocumentosPageController } from '@features/employee/documentos';

export function MisDocumentosPage() {
    const controller = useMisDocumentosPageController();

    return <MisDocumentosPageContent controller={controller} />;
}
