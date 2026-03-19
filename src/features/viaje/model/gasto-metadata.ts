import { MONEDA_ID } from '@/shared/constants/constantes';
import type { SelectItem } from '@/shared/model/types';

export interface GastoMetadata {
    isFuel: boolean;
    isToll: boolean;
    forcesCurrency: boolean;
    defaultMonedaID?: number;
}

/**
 * Mapeo centralizado para las reglas de negocio de los tipos de gasto.
 * Idealmente, esta metadata debería venir del backend en los campos `extra` o `extraTwo` de SelectItem.
 * Por ahora, se mantiene una heurística robusta aislada del componente de UI.
 */
export const getGastoMetadata = (gasto?: SelectItem): GastoMetadata => {
    if (!gasto) {
        return { isFuel: false, isToll: false, forcesCurrency: false };
    }

    // TODO: Si el backend envía metadata en `extra`, usarla aquí. Ejemplo:
    // if (gasto.extra) {
    //     const meta = JSON.parse(gasto.extra);
    //     return { isFuel: meta.isFuel, isToll: meta.isToll, ... };
    // }

    const text = gasto.text.toLowerCase();
    const isFuel = text.includes('combustible') || text.includes('diesel') || text.includes('petroleo');
    const isToll = text.includes('peaje');

    const forcesCurrency = isFuel || isToll;

    return {
        isFuel,
        isToll,
        forcesCurrency,
        defaultMonedaID: forcesCurrency ? MONEDA_ID.SOLES : undefined
    };
};
