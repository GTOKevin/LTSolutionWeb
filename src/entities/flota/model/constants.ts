import type { FlotaEstadoOperativo, FlotaEstadoVigencia } from './types';

export const TIPO_FLOTA_CODES = {
    CAMIONES: 'N3',
    CARRETAS: 'O4',
    LIVIANOS: 'N1',
    TODOS: '',
} as const;

/** Prefijo de código interno por `TipoMaestroID` de la sección VEHICULO. */
export const TIPO_FLOTA_PREFIX: Record<number, string> = {
    101: 'TR',
    102: 'CB',
    103: 'CC',
    104: 'PL',
    105: 'CI',
    106: 'CA',
};

/** Tipos de flota que aplican a configuración de ejes (solo Tracto). */
export const CONFIG_EJES_APLICA: number[] = [101];

/**
 * Genera el código interno derivado `{PREFIJO}-{FlotaID}`.
 * Sin tipo conocido, usa el fallback `FL-{FlotaID}`.
 */
export function buildCodigoInterno(tipoFlotaId?: number | null, flotaId?: number | null): string {
    if (!flotaId || flotaId <= 0) {
        return '—';
    }

    const prefijo = (tipoFlotaId != null && TIPO_FLOTA_PREFIX[tipoFlotaId]) || 'FL';
    return `${prefijo}-${flotaId}`;
}

export interface FlotaEstadoMeta {
    label: string;
    color: 'success' | 'info' | 'warning' | 'default';
}

export const ESTADO_OPERATIVO_META: Record<FlotaEstadoOperativo, FlotaEstadoMeta> = {
    DISPONIBLE: { label: 'Disponible', color: 'success' },
    EN_VIAJE: { label: 'En Viaje', color: 'info' },
    EN_MANTENIMIENTO: { label: 'En Mantenimiento', color: 'warning' },
    INACTIVO: { label: 'Inactivo', color: 'default' },
};

export const ESTADO_OPERATIVO_META_DEFAULT: FlotaEstadoMeta = {
    label: 'Disponible',
    color: 'success',
};

export interface FlotaEstadoVigenciaMeta {
    label: string;
    color: 'success' | 'warning' | 'error';
}

export const ESTADO_VIGENCIA_META: Record<FlotaEstadoVigencia, FlotaEstadoVigenciaMeta> = {
    AL_DIA: { label: 'Al día', color: 'success' },
    POR_VENCER: { label: 'Por vencer', color: 'warning' },
    VENCIDO: { label: 'Vencido', color: 'error' },
};

/** Pestañas de listado por tipo de unidad. */
export interface FlotaTipoTab {
    value: number | null;
    label: string;
}

export const FLOTA_TABS: FlotaTipoTab[] = [
    { value: null, label: 'Todas' },
    { value: 101, label: 'Tractocamiones' },
    { value: 102, label: 'Cama Baja' },
    { value: 103, label: 'Cama Cuna' },
    { value: 104, label: 'Plataforma' },
    { value: 105, label: 'Cisterna' },
    { value: 106, label: 'Escoltas / Livianos' },
];

/** Opciones de filtro de estado operativo. `activo` se resuelve como filtro booleano. */
export const ESTADO_OPERATIVO_FILTER_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'ACTIVOS', label: 'Solo Activos' },
    { value: 'EN_MANTENIMIENTO', label: 'En Mantenimiento' },
    { value: 'INACTIVO', label: 'Inactivos / Bajas' },
] as const;

/** Opciones de filtro documental (contrato backend: AL_DIA | POR_VENCER | VENCIDO). */
export const ESTADO_DOCUMENTAL_FILTER_OPTIONS = [
    { value: '', label: 'Toda la flota' },
    { value: 'AL_DIA', label: 'Al día' },
    { value: 'POR_VENCER', label: 'Por vencer (< 15 días)' },
    { value: 'VENCIDO', label: 'Vencidos' },
] as const;
