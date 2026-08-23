import type { SelectItem } from '@/shared/model/types';

export interface ViajeCurrencyDescriptor {
    codigo?: string;
    nombre?: string;
}

/**
 * Convierte una opción de moneda (SelectItem del maestro) al descriptor que
 * consumen los formateadores de `format-utils`. Centraliza el mapeo
 * `{ codigo: moneda?.extra, nombre: moneda?.text }` replicado en pantallas.
 */
export function toViajeCurrencyDescriptor(moneda?: SelectItem): ViajeCurrencyDescriptor {
    return {
        codigo: moneda?.extra,
        nombre: moneda?.text,
    };
}