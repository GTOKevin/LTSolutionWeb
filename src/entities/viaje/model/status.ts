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

export const VIAJE_STATUS_FLOW_ORDER = [
    VIAJE_STATUS_CODE.AGENDADO,
    VIAJE_STATUS_CODE.TRANSITO,
    VIAJE_STATUS_CODE.DESCARGANDO,
    VIAJE_STATUS_CODE.COMPLETADO,
] as const;

export type ViajeEstadoRank = 1 | 2 | 3 | 4;

/**
 * Regla de transición del flujo del viaje: devuelve el código del SIGUIENTE estado
 * en el flujo canónico (AGENDADO → TRANSITO → DESCARGANDO → COMPLETADO).
 * Es la ÚNICA fuente de verdad de "siguiente estado": la usan el kanban
 * (drag & drop), el hook de transición (`useViajeEstadoTransition`) y la proyección
 * del formulario (`resolveViajeEstadoProyectado`).
 *
 * Devuelve `null` cuando el estado actual es desconocido/fuera del flujo (cancelado,
 * desviado...) o cuando ya está en COMPLETADO (no hay siguiente paso).
 */
export function resolveNextViajeEstado(codigoActual: string | null | undefined): (typeof VIAJE_STATUS_FLOW_ORDER)[number] | null {
    const currentIndex = VIAJE_STATUS_FLOW_ORDER.indexOf(codigoActual as (typeof VIAJE_STATUS_FLOW_ORDER)[number]);
    if (currentIndex === -1) {
        return null;
    }
    return VIAJE_STATUS_FLOW_ORDER[currentIndex + 1] ?? null;
}

/**
 * Rango canónico del flujo del viaje: AGENDADO(1) < TRANSITO(2) < DESCARGANDO(3) < COMPLETADO(4).
 * Devuelve `null` para códigos fuera del flujo (cancelado, desviado, desconocido).
 * El rango es la base del orden; la regla de "siguiente paso" vive en
 * `resolveNextViajeEstado` (el kanban y el formulario avanzan de a un paso).
 */
export function getViajeEstadoRank(codigo: string | null | undefined): ViajeEstadoRank | null {
    const index = VIAJE_STATUS_FLOW_ORDER.indexOf(codigo as (typeof VIAJE_STATUS_FLOW_ORDER)[number]);
    return index === -1 ? null : ((index + 1) as ViajeEstadoRank);
}

/**
 * Proyecta el estado del viaje a partir de las fechas registradas en el formulario,
 * SIN degradar el estado actual y avanzando SIEMPRE un solo paso del flujo (regla
 * `resolveNextViajeEstado`), de modo que el formulario y el kanban comparten la misma
 * regla de transición. Resuelve los IDs/nombres desde el catálogo (viajeEstados) usando
 * los helpers canónicos, nunca IDs hardcodeados.
 *
 * - Siguiente paso = TRANSITO → requiere `fechaPartida`.
 * - Siguiente paso = DESCARGANDO → requiere `fechaDescarga`.
 * - COMPLETADO nunca se proyecta automáticamente desde fechas: se confirma explícitamente
 *   (botón «Marcar Completado» / diálogo del kanban).
 * - Estado actual fuera del flujo canónico → null (no se asciende).
 * - En cualquier otro caso devuelve null (mantener el estado actual).
 */
export function resolveViajeEstadoProyectado(
    fechas: { fechaPartida?: string | null; fechaDescarga?: string | null },
    estadoActualCodigo: string | null | undefined,
    viajeEstados: SelectItem[] | undefined,
): ViajeEstadoProyectado | null {
    const nextCodigo = resolveNextViajeEstado(estadoActualCodigo);
    if (!nextCodigo) {
        return null;
    }

    if (nextCodigo === VIAJE_STATUS_CODE.TRANSITO) {
        if (!fechas.fechaPartida) {
            return null;
        }
        const transitoId = resolveViajeTransitoId(viajeEstados);
        if (transitoId == null) {
            return null;
        }
        const transitoItem = viajeEstados?.find((item) => item.id === transitoId);
        return { estadoID: transitoId, estadoNombre: transitoItem?.text ?? '' };
    }

    if (nextCodigo === VIAJE_STATUS_CODE.DESCARGANDO) {
        if (!fechas.fechaDescarga) {
            return null;
        }
        const descargandoId = resolveViajeDescargandoId(viajeEstados);
        if (descargandoId == null) {
            return null;
        }
        const descargandoItem = viajeEstados?.find((item) => item.id === descargandoId);
        return { estadoID: descargandoId, estadoNombre: descargandoItem?.text ?? '' };
    }

    return null;
}
