import type { SelectItem } from '@shared/model/types';
import type { Mantenimiento } from './types';
import { getSelectItemId, matchesCatalogCandidate, matchesEstado } from '@entities/master-data/lib/catalog-utils';

const MANTENIMIENTO_STATUS = {
    AGENDADO: ['agendado'],
    TALLER: ['taller'],
    COMPLETADO: ['completado'],
} as const;

export function isMantenimientoStatus(item: Mantenimiento | null | undefined, candidates: readonly string[]) {
    if (!item) {
        return false;
    }

    return matchesEstado(item.estado, candidates) || matchesCatalogCandidate(item.estado?.nombre, candidates);
}

export function isMantenimientoCompletado(item: Mantenimiento | null | undefined) {
    return isMantenimientoStatus(item, MANTENIMIENTO_STATUS.COMPLETADO);
}

export function resolveMantenimientoCompletadoId(items: SelectItem[] | undefined) {
    return getSelectItemId(items, MANTENIMIENTO_STATUS.COMPLETADO);
}

export function getMantenimientoEstadoColorCandidates() {
    return MANTENIMIENTO_STATUS;
}
