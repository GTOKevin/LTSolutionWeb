import type { SelectItem } from '@shared/model/types';
import type { FlotaEstadoOperativo, FlotaEstadoVigencia } from './types';

export const TIPO_FLOTA_CODES = {
    CAMIONES: 'N3',
    CARRETAS: 'O4',
    LIVIANOS: 'N1',
    TODOS: '',
} as const;

/**
 * Variante de diagrama blueprint asociada a un tipo de unidad. Los códigos
 * coinciden con el `codigoEspecifico` que expone el catálogo VEHICULO.
 */
export type FlotaDiagramCode =
    | 'TRACTO'
    | 'CAMA_BAJA'
    | 'CAMA_CUNA'
    | 'PLATAFORMA'
    | 'CISTERNA'
    | 'CAMIONETA';

/**
 * Único punto de verdad de los `TipoMaestroID` de la sección VEHICULO que la UI
 * necesita como fallback (prefijo de código interno, configuración de ejes,
 * variante de diagrama y aplicabilidad de Cama Útil). No pueden derivarse de
 * forma sincrónica desde el catálogo (es async) y el backend no expone todavía
 * el código de cada tipo, por lo que se centralizan aquí y se documenta la
 * dependencia. NO duplicar estos ids en otros módulos.
 *
 * TODO(catalog): migrar a derivación por catálogo (`maestroApi.getSelect` con
 * sección VEHICULO) cuando el backend publique el `codigoEspecifico` de cada tipo.
 */
export const TIPO_FLOTA_MAESTRO = {
    TRACTO: { id: 101, prefix: 'TR', configEjes: true, diagram: 'TRACTO', camaUtil: false },
    CAMA_BAJA: { id: 102, prefix: 'CB', configEjes: false, diagram: 'CAMA_BAJA', camaUtil: true },
    CAMA_CUNA: { id: 103, prefix: 'CC', configEjes: false, diagram: 'CAMA_CUNA', camaUtil: true },
    PLATAFORMA: { id: 104, prefix: 'PL', configEjes: false, diagram: 'PLATAFORMA', camaUtil: true },
    CISTERNA: { id: 105, prefix: 'CI', configEjes: false, diagram: 'CISTERNA', camaUtil: false },
    CAMIONETA: { id: 106, prefix: 'CA', configEjes: false, diagram: 'CAMIONETA', camaUtil: false },
} as const satisfies Record<
    string,
    { id: number; prefix: string; configEjes: boolean; diagram: FlotaDiagramCode; camaUtil: boolean }
>;

type FlotaTipoMaestro = (typeof TIPO_FLOTA_MAESTRO)[keyof typeof TIPO_FLOTA_MAESTRO];

/** Resuelve el maestro de tipo de flota por id (fallback documentado por catálogo). */
export function getTipoFlotaMaestro(tipoFlotaId?: number | null): FlotaTipoMaestro | undefined {
    if (tipoFlotaId == null) {
        return undefined;
    }

    return Object.values(TIPO_FLOTA_MAESTRO).find((tipo) => tipo.id === tipoFlotaId);
}

/** Prefijo de código interno por `TipoMaestroID`, derivado de `TIPO_FLOTA_MAESTRO`. */
export const TIPO_FLOTA_PREFIX: Record<number, string> = Object.values(TIPO_FLOTA_MAESTRO).reduce<
    Record<number, string>
>((acc, tipo) => {
    acc[tipo.id] = tipo.prefix;
    return acc;
}, {});

/** Tipos de flota que aplican a configuración de ejes, derivado de `TIPO_FLOTA_MAESTRO`. */
export const CONFIG_EJES_APLICA: number[] = Object.values(TIPO_FLOTA_MAESTRO)
    .filter((tipo) => tipo.configEjes)
    .map((tipo) => tipo.id);

/**
 * Indica si el tipo de unidad es una carreta de categoría `O4` (cama baja,
 * cama cuna, plataforma o cisterna). Es una clasificación de categoría, no la
 * regla de Cama Útil — para eso usar `resolveCamaUtilAplica` (excluye cisterna).
 * Se resuelve por código del catálogo VEHICULO, sin hardcodear ids.
 */
export function isCarretaO4(tipoFlotaId?: number | null, listaFlota: SelectItem[] = []): boolean {
    if (!tipoFlotaId) {
        return false;
    }

    const item = listaFlota.find((option) => option.id === tipoFlotaId);
    return item?.extra === TIPO_FLOTA_CODES.CARRETAS;
}

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
    { value: TIPO_FLOTA_MAESTRO.TRACTO.id, label: 'Tractocamiones' },
    { value: TIPO_FLOTA_MAESTRO.CAMA_BAJA.id, label: 'Cama Baja' },
    { value: TIPO_FLOTA_MAESTRO.CAMA_CUNA.id, label: 'Cama Cuna' },
    { value: TIPO_FLOTA_MAESTRO.PLATAFORMA.id, label: 'Plataforma' },
    { value: TIPO_FLOTA_MAESTRO.CISTERNA.id, label: 'Cisterna' },
    { value: TIPO_FLOTA_MAESTRO.CAMIONETA.id, label: 'Camionetas' },
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
