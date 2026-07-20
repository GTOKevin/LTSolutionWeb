import { useViajeCatalogOptions } from './useViajeCatalogOptions';
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

export function useViajeEscoltaOptions(enabled: boolean = true) {
    const resources = useViajeResourceOptions(enabled);

    return {
        flotasEscolta: resources.flotasEscolta,
        colaboradores: resources.colaboradores,
    };
}
