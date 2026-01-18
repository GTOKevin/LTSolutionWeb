export interface MantenimientoFiltersState {
    flotaID: number;
    estadoID: number;
    desde: string;
    hasta: string;
}

export const INITIAL_FILTERS: MantenimientoFiltersState = {
    flotaID: 0,
    estadoID: 0,
    desde: '',
    hasta: ''
};
