import type { SelectItem } from '@shared/model/types';
import type { Mantenimiento } from './types';
import { matchesCatalogCandidate } from '@entities/master-data/lib/catalog-utils';

const MANTENIMIENTO_STATUS = {
    AGENDADO: ['2'],
    TALLER: ['3'],
    COMPLETADO: ['1'],
} as const;

export function isMantenimientoStatus(item: Mantenimiento | null | undefined, candidates: readonly string[]) {
    const estadoCodigo = item?.estado?.codigo;
    if (!estadoCodigo) {
        return false;
    }

    return matchesCatalogCandidate(estadoCodigo, candidates);
}

export function isMantenimientoCompletado(item: Mantenimiento | null | undefined) {
    return isMantenimientoStatus(item, MANTENIMIENTO_STATUS.COMPLETADO);
}

export function resolveMantenimientoCompletadoId(items: SelectItem[] | undefined) {
    return items?.find((item) => matchesCatalogCandidate(item.extra, MANTENIMIENTO_STATUS.COMPLETADO))?.id;
}

export function getMantenimientoEstadoColorCandidates() {
    return MANTENIMIENTO_STATUS;
}
