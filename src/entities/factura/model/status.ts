import type { SelectItem } from '@shared/model/types';
import type { Factura } from './types';
import { getSelectItemId, matchesCatalogCandidate, matchesEstado } from '@entities/master-data/lib/catalog-utils';

const FACTURA_STATUS = {
    GENERADO: ['generado', 'registrada'],
    EMITIDO: ['emitido'],
    ENTREGADO: ['entregado'],
    ANULADO: ['anulado'],
} as const;

export function isFacturaStatus(factura: Factura | null | undefined, candidates: readonly string[]) {
    if (!factura) {
        return false;
    }

    return matchesEstado(factura.estado, candidates) || matchesCatalogCandidate(factura.estado?.nombre, candidates);
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
    return getSelectItemId(items, FACTURA_STATUS.GENERADO);
}

export function resolveFacturaEmitidaId(items: SelectItem[] | undefined) {
    return getSelectItemId(items, FACTURA_STATUS.EMITIDO);
}

export function resolveFacturaEntregadaId(items: SelectItem[] | undefined) {
    return getSelectItemId(items, FACTURA_STATUS.ENTREGADO);
}

export function resolveFacturaAnuladaId(items: SelectItem[] | undefined) {
    return getSelectItemId(items, FACTURA_STATUS.ANULADO);
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
