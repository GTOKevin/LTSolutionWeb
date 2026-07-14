import type { SelectItem } from '@shared/model/types';
import type { Estado } from '@shared/model/estado.types';
import type { TipoMaestro } from '@shared/model/maestro.types';

function normalizeCatalogValue(value?: string | null) {
    return value?.trim().toLowerCase() ?? '';
}

export function matchesCatalogCandidate(
    value: string | null | undefined,
    candidates: readonly string[],
) {
    const normalizedValue = normalizeCatalogValue(value);
    if (!normalizedValue) {
        return false;
    }

    return candidates.some((candidate) => normalizeCatalogValue(candidate) === normalizedValue);
}

export function matchesSelectItem(item: SelectItem | undefined, candidates: readonly string[]) {
    if (!item) {
        return false;
    }

    return matchesCatalogCandidate(item.extra, candidates) || matchesCatalogCandidate(item.text, candidates);
}

export function findSelectItem(items: SelectItem[] | undefined, candidates: readonly string[]) {
    return items?.find((item) => matchesSelectItem(item, candidates));
}

export function getSelectItemId(items: SelectItem[] | undefined, candidates: readonly string[]) {
    return findSelectItem(items, candidates)?.id;
}

export function matchesEstado(estado: Estado | undefined | null, candidates: readonly string[]) {
    if (!estado) {
        return false;
    }

    return matchesCatalogCandidate(estado.codigo, candidates) || matchesCatalogCandidate(estado.nombre, candidates);
}

export function matchesTipoMaestro(tipoMaestro: TipoMaestro | undefined | null, candidates: readonly string[]) {
    if (!tipoMaestro) {
        return false;
    }

    return matchesCatalogCandidate(tipoMaestro.codigo, candidates) || matchesCatalogCandidate(tipoMaestro.nombre, candidates);
}
