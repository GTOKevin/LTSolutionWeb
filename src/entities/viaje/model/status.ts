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

export type ViajeStatusTone = 'info' | 'warning' | 'secondary' | 'success' | 'neutral';

export interface ViajeStatusVisual {
    tone: ViajeStatusTone;
    label: string;
}

/**
 * Resuelve la presentacion visual (tone + label) de un estado de viaje a partir
 * del codigo y/o nombre del catalogo. Unico punto de verdad: matchea por codigo
 * primero y, si no hay codigo, hace fallback por label via `matchesCatalogCandidate`
 * contra el contrato `VIAJE_STATUS_CODES`. Sin labels hardcodeados en UI.
 */
export function resolveViajeStatusVisual(
    codigo?: string | null,
    nombre?: string | null,
): ViajeStatusVisual {
    const label = nombre || 'Sin estado';

    if (matchesCatalogCandidate(codigo, VIAJE_STATUS_CODES.AGENDADO) || matchesCatalogCandidate(nombre, VIAJE_STATUS_CODES.AGENDADO)) {
        return { tone: 'info', label };
    }
    if (matchesCatalogCandidate(codigo, VIAJE_STATUS_CODES.TRANSITO) || matchesCatalogCandidate(nombre, VIAJE_STATUS_CODES.TRANSITO)) {
        return { tone: 'warning', label };
    }
    if (matchesCatalogCandidate(codigo, VIAJE_STATUS_CODES.DESCARGANDO) || matchesCatalogCandidate(nombre, VIAJE_STATUS_CODES.DESCARGANDO)) {
        return { tone: 'secondary', label };
    }
    if (matchesCatalogCandidate(codigo, VIAJE_STATUS_CODES.COMPLETADO) || matchesCatalogCandidate(nombre, VIAJE_STATUS_CODES.COMPLETADO)) {
        return { tone: 'success', label };
    }
    return { tone: 'neutral', label };
}

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

export interface ViajeEstadoProyectado {
    estadoID: number;
    estadoNombre: string;
}

export const VIAJE_STATUS_FLOW_ORDER = [
    VIAJE_STATUS_CODE.AGENDADO,
    VIAJE_STATUS_CODE.TRANSITO,
    VIAJE_STATUS_CODE.DESCARGANDO,
    VIAJE_STATUS_CODE.COMPLETADO,
] as const;

export type ViajeEstadoRank = 1 | 2 | 3 | 4;


export function resolveNextViajeEstado(codigoActual: string | null | undefined): (typeof VIAJE_STATUS_FLOW_ORDER)[number] | null {
    const currentIndex = VIAJE_STATUS_FLOW_ORDER.indexOf(codigoActual as (typeof VIAJE_STATUS_FLOW_ORDER)[number]);
    if (currentIndex === -1) {
        return null;
    }
    return VIAJE_STATUS_FLOW_ORDER[currentIndex + 1] ?? null;
}


export function getViajeEstadoRank(codigo: string | null | undefined): ViajeEstadoRank | null {
    const index = VIAJE_STATUS_FLOW_ORDER.indexOf(codigo as (typeof VIAJE_STATUS_FLOW_ORDER)[number]);
    return index === -1 ? null : ((index + 1) as ViajeEstadoRank);
}


export function resolveViajeEstadoProyectado(
    fechas: { fechaPartida?: string | null; fechaDescarga?: string | null },
    estadoActualCodigo: string | null | undefined,
    viajeEstados: SelectItem[] | undefined,
): ViajeEstadoProyectado | null {
    let codigo = estadoActualCodigo;
    let proyectado: ViajeEstadoProyectado | null = null;

    while (codigo) {
        const nextCodigo = resolveNextViajeEstado(codigo);
        if (!nextCodigo) {
            break;
        }

        if (nextCodigo === VIAJE_STATUS_CODE.TRANSITO && fechas.fechaPartida) {
            const transitoId = resolveViajeTransitoId(viajeEstados);
            if (transitoId == null) {
                break;
            }
            const transitoItem = viajeEstados?.find((item) => item.id === transitoId);
            proyectado = { estadoID: transitoId, estadoNombre: transitoItem?.text ?? '' };
            codigo = nextCodigo;
            continue;
        }

        if (nextCodigo === VIAJE_STATUS_CODE.DESCARGANDO && fechas.fechaDescarga) {
            const descargandoId = resolveViajeDescargandoId(viajeEstados);
            if (descargandoId == null) {
                break;
            }
            const descargandoItem = viajeEstados?.find((item) => item.id === descargandoId);
            proyectado = { estadoID: descargandoId, estadoNombre: descargandoItem?.text ?? '' };
            codigo = nextCodigo;
            continue;
        }

        break;
    }

    return proyectado;
}
