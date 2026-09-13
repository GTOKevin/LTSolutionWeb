import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '@/entities/cliente/api/cliente.api';
import { colaboradorApi } from '@/entities/colaborador/api/colaborador.api';
import { flotaApi } from '@entities/flota/api/flota.api';
import { TIPO_FLOTA_CODES } from '@entities/flota/model/constants';
import { VIAJE_QUERY_KEYS } from '../../model/query-keys';

/**
 * M7: los selects de flota vienen truncados (50/100) porque el backend pagina.
 * TODO(search): anadir busqueda por texto (search-as-you-type) cuando los
 * catalogos superen el limite; hoy se documenta el tope en cada queryFn.
 * L-N1: sin query de `flotasEscolta` — el tab de escoltas usa
 * `useViajeEscoltaOptions(viajeId)` (opciones por viaje), no este catalogo.
 */
export function useViajeResourceOptions(enabled: boolean = true) {
    const { data: clientes, refetch: refetchClientes, isFetching: isFetchingClientes } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.clientes(),
        queryFn: async () => (await clienteApi.getSelect()) ?? [],
        enabled,
    });

    const { data: tractos, refetch: refetchTractos, isFetching: isFetchingTractos } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tractos(),
        queryFn: async () => (await flotaApi.getSelectTipo(TIPO_FLOTA_CODES.CAMIONES, 50)) ?? [],
        enabled,
    });

    const { data: carretas, refetch: refetchCarretas, isFetching: isFetchingCarretas } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.carretas(),
        queryFn: async () => (await flotaApi.getSelectTipo(TIPO_FLOTA_CODES.CARRETAS, 50)) ?? [],
        enabled,
    });

    const { data: colaboradores, refetch: refetchColaboradores, isFetching: isFetchingColaboradores } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.colaboradores(),
        queryFn: async () => (await colaboradorApi.getSelect()) ?? [],
        enabled,
    });

    return {
        clientes,
        tractos,
        carretas,
        colaboradores,
        refetchClientes,
        isFetchingClientes,
        refetchTractos,
        isFetchingTractos,
        refetchCarretas,
        isFetchingCarretas,
        refetchColaboradores,
        isFetchingColaboradores,
    };
}
