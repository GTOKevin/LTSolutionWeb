import { useQuery } from '@tanstack/react-query';
import { viajeEscoltaApi } from '@/entities/viaje/api/viaje-escolta.api';
import { useViajeCatalogOptions } from './useViajeCatalogOptions';
import { VIAJE_QUERY_KEYS } from '../../model/query-keys';
import { useViajeOperationalOptions } from './useViajeOperationalOptions';
import { useViajeResourceOptions } from './useViajeResourceOptions';

export function useViajeListFilterOptions(enabled: boolean = true) {
    const resources = useViajeResourceOptions(enabled);
    const catalogs = useViajeCatalogOptions(enabled);

    return {
        clientes: resources.clientes,
        tractos: resources.tractos,
        carretas: resources.carretas,
        colaboradores: resources.colaboradores,
        estados: catalogs.estados,
    };
}

export function useViajeGuiaOptions(enabled: boolean = true) {
    const { tiposGuia } = useViajeCatalogOptions(enabled);
    return { tiposGuia };
}

export function useViajeIncidenteOptions(enabled: boolean = true) {
    const { tiposIncidente } = useViajeCatalogOptions(enabled);
    return { tiposIncidente };
}

export function useViajeGastoOptions(enabled: boolean = true) {
    const catalogs = useViajeCatalogOptions(enabled);
    const operational = useViajeOperationalOptions(enabled, catalogs);

    return {
        tiposGasto: catalogs.tiposGasto,
        monedas: catalogs.monedas,
        defaultMonedaId: operational.defaultMonedaId,
    };
}

export function useViajeEscoltaOptions(viajeId?: number, enabled: boolean = true) {
    const { data } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.escolta(viajeId ?? 0),
        queryFn: async () => (viajeId ? await viajeEscoltaApi.getOptions(viajeId) : { flotasEscolta: [], colaboradores: [] }),
        enabled: enabled && !!viajeId,
    });

    return {
        flotasEscolta: data?.flotasEscolta ?? [],
        colaboradores: data?.colaboradores ?? [],
    };
}
