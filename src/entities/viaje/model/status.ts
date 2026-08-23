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

export interface ViajeEstadoProyectado {
    estadoID: number;
    estadoNombre: string;
}

/**
 * Proyecta el estado del viaje a partir de las fechas registradas en el formulario,
 * SIN degradar el estado actual. Resuelve los IDs/nombres desde el catálogo
 * (viajeEstados) usando los helpers canónicos, nunca IDs hardcodeados.
 *
 * - fechaDescarga registrada y estado actual anterior a Descargando → Descargando.
 * - fechaPartida registrada y estado actual anterior a Transito → Transito.
 * - En cualquier otro caso devuelve null (mantener el estado actual).
 */
export function resolveViajeEstadoProyectado(
    fechas: { fechaPartida?: string | null; fechaDescarga?: string | null },
    estadoActualId: number | undefined | null,
    viajeEstados: SelectItem[] | undefined,
): ViajeEstadoProyectado | null {
    const transitoId = resolveViajeTransitoId(viajeEstados);
    const descargandoId = resolveViajeDescargandoId(viajeEstados);

    // Rango del flujo: AGENDADO(1) < TRANSITO(2) < DESCARGANDO(3) < COMPLETADO(4).
    const getEstadoRank = (id: number | undefined | null): number => {
        if (id == null) return 0;
        if (id === descargandoId) return 3;
        if (id === transitoId) return 2;
        return 1; // Agendado o estado desconocido: se asume el inicio del flujo
    };

    if (fechas.fechaDescarga && descargandoId != null && getEstadoRank(estadoActualId) < 3) {
        const descargandoItem = viajeEstados?.find((item) => item.id === descargandoId);
        return { estadoID: descargandoId, estadoNombre: descargandoItem?.text ?? 'En Descarga' };
    }

    if (fechas.fechaPartida && transitoId != null && getEstadoRank(estadoActualId) < 2) {
        const transitoItem = viajeEstados?.find((item) => item.id === transitoId);
        return { estadoID: transitoId, estadoNombre: transitoItem?.text ?? 'En Ruta' };
    }

    return null;
}
