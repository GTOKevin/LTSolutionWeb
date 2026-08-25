import type { SelectItem } from '@shared/model/types';
import type { Factura } from './types';
import { matchesCatalogCandidate } from '@entities/master-data/lib/catalog-utils';

export interface FacturaPaymentStatusMeta {
    label: string;
    color: 'default' | 'error' | 'info' | 'success' | 'warning';
}

export type FacturaDateField = 'compromiso' | 'vencimiento';

export const FACTURA_STATUS_CODE = {
    GENERADO: 'GEN',
    EMITIDO: 'EMI',
    ENTREGADO: 'ENT',
    ANULADO: 'ANU',
} as const;

/**
 * Candidatos por estado de factura (código del catálogo + nombre visible explícito).
 * Sigue el patrón `VIAJE_STATUS_CODES` del módulo viaje: la semántica se resuelve
 * por código (`estado.codigo`) y, solo como respaldo cuando el backend omite el código
 * (p. ej. `GET /factura/{id}/reporte` hoy solo envía `estado.nombre`), se compara contra
 * esta lista explícita de nombres. Nunca se infiere por substrings del label visible.
 */
const FACTURA_STATUS = {
    GENERADO: [FACTURA_STATUS_CODE.GENERADO, 'generado'],
    EMITIDO: [FACTURA_STATUS_CODE.EMITIDO, 'emitido'],
    ENTREGADO: [FACTURA_STATUS_CODE.ENTREGADO, 'entregado'],
    ANULADO: [FACTURA_STATUS_CODE.ANULADO, 'anulado', 'cancelado'],
} as const;

export function isFacturaStatus(factura: Factura | null | undefined, candidates: readonly string[]) {
    if (!factura?.estado) {
        return false;
    }

    return matchesCatalogCandidate(factura.estado.codigo, candidates)
        || matchesCatalogCandidate(factura.estado.nombre, candidates);
}

export function isFacturaGenerada(factura: Factura | null | undefined) {
    return isFacturaStatus(factura, FACTURA_STATUS.GENERADO);
}

export function isFacturaEmitida(factura: Factura | null | undefined) {
    return isFacturaStatus(factura, FACTURA_STATUS.EMITIDO);
}

export function isFacturaEntregada(factura: Factura | null | undefined) {
    return isFacturaStatus(factura, FACTURA_STATUS.ENTREGADO);
}

export function isFacturaAnulada(factura: Factura | null | undefined) {
    return isFacturaStatus(factura, FACTURA_STATUS.ANULADO);
}

export function resolveFacturaGeneradaId(items: SelectItem[] | undefined) {
    return items?.find((item) => matchesCatalogCandidate(item.extra, FACTURA_STATUS.GENERADO))?.id;
}

export function resolveFacturaEmitidaId(items: SelectItem[] | undefined) {
    return items?.find((item) => matchesCatalogCandidate(item.extra, FACTURA_STATUS.EMITIDO))?.id;
}

export function resolveFacturaEntregadaId(items: SelectItem[] | undefined) {
    return items?.find((item) => matchesCatalogCandidate(item.extra, FACTURA_STATUS.ENTREGADO))?.id;
}

export function resolveFacturaAnuladaId(items: SelectItem[] | undefined) {
    return items?.find((item) => matchesCatalogCandidate(item.extra, FACTURA_STATUS.ANULADO))?.id;
}

export function getFacturaStatusColor(factura: Factura | null | undefined) {
    return getFacturaStatusMeta(factura).color;
}

/**
 * Meta única del estado del documento de factura (color + label canónico).
 * Se resuelve desde `estado.codigo` (map centralizado) y nunca del label visible.
 * Cuando no hay estado (o el código no pertenece al flujo canónico) devuelve un
 * placeholder honesto (`Sin estado`) en vez de un valor de negocio inventado.
 */
export function getFacturaStatusMeta(factura: Factura | null | undefined): FacturaPaymentStatusMeta {
    if (isFacturaGenerada(factura)) {
        return { label: 'Generado', color: 'warning' };
    }

    if (isFacturaEmitida(factura)) {
        return { label: 'Emitido', color: 'info' };
    }

    if (isFacturaEntregada(factura)) {
        return { label: 'Entregado', color: 'success' };
    }

    if (isFacturaAnulada(factura)) {
        return { label: 'Anulado', color: 'error' };
    }

    return { label: 'Sin estado', color: 'default' };
}

/**
 * Meta del estado de un abono (pago).
 * Limitación documentada: `GET /factura/{id}/reporte` solo envía `estadoNombre` para
 * los pagos (sin objeto `estado` con código). Este es el ÚNICO punto de mapeo
 * nombre → color del módulo, con lista explícita de candidatos y placeholder honesto:
 * nunca se muestra «Acreditado» como fallback.
 */
export function getFacturaPagoStatusMeta(estadoNombre: string | null | undefined): FacturaPaymentStatusMeta {
    if (!estadoNombre?.trim()) {
        return { label: 'Sin estado', color: 'default' };
    }

    if (matchesCatalogCandidate(estadoNombre, ['acreditado', 'acred'])) {
        return { label: estadoNombre, color: 'success' };
    }

    if (matchesCatalogCandidate(estadoNombre, ['pendiente', 'pend'])) {
        return { label: estadoNombre, color: 'warning' };
    }

    if (matchesCatalogCandidate(estadoNombre, ['rechazado', 'recha', 'anulado', 'anul'])) {
        return { label: estadoNombre, color: 'error' };
    }

    return { label: estadoNombre, color: 'default' };
}

export function getFacturaPaymentStatusMeta(factura: Factura | null | undefined): FacturaPaymentStatusMeta {
    if (isFacturaAnulada(factura)) {
        return { label: 'Anulada', color: 'default' };
    }

    if ((factura?.saldoPendiente ?? 0) <= 0 && (isFacturaStatus(factura, FACTURA_STATUS.ENTREGADO) || isFacturaStatus(factura, FACTURA_STATUS.EMITIDO))) {
        return { label: 'Pagado', color: 'success' };
    }

    if (factura?.esVencida) {
        return { label: 'Vencida', color: 'error' };
    }

    if (factura?.esCompromisoVencido) {
        return { label: 'Compromiso expirado', color: 'warning' };
    }

    return { label: 'Pendiente', color: 'info' };
}

export function getFacturaDateColor(
    factura: Factura | null | undefined,
    field: FacturaDateField,
    defaultColor: 'text.primary' | 'text.secondary' = 'text.secondary'
) {
    if (field === 'compromiso' && factura?.esCompromisoVencido) {
        return 'warning.main';
    }

    if (field === 'vencimiento' && factura?.esVencida) {
        return 'error.main';
    }

    return defaultColor;
}
