import type { SelectItem } from '@shared/model/types';
import type { Viaje, ViajeListItem } from './types';
import { matchesCatalogCandidate } from '@entities/master-data/lib/catalog-utils';

export const VIAJE_STATUS_CODE = {
    AGENDADO: 'AGE',
    TRANSITO: 'TRA',
    DESCARGANDO: 'DESC',
    COMPLETADO: 'COMP',
} as const;

export const VIAJE_STATUS_CODES = {
    AGENDADO: ['age', 'agendado'],
    TRANSITO: ['tra', 'transito', 'tránsito'],
    DESCARGANDO: ['desc', 'descargando'],
    COMPLETADO: ['comp', 'completado'],
} as const;

type ViajeStatusSource = {
    estado?: Viaje['estado'] | null;
    estadoCodigo?: ViajeListItem['estadoCodigo'] | null;
    estadoNombre?: ViajeListItem['estadoNombre'] | null;
};

export function isViajeStatus(source: ViajeStatusSource | null | undefined, candidates: readonly string[]) {
    if (!source) {
        return false;
    }

    const estadoCodigo = source.estado?.codigo ?? source.estadoCodigo;
    const estadoNombre = source.estado?.nombre ?? source.estadoNombre;

    return matchesCatalogCandidate(estadoCodigo, candidates) || matchesCatalogCandidate(estadoNombre, candidates);
}

export function isViajeAgendado(source: ViajeStatusSource | null | undefined) {
    return isViajeStatus(source, VIAJE_STATUS_CODES.AGENDADO);
}

export function isViajeTransito(source: ViajeStatusSource | null | undefined) {
    return isViajeStatus(source, VIAJE_STATUS_CODES.TRANSITO);
}

export function isViajeDescargando(source: ViajeStatusSource | null | undefined) {
    return isViajeStatus(source, VIAJE_STATUS_CODES.DESCARGANDO);
}

export function isViajeCompletado(source: ViajeStatusSource | null | undefined) {
    return isViajeStatus(source, VIAJE_STATUS_CODES.COMPLETADO);
}

export function resolveViajeAgendadoId(items: SelectItem[] | undefined) {
    return items?.find((item) => matchesCatalogCandidate(item.extra, VIAJE_STATUS_CODES.AGENDADO) || matchesCatalogCandidate(item.text, VIAJE_STATUS_CODES.AGENDADO))?.id;
}

export function resolveViajeTransitoId(items: SelectItem[] | undefined) {
    return items?.find((item) => matchesCatalogCandidate(item.extra, VIAJE_STATUS_CODES.TRANSITO) || matchesCatalogCandidate(item.text, VIAJE_STATUS_CODES.TRANSITO))?.id;
}

export function resolveViajeDescargandoId(items: SelectItem[] | undefined) {
    return items?.find((item) => matchesCatalogCandidate(item.extra, VIAJE_STATUS_CODES.DESCARGANDO) || matchesCatalogCandidate(item.text, VIAJE_STATUS_CODES.DESCARGANDO))?.id;
}

export function resolveViajeCompletadoId(items: SelectItem[] | undefined) {
    return items?.find((item) => matchesCatalogCandidate(item.extra, VIAJE_STATUS_CODES.COMPLETADO) || matchesCatalogCandidate(item.text, VIAJE_STATUS_CODES.COMPLETADO))?.id;
}
