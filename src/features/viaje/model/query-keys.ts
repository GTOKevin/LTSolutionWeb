import type { ViajeFilters as ViajeFiltersType } from '@/entities/viaje/model/types';

export const VIAJE_QUERY_KEYS = {
    lists: () => ['viajes'] as const,
    list: (filters: ViajeFiltersType) => ['viajes', filters] as const,
    detail: (id: number) => ['viaje', id] as const,
    
    // Sub-modules
    gastos: (viajeId: number, page?: number, size?: number) => page && size ? ['viaje-gastos', viajeId, page, size] as const : ['viaje-gastos', viajeId] as const,
    mercaderias: (viajeId: number, page?: number, size?: number) => page && size ? ['viaje-mercaderias', viajeId, page, size] as const : ['viaje-mercaderias', viajeId] as const,
    incidentes: (viajeId: number, page?: number, size?: number) => page && size ? ['viaje-incidentes', viajeId, page, size] as const : ['viaje-incidentes', viajeId] as const,
    guias: (viajeId: number, page?: number, size?: number) => page && size ? ['viaje-guias', viajeId, page, size] as const : ['viaje-guias', viajeId] as const,
    permisos: (viajeId: number, page?: number, size?: number) => page && size ? ['viaje-permisos', viajeId, page, size] as const : ['viaje-permisos', viajeId] as const,
    escoltas: (viajeId: number, page?: number, size?: number) => page && size ? ['viaje-escoltas', viajeId, page, size] as const : ['viaje-escoltas', viajeId] as const,

    // Options (Selects)
    options: {
        clientes: () => ['clientes-select'] as const,
        tractos: () => ['flota-select-tracto'] as const,
        carretas: () => ['flota-select-carreta'] as const,
        flotasEscolta: () => ['flota-select-escolta'] as const,
        colaboradores: () => ['colaboradores-select'] as const,
        tiposMedida: () => ['maestro-select-medida'] as const,
        tiposPeso: () => ['maestro-select-peso'] as const,
        tiposGasto: () => ['maestro-select-gasto'] as const,
        mercaderias: () => ['maestro-select-producto'] as const,
        tiposIncidente: () => ['maestro-select-incidente'] as const,
        tiposGuia: () => ['maestro-select-guia'] as const,
        monedas: () => ['maestro-select-pago'] as const,
        estados: () => ['maestro-select-estado'] as const,
    }
} as const;
