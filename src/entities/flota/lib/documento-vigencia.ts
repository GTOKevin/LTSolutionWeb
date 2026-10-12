import {
    getDocumentVigenciaMetaByExpirationDate,
    type DocumentVigenciaKey,
} from '@shared/utils/document-vigencia';

export interface FlotaDocumentoVigenciaVisual {
    key: DocumentVigenciaKey;
    label: string;
    tone: 'success' | 'warning' | 'error' | 'default';
}

/**
 * Única fuente de verdad del semáforo de vigencia de un documento de flota a
 * partir de su fecha de vencimiento. Reutilizada por el listado de documentos y
 * por el tab del expediente para evitar visuales divergentes.
 */
export function getFlotaDocumentoVigenciaVisual(fechaVencimiento?: string | null): FlotaDocumentoVigenciaVisual {
    if (!fechaVencimiento) {
        return { key: 'desconocido', label: 'Sin vencimiento', tone: 'default' };
    }

    const meta = getDocumentVigenciaMetaByExpirationDate(fechaVencimiento);
    const daysLeft = meta.daysLeft;

    if (meta.key === 'vencido') {
        return {
            key: 'vencido',
            tone: 'error',
            label: daysLeft != null ? `Vencido hace ${Math.abs(daysLeft)} días` : 'Vencido',
        };
    }

    if (meta.key === 'por_vencer') {
        return {
            key: 'por_vencer',
            tone: 'warning',
            label: daysLeft != null ? `Vence en ${daysLeft} días` : 'Vence pronto',
        };
    }

    if (daysLeft != null && daysLeft > 365) {
        return { key: 'vigente', tone: 'success', label: `Vigente • ${(daysLeft / 365).toFixed(1)} años` };
    }

    return {
        key: 'vigente',
        tone: 'success',
        label: daysLeft != null ? `Vigente • ${daysLeft} días` : 'Vigente',
    };
}
