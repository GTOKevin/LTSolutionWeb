import type { SelectItem } from '@shared/model/types';
import type { Factura } from './types';
import { matchesCatalogCandidate } from '@entities/master-data/lib/catalog-utils';

export interface FacturaPaymentStatusMeta {
    label: string;
    color: 'default' | 'error' | 'info' | 'success' | 'warning';
}

export const FACTURA_STATUS_CODE = {
    GENERADO: 'GEN',
    EMITIDO: 'EMI',
    ENTREGADO: 'ENT',
    ANULADO: 'ANU',
} as const;

const FACTURA_STATUS = {
    GENERADO: [FACTURA_STATUS_CODE.GENERADO],
    EMITIDO: [FACTURA_STATUS_CODE.EMITIDO],
    ENTREGADO: [FACTURA_STATUS_CODE.ENTREGADO],
    ANULADO: [FACTURA_STATUS_CODE.ANULADO],
} as const;

export function isFacturaStatus(factura: Factura | null | undefined, candidates: readonly string[]) {
    const estadoCodigo = factura?.estado?.codigo;
    if (!estadoCodigo) {
        return false;
    }

    return matchesCatalogCandidate(estadoCodigo, candidates);
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
    if (isFacturaGenerada(factura)) {
        return 'warning';
    }

    if (isFacturaEmitida(factura)) {
        return 'info';
    }

    if (isFacturaEntregada(factura)) {
        return 'success';
    }

    if (isFacturaAnulada(factura)) {
        return 'error';
    }

    return 'default';
}

export function getFacturaPaymentStatusMeta(factura: Factura | null | undefined): FacturaPaymentStatusMeta {
    if ((factura?.saldoPendiente ?? 0) <= 0) {
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
