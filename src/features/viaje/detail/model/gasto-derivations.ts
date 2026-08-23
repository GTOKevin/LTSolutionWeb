import type { ViajeGasto } from '@/entities/viaje/model/types';

/**
 * Devuelve solo los gastos marcados como combustible.
 * Útil para contadores y derivaciones de galones consumidos.
 */
export function getCombustibleGastos(gastos: ViajeGasto[]): ViajeGasto[] {
    return gastos.filter((gasto) => gasto.combustible);
}

/**
 * Total de galones consumidos a partir de los gastos del viaje.
 * Derivación compartida entre secciones de detalle (Gastos y Seguimiento)
 * para evitar recomputar el mismo filter+reduce en cada pantalla.
 */
export function getTotalGalonesConsumidos(gastos: ViajeGasto[]): number {
    return getCombustibleGastos(gastos).reduce((acc, gasto) => acc + (gasto.galones ?? 0), 0);
}