/**
 * Centinela de "sin dato" para los reportes del viaje (L-N3).
 *
 * Vive en `reports/lib` porque solo los generadores Excel/PDF lo consumen;
 * no pertenece al modelo fisico de carga (`model/cargo-limits.ts`).
 */
export const VIAJE_SIN_DATO = '-' as const;

/** Indica si un valor de reporte porta informacion (distinto de vacio o del centinela). */
export function hasReportValue(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    const text = String(value).trim();
    return text.length > 0 && text !== VIAJE_SIN_DATO;
}
