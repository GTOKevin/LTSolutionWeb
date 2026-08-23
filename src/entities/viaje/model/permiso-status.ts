import { getDocumentVigenciaMetaByExpirationDate } from '@/shared/utils/document-vigencia';

export interface ViajePermisoStatus {
    label: string;
    color: 'success' | 'warning' | 'error';
}

/**
 * Resolutor de vigencia de permisos de viaje.
 *
 * Delega en el resolutor compartido `getDocumentVigenciaMetaByExpirationDate`
 * (umbrales 30/90 días) para no mantener reglas de vigencia divergentes en el
 * sistema. Los permisos sin fecha de vencimiento se consideran vigentes.
 */
export function resolveViajePermisoStatus(fechaVencimiento?: string | null): ViajePermisoStatus {
    const meta = getDocumentVigenciaMetaByExpirationDate(fechaVencimiento);

    switch (meta.key) {
        case 'vencido':
            return {
                label: 'Vencido',
                color: 'error',
            };
        case 'por_vencer':
            return {
                label: meta.label, // 'Vence pronto' (<= 30 días) | 'Próximo a vencer' (<= 90 días)
                color: meta.chipColor === 'error' ? 'error' : 'warning',
            };
        case 'vigente':
            return {
                label: 'Vigente',
                color: 'success',
            };
        // Sin fecha de vencimiento: sin restricción de caducidad.
        default:
            return {
                label: 'Vigente',
                color: 'success',
            };
    }
}