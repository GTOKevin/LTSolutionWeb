export type DocumentVigenciaKey = 'vigente' | 'por_vencer' | 'vencido' | 'desconocido';

export interface DocumentVigenciaMeta {
    key: DocumentVigenciaKey;
    label: string;
    chipColor: 'success' | 'warning' | 'error' | 'default';
    bgColor: string;
    textColor: string;
}

function normalizeVigenciaEstado(value?: string | null) {
    return (value ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_');
}

export function getDocumentVigenciaMeta(value?: string | null): DocumentVigenciaMeta {
    const normalizedValue = normalizeVigenciaEstado(value);

    switch (normalizedValue) {
        case 'vigente':
            return {
                key: 'vigente',
                label: 'Vigente',
                chipColor: 'success',
                bgColor: 'success.50',
                textColor: 'success.main',
            };
        case 'por_vencer':
        case 'proximo_a_vencer':
        case 'vence_pronto':
            return {
                key: 'por_vencer',
                label: 'Proximo a vencer',
                chipColor: 'warning',
                bgColor: 'warning.50',
                textColor: 'warning.dark',
            };
        case 'vencido':
            return {
                key: 'vencido',
                label: 'Vencido',
                chipColor: 'error',
                bgColor: 'error.50',
                textColor: 'error.main',
            };
        default:
            return {
                key: 'desconocido',
                label: 'Sin estado',
                chipColor: 'default',
                bgColor: 'grey.100',
                textColor: 'text.secondary',
            };
    }
}

export function isDocumentVigente(value?: string | null) {
    return getDocumentVigenciaMeta(value).key === 'vigente';
}

export function isDocumentNearExpiry(value?: string | null) {
    return getDocumentVigenciaMeta(value).key === 'por_vencer';
}

export function isDocumentExpired(value?: string | null) {
    return getDocumentVigenciaMeta(value).key === 'vencido';
}
