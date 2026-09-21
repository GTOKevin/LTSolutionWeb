import { matchesCatalogCandidate } from '@entities/master-data/lib/catalog-utils';
import {
    TIPO_DETALLE_CODES,
    TIPO_DETALLE_LABELS,
    type TipoDetalleCodigo,
} from './constants';
import type { FacturaDetalle } from './types';

type DetalleConceptoInput = Pick<FacturaDetalle, 'tipoDetalleCodigo' | 'viajeID'> | null | undefined;

type DetalleReferenciaInput = Pick<
    FacturaDetalle,
    'tipoDetalleCodigo' | 'viajeID' | 'flotaPlaca' | 'codigo'
> & { viajeCodigo?: string | null };


export function resolveFacturaDetalleConcepto(detalle: DetalleConceptoInput): TipoDetalleCodigo {
    if (matchesCatalogCandidate(detalle?.tipoDetalleCodigo, [TIPO_DETALLE_CODES.FLETE])) {
        return TIPO_DETALLE_CODES.FLETE;
    }

    if (matchesCatalogCandidate(detalle?.tipoDetalleCodigo, [TIPO_DETALLE_CODES.SOBRESTADIA])) {
        return TIPO_DETALLE_CODES.SOBRESTADIA;
    }

    return detalle?.viajeID ? TIPO_DETALLE_CODES.FLETE : TIPO_DETALLE_CODES.SOBRESTADIA;
}

export function isSobrestadiaDetalle(detalle: DetalleConceptoInput): boolean {
    return resolveFacturaDetalleConcepto(detalle) === TIPO_DETALLE_CODES.SOBRESTADIA;
}

export function getFacturaDetalleConceptoLabel(detalle: DetalleConceptoInput): string {
    return TIPO_DETALLE_LABELS[resolveFacturaDetalleConcepto(detalle)];
}


export function getFacturaDetalleReferencia(
    detalle: DetalleReferenciaInput,
    options?: { preferViajeCodigo?: boolean }
): string {
    if (isSobrestadiaDetalle(detalle)) {
        return detalle.flotaPlaca || '-';
    }

    const codigo = options?.preferViajeCodigo
        ? detalle.viajeCodigo || detalle.codigo
        : detalle.codigo;

    return codigo || '-';
}
