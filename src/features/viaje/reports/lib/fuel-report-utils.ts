import { GASTO_CODES } from '@/entities/gasto/model/metadata';
import type { ViajeGastoReportItemDto } from '@entities/viaje/model/types';

export function isFuelReportExpense(item: ViajeGastoReportItemDto): boolean {
    if (typeof item.combustible === 'boolean') {
        return item.combustible;
    }

    if (item.gastoCodigo) {
        return item.gastoCodigo === GASTO_CODES.COMBUSTIBLE;
    }

    return (item.galones ?? 0) > 0;
}
