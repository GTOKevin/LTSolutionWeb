import type { Flota } from './types';
import { TIPO_FLOTA_MAESTRO, getTipoFlotaMaestro, type FlotaDiagramCode } from './constants';

/**
 * Variantes de diagrama blueprint soportadas. `GENERIC` es el fallback seguro
 * para tipos desconocidos o combinaciones futuras (nuevas carretas, etc.).
 */
export type VehicleDiagramVariant = FlotaDiagramCode | 'GENERIC';

const DIAGRAM_CODES: FlotaDiagramCode[] = Object.values(TIPO_FLOTA_MAESTRO).map((tipo) => tipo.diagram);
const DIAGRAM_CODE_SET: ReadonlySet<string> = new Set<string>(DIAGRAM_CODES);

/** Códigos de variante que aplican a la cota de Cama Útil (derivado del maestro). */
export const CAMA_UTIL_APLICA: ReadonlySet<FlotaDiagramCode> = new Set<FlotaDiagramCode>(
    Object.values(TIPO_FLOTA_MAESTRO)
        .filter((tipo) => tipo.camaUtil)
        .map((tipo) => tipo.diagram),
);

function normalizeCodigo(codigo?: string | null): string | undefined {
    const value = codigo?.trim().toUpperCase();
    return value ? value : undefined;
}

function isFlotaDiagramCode(value: string | undefined): value is FlotaDiagramCode {
    return value != null && DIAGRAM_CODE_SET.has(value);
}

/** Datos mínimos de flota necesarios para resolver la variante del diagrama. */
type FlotaDiagramSource = Pick<Flota, 'tipoFlota' | 'tipoFlotaNavigation'>;

/**
 * Resuelve la variante del diagrama. Prioridad:
 * `tipoFlotaNavigation.codigoEspecifico` → fallback por `tipoFlota` en
 * `TIPO_FLOTA_MAESTRO.diagram` → `GENERIC` (sin romper).
 */
export function resolveVehicleDiagramVariant(flota: FlotaDiagramSource): VehicleDiagramVariant {
    const rawCodigo = normalizeCodigo(flota.tipoFlotaNavigation?.codigoEspecifico);
    if (rawCodigo) {
        if (rawCodigo.includes('TRACT')) return 'TRACTO';
        if (rawCodigo.includes('PLATAFORM')) return 'PLATAFORMA';
        if (rawCodigo.includes('CISTERN')) return 'CISTERNA';
        if (rawCodigo.includes('CAMA_CUNA') || rawCodigo.includes('CAMACUNA')) return 'CAMA_CUNA';
        if (rawCodigo.includes('CAMA_BAJA') || rawCodigo.includes('CAMABAJA')) return 'CAMA_BAJA';
        if (rawCodigo.includes('CAMIONET')) return 'CAMIONETA';
        if (isFlotaDiagramCode(rawCodigo)) return rawCodigo;
    }

    // Fallback por tipoFlota en catálogo maestro
    const maestro = getTipoFlotaMaestro(flota.tipoFlota);
    if (maestro) {
        return maestro.diagram;
    }

    // Fallback por nombre del tipo de flota si existe
    const nombre = normalizeCodigo((flota.tipoFlotaNavigation as { nombre?: string })?.nombre);
    if (nombre) {
        if (nombre.includes('TRACT')) return 'TRACTO';
        if (nombre.includes('PLATAFORM')) return 'PLATAFORMA';
        if (nombre.includes('CISTERN')) return 'CISTERNA';
        if (nombre.includes('CUNA')) return 'CAMA_CUNA';
        if (nombre.includes('BAJA')) return 'CAMA_BAJA';
        if (nombre.includes('CAMIONET')) return 'CAMIONETA';
    }

    return 'GENERIC';
}

/**
 * Indica si la Cama Útil aplica al tipo de unidad. Solo Cama Baja, Cama Cuna y
 * Plataforma (Cisterna, Tracto y Camioneta no). Resuelve por `codigoEspecifico`
 * y degrada al id del maestro cuando el catálogo todavía no expone el código.
 */
export function resolveCamaUtilAplica(codigoEspecifico?: string | null, tipoFlotaId?: number | null): boolean {
    const codigo = normalizeCodigo(codigoEspecifico);
    if (isFlotaDiagramCode(codigo)) {
        return CAMA_UTIL_APLICA.has(codigo);
    }

    return getTipoFlotaMaestro(tipoFlotaId)?.camaUtil ?? false;
}

/**
 * Resuelve el número de ejes a dibujar. Prioriza el primer dígito de la
 * configuración de ejes (`6x4` → 3 ejes) y degrada al campo `ejes`.
 * Devuelve `0` cuando no hay dato, para no inventar ejes.
 */
export function resolveAxleCount(configuracionEjesCodigo?: string | null, ejes?: number | null): number {
    const match = configuracionEjesCodigo?.match(/(\d+)\s*[xX]\s*(\d+)/);
    if (match) {
        const totalWheels = Number(match[1]);
        if (Number.isFinite(totalWheels) && totalWheels > 0) {
            return Math.max(1, Math.round(totalWheels / 2));
        }
    }

    const value = Number(ejes);
    return Number.isFinite(value) && value > 0 ? Math.trunc(value) : 0;
}
