import { getFirstDayOfCurrentMonthISOMinus, getLastDayOfCurrentMonthISO } from '@/shared/utils/date-utils';

export interface MantenimientoFiltersState {
    flotaID: number;
    estadoID: number;
    desde: string;
    hasta: string;
}

export interface MantenimientoListDraftState extends MantenimientoFiltersState {
    search: string;
}

export const INITIAL_FILTERS: MantenimientoFiltersState = {
    flotaID: 0,
    estadoID: 0,
    desde: getFirstDayOfCurrentMonthISOMinus(3),
    hasta: getLastDayOfCurrentMonthISO(),
};

export const INITIAL_SEARCH = '';

export const INITIAL_MANTENIMIENTO_DRAFT_STATE: MantenimientoListDraftState = {
    ...INITIAL_FILTERS,
    search: INITIAL_SEARCH,
};

export function areMantenimientoFiltersEqual(current: MantenimientoFiltersState, next: MantenimientoFiltersState) {
    return current.flotaID === next.flotaID
        && current.estadoID === next.estadoID
        && current.desde === next.desde
        && current.hasta === next.hasta;
}
