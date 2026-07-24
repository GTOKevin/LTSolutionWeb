import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '@/entities/cliente/api/cliente.api';
import { colaboradorApi } from '@/entities/colaborador/api/colaborador.api';
import { flotaApi } from '@entities/flota/api/flota.api';
import { TIPO_FLOTA_CODES } from '@entities/flota/model/constants';
import { VIAJE_QUERY_KEYS } from '../../model/query-keys';

export function useViajeResourceOptions(enabled: boolean = true) {
    const { data: clientes } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.clientes(),
        queryFn: async () => (await clienteApi.getSelect()) ?? [],
        enabled,
    });

    const { data: tractos } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tractos(),
        queryFn: async () => (await flotaApi.getSelectTipo(TIPO_FLOTA_CODES.CAMIONES, 50)) ?? [],
        enabled,
    });

    const { data: carretas } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.carretas(),
        queryFn: async () => (await flotaApi.getSelectTipo(TIPO_FLOTA_CODES.CARRETAS, 50)) ?? [],
        enabled,
    });

    const { data: flotasEscolta } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.flotasEscolta(),
        queryFn: async () => (await flotaApi.getSelect(undefined, 100)) ?? [],
        enabled,
    });

    const { data: colaboradores } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.colaboradores(),
        queryFn: async () => (await colaboradorApi.getSelect()) ?? [],
        enabled,
    });

    return {
        clientes,
        tractos,
        carretas,
        flotasEscolta,
        colaboradores,
    };
}
