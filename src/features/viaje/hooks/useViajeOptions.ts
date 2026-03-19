import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '@/entities/cliente/api/cliente.api';
import { colaboradorApi } from '@/entities/colaborador/api/colaborador.api';
import { maestroApi } from '@/shared/api/maestro.api';
import { flotaApi } from '@/shared/api/flota.api';
import { ESTADO_SECCIONES, TIPO_FLOTA, TIPO_MAESTRO } from '@/shared/constants/constantes';
import { monedaApi } from '@/shared/api/moneda.api';
import { gastoApi } from '@/shared/api/gasto.api';
import { mercaderiaApi } from '@/shared/api/mercaderia.api';
import { estadoApi } from '@/shared/api/estado.api';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';

export function useViajeOptions(enabled: boolean = true) {
    const { data: clientes } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.clientes(),
        queryFn: async () => {
            const response = await clienteApi.getSelect();
            return response.data ?? [];
        },
        enabled
    });

    const { data: tractos } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tractos(),
        queryFn: async () => {
            const response = await flotaApi.getSelectTipo(TIPO_FLOTA.CAMIONES, 50);
            return response.data ?? [];
        },
        enabled
    });

    const { data: carretas } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.carretas(),
        queryFn: async () => {
            const response = await flotaApi.getSelectTipo(TIPO_FLOTA.CARRETAS, 50);
            return response.data ?? [];
        },
        enabled
    });

    const { data: flotasEscolta } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.flotasEscolta(),
        queryFn: async () => {
            const response = await flotaApi.getSelect(undefined, 100);
            return response.data ?? [];
        },
        enabled
    });

    const { data: colaboradores } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.colaboradores(),
        queryFn: async () => {
            const response = await colaboradorApi.getSelect();
            return response.data ?? [];
        },
        enabled
    });

    // Maestros
    const { data: tiposMedida } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tiposMedida(),
        queryFn: async () => {
            const response = await maestroApi.getSelect('', TIPO_MAESTRO.TIPO_MEDIDA);
            return response.data ?? [];
        },
        enabled
    });

    const { data: tiposPeso } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tiposPeso(),
        queryFn: async () => {
            const response = await maestroApi.getSelect('', TIPO_MAESTRO.TIPO_PESO);
            return response.data ?? [];
        },
        enabled
    });

    const { data: tiposGasto } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tiposGasto(),
        queryFn: async () => {
            const response = await gastoApi.getSelect('', 50);
            return response.data ?? [];
        },
        enabled
    });

    const { data: mercaderias } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.mercaderias(),
        queryFn: async () => {
            const response = await mercaderiaApi.getSelect('', 50);
            return response.data ?? [];
        },
        enabled
    });

    const { data: tiposIncidente } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tiposIncidente(),
        queryFn: async () => {
            const response = await maestroApi.getSelect('', TIPO_MAESTRO.TIPO_INCIDENTE);
            return response.data ?? [];
        },
        enabled
    });

    const { data: tiposGuia } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tiposGuia(),
        queryFn: async () => {
            const response = await maestroApi.getSelect('', TIPO_MAESTRO.TIPO_GUIA);
            return response.data ?? [];
        },
        enabled
    });
    
    const { data: monedas } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.monedas(), 
        queryFn: async () => {
            const response = await monedaApi.getSelect();
            return response.data ?? [];
        },
        enabled
    });

    const { data: estados } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.estados(),
        queryFn: async () => {
            const response = await estadoApi.getSelect('', 20, ESTADO_SECCIONES.VIAJE);
            return response.data ?? [];
        },
        enabled
    });

    return {
        clientes: clientes,
        tractos: tractos,
        carretas: carretas,
        flotasEscolta: flotasEscolta,
        colaboradores: colaboradores,
        tiposMedida: tiposMedida,
        tiposPeso: tiposPeso,
        tiposGasto: tiposGasto,
        mercaderias: mercaderias,
        tiposIncidente: tiposIncidente,
        tiposGuia: tiposGuia,
        monedas: monedas,
        estados: estados,
    };
}
