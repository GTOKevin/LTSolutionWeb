import type { ViajeMercaderia } from '@/entities/viaje/model/types';

/**
 * Reglas de dominio del manifiesto de carga (H2).
 *
 * TODO(backend-contract): escolta / sobredimension / capacidad del convoy
 * deberian venir del contrato backend (p. ej. desde tipoMedida/tipoPeso o
 * parametros de flota). Hasta entonces estas constantes son ESTIMACIONES
 * referenciales no vinculantes del frontend: la UI debe presentarlas con
 * `estimado` / `~` y nunca como valores normativos exactos.
 *
 * Historico UI (N1): los umbrales heredados eran 2.60 m de ancho, 20.50 m de
 * largo y 32,000 kg de referencia. Los valores actuales (3.0 / 17.5 / 29,000)
 * son inferencias operativas sin fuente normativa verificada; no volver a
 * cambiarlos en silencio: cualquier ajuste requiere fuente MTC o contrato
 * backend y debe declararse en el PR.
 */
export const CARGO_LIMITS = {
    /** Ancho (m) estimado a partir del cual se sugiere escolta. */
    ESCORT_MIN_WIDTH_M: 3.0,
    /** Ancho (m) maximo estimado de carga normal antes de marcar sobredimension. */
    MAX_NORMAL_WIDTH_M: 3.0,
    /** Alto (m) maximo estimado de carga normal antes de marcar sobredimension. */
    MAX_NORMAL_HEIGHT_M: 4.2,
    /** Largo (m) maximo estimado de carga normal antes de marcar sobredimension. */
    MAX_NORMAL_LENGTH_M: 17.5,
    /** Supuesto operativo de peso bruto por eje (8,000 kg/eje, referencia habitual MTC sin validar contra norma vigente). */
    PESO_POR_EJE_KG: 8000,
    /** Tara promedio estimada del tracto (rango habitual: 7,500 - 8,000 kg). */
    TARA_TRACTO_KG: 8000,
    /** Tara promedio estimada de la carreta/semirremolque (rango habitual: 10,000 - 12,000 kg). */
    TARA_CARRETA_KG: 11000,
    /**
     * Tara combinada promedio estimada del convoy (rango habitual 18,000 - 20,000 kg, promedio: 19,000 kg).
     */
    TARA_CONVOY_PROMEDIO_KG: 19000,
    /** Ejes por defecto para tracto en configuracion tipica T3S3. */
    DEFAULT_EJES_TRACTO: 3,
    /** Ejes por defecto para carreta en configuracion tipica T3S3. */
    DEFAULT_EJES_CARRETA: 3,
    /**
     * Capacidad util de referencia estimada (kg) para configuracion estandar T3S3:
     * 6 ejes * 8,000 kg/eje = 48,000 kg peso bruto - 19,000 kg tara promedio = 29,000 kg carga util.
     * (Rango operativo: 28,000 - 30,000 kg). Valor referencial, no normativo.
     */
    MAX_CARRETA_KG: 29000,
    /** Kilogramos por tonelada para la conversion visual kg/Tn. */
    KG_PER_TONNE: 1000,
    /**
     * IDs maestros usados como fallback al crear un item de mercaderia.
     * TODO(backend-contract): reemplazar por el tipoMedida/tipoPeso real del
     * viaje o catalogo; `1` es el valor historico (metros / kilogramos).
     */
    DEFAULT_TIPO_MEDIDA_ID: 1,
    DEFAULT_TIPO_PESO_ID: 1,
    /**
     * Tamano de pagina del manifiesto en edit. El backend pagina; este tamano
     * cubre manifiestos normales sin truncar en silencio (ver M4: se avisa
     * cuando total > items cargados).
     */
    MANIFEST_PAGE_SIZE: 100,
} as const;

export type PesoUnit = 'kg' | 'Tn';

export interface CargoTotals {
    largo: number | '';
    ancho: number | '';
    alto: number | '';
    peso: number | '';
    requiereEscolta: boolean;
}

const toNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

/** Deriva si un ancho requiere escolta (testeable, H2). */
export function requiresEscort(anchoM: number): boolean {
    return anchoM >= CARGO_LIMITS.ESCORT_MIN_WIDTH_M;
}

/** Deriva si las dimensiones constituyen sobredimension (testeable, H2). */
export function isOversizedDimension(largoM: number, anchoM: number, altoM: number): boolean {
    return (
        anchoM > CARGO_LIMITS.MAX_NORMAL_WIDTH_M ||
        altoM > CARGO_LIMITS.MAX_NORMAL_HEIGHT_M ||
        largoM > CARGO_LIMITS.MAX_NORMAL_LENGTH_M
    );
}

/**
 * Totales del manifiesto: dimensiones = max() por item, peso = suma.
 * La sincronizacion hacia el formData del edit debe ser explicita
 * (switch "Sincronizar automaticamente"); no llamar a onChange en render.
 */
export function getCargoTotalsFromItems(items: ViajeMercaderia[]): CargoTotals | null {
    if (items.length === 0) return null;
    const maxLargo = Math.max(...items.map((m) => toNumber(m.largo)));
    const maxAncho = Math.max(...items.map((m) => toNumber(m.ancho)));
    const maxAlto = Math.max(...items.map((m) => toNumber(m.alto)));
    const totalPeso = items.reduce((acc, m) => acc + toNumber(m.peso), 0);
    return {
        largo: maxLargo > 0 ? maxLargo : '',
        ancho: maxAncho > 0 ? maxAncho : '',
        alto: maxAlto > 0 ? maxAlto : '',
        peso: totalPeso > 0 ? totalPeso : '',
        requiereEscolta: requiresEscort(maxAncho),
    };
}

/** Conversion visual kg <-> Tn sin redondeo intermedio (el peso canonico siempre es kg). */
export function kgToDisplayUnit(pesoKg: number | '', unit: PesoUnit): number | '' {
    if (pesoKg === '') return '';
    const kg = toNumber(pesoKg);
    return unit === 'Tn' ? kg / CARGO_LIMITS.KG_PER_TONNE : kg;
}

/** Convierte el texto del input (en la unidad visible) al peso canonico en kg. */
export function displayUnitToKg(raw: string, unit: PesoUnit): number | '' {
    if (raw.trim() === '') return '';
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return '';
    return unit === 'Tn' ? parsed * CARGO_LIMITS.KG_PER_TONNE : parsed;
}

export interface ConvoyCapacityResult {
    totalEjes: number;
    ejesTracto: number;
    ejesCarreta: number;
    /** PBV estimado por ejes (totalEjes * 8,000 kg). Referencial, no normativo. */
    pesoBrutoMaximoKg: number;
    /** Tara estimada del convoy (tracto + carreta segun sus ejes). */
    taraEstimadaKg: number;
    /** Carga util estimada disponible (pesoBrutoMaximoKg - taraEstimadaKg). */
    cargaUtilMaxKg: number;
}

/**
 * Estima la capacidad de carga del convoy segun la configuracion de ejes.
 * N1: estimacion frontend no vinculante (ver TODO(backend-contract) del
 * modulo). No presentarla en UI como valor exacto ni normativo.
 *
 * Supuestos operativos:
 * 1. Cada eje aporta 8,000 kg de PBV estimado:
 *    - 8 ejes = 64,000 kg
 *    - 7 ejes = 56,000 kg
 *    - 6 ejes = 48,000 kg
 *    - 5 ejes = 40,000 kg
 *    - etc.
 * 2. Tara estimada del convoy (tracto + carreta segun sus ejes):
 *    - Tracto: 2 ejes ~7,000 kg; 3 ejes ~8,000 kg; 4+ ejes ~9,500 kg
 *    - Carreta: 2 ejes ~8,000 kg; 3 ejes ~11,000 kg; 4 ejes ~14,000 kg; 5 ejes ~17,000 kg
 * 3. Carga util estimada disponible = PBV estimado - tara estimada del convoy.
 */
export function getConvoyCapacity(
    ejesTracto?: number | null,
    ejesCarreta?: number | null,
): ConvoyCapacityResult {
    const ejesT = (ejesTracto && ejesTracto > 0) ? ejesTracto : CARGO_LIMITS.DEFAULT_EJES_TRACTO;
    const ejesC = (ejesCarreta && ejesCarreta > 0) ? ejesCarreta : CARGO_LIMITS.DEFAULT_EJES_CARRETA;
    const totalEjes = ejesT + ejesC;
    const pesoBrutoMaximoKg = totalEjes * CARGO_LIMITS.PESO_POR_EJE_KG;

    const taraTracto = ejesT <= 2 ? 7000 : (ejesT === 3 ? CARGO_LIMITS.TARA_TRACTO_KG : 8000 + (ejesT - 3) * 1500);
    const taraCarreta = ejesC <= 1 ? 5000 : (ejesC === 2 ? 8000 : (ejesC === 3 ? CARGO_LIMITS.TARA_CARRETA_KG : 11000 + (ejesC - 3) * 3000));
    const taraEstimadaKg = taraTracto + taraCarreta;
    const cargaUtilMaxKg = Math.max(0, pesoBrutoMaximoKg - taraEstimadaKg);

    return {
        totalEjes,
        ejesTracto: ejesT,
        ejesCarreta: ejesC,
        pesoBrutoMaximoKg,
        taraEstimadaKg,
        cargaUtilMaxKg,
    };
}

/**
 * Estima la capacidad util maxima de carga (kg) segun la configuracion de ejes del convoy.
 * N1: valor estimado no vinculante (ver nota del modulo).
 */
export function getCapacidadMaxCarreta(
    ejesTracto?: number | null,
    ejesCarreta?: number | null,
): number {
    return getConvoyCapacity(ejesTracto, ejesCarreta).cargaUtilMaxKg;
}

/**
 * Retorna el PBV estimado (totalEjes * 8,000 kg). N1: valor estimado no
 * vinculante (ver nota del modulo).
 */
export function getPesoBrutoMaximoPermitido(
    ejesTracto?: number | null,
    ejesCarreta?: number | null,
): number {
    return getConvoyCapacity(ejesTracto, ejesCarreta).pesoBrutoMaximoKg;
}

/** % de capacidad util estimada de carreta (0-100+, 1 decimal). */
export function getCarretaUtilization(
    pesoKg: number,
    capacidadMaxKg: number = CARGO_LIMITS.MAX_CARRETA_KG,
): string {
    if (!(pesoKg > 0) || !(capacidadMaxKg > 0)) return '0';
    return ((pesoKg / capacidadMaxKg) * 100).toFixed(1);
}
// L-N3: el centinela de reportes (`VIAJE_SIN_DATO` / `hasReportValue`) vive en
// `features/viaje/reports/lib/report-value.ts`, no en este modulo de carga.
