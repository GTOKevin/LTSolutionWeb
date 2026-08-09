import type { ViajeFilters } from '@entities/viaje/model/types';
import { getFirstDayOfCurrentMonthISOMinus, getLastDayOfCurrentMonthISO } from '@shared/utils/date-utils';

export interface ViajeListDraftFilters {
    fechaInicio: string;
    fechaFin: string;
    clienteID: number;
    colaboradorID: number;
    tractoID: number;
    carretaID: number;
    estadoID: number;
}

export function createDefaultViajeListDraftFilters(): ViajeListDraftFilters {
    return {
        fechaInicio: getFirstDayOfCurrentMonthISOMinus(3),
        fechaFin: getLastDayOfCurrentMonthISO(),
        clienteID: 0,
        colaboradorID: 0,
        tractoID: 0,
        carretaID: 0,
        estadoID: 0,
    };
}

export function normalizeViajeListFilters(filters: ViajeListDraftFilters): Omit<ViajeFilters, 'page' | 'size'> {
    return {
        clienteID: filters.clienteID === 0 ? undefined : filters.clienteID,
        colaboradorID: filters.colaboradorID === 0 ? undefined : filters.colaboradorID,
        tractoID: filters.tractoID === 0 ? undefined : filters.tractoID,
        carretaID: filters.carretaID === 0 ? undefined : filters.carretaID,
        estadoID: filters.estadoID === 0 ? undefined : filters.estadoID,
        fechaInicio: filters.fechaInicio || undefined,
        fechaFin: filters.fechaFin || undefined,
    };
}

export function areViajeListFiltersEqual(
    current: Omit<ViajeFilters, 'page' | 'size'>,
    next: Omit<ViajeFilters, 'page' | 'size'>,
) {
    return current.fechaInicio === next.fechaInicio
        && current.fechaFin === next.fechaFin
        && current.clienteID === next.clienteID
        && current.colaboradorID === next.colaboradorID
        && current.tractoID === next.tractoID
        && current.carretaID === next.carretaID
        && current.estadoID === next.estadoID
        && current.search === next.search;
}
