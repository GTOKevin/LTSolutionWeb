import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { monedaApi } from '@entities/moneda/api/moneda.api';
import { gastoApi } from '@entities/gasto/api/gasto.api';
import { mercaderiaApi } from '@entities/mercaderia/api/mercaderia.api';
import { estadoApi } from '@entities/estado/api/estado.api';
import { ESTADO_SECTIONS, TIPO_MAESTRO_SECTIONS } from '@entities/master-data/model/constants';
import { VIAJE_QUERY_KEYS } from '../../model/query-keys';

export function useViajeCatalogOptions(enabled: boolean = true) {
    const { data: tiposMedida } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tiposMedida(),
        queryFn: async () => (await maestroApi.getSelect('', TIPO_MAESTRO_SECTIONS.MEDIDA)).data ?? [],
        enabled,
    });

    const { data: tiposPeso } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tiposPeso(),
        queryFn: async () => (await maestroApi.getSelect('', TIPO_MAESTRO_SECTIONS.PESO)).data ?? [],
        enabled,
    });

    const { data: tiposGasto } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tiposGasto(),
        queryFn: async () => (await gastoApi.getSelect('', 50)).data ?? [],
        enabled,
    });

    const { data: mercaderias } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.mercaderias(),
        queryFn: async () => (await mercaderiaApi.getSelect('', 50)).data ?? [],
        enabled,
    });

    const { data: tiposIncidente } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tiposIncidente(),
        queryFn: async () => (await maestroApi.getSelect('', TIPO_MAESTRO_SECTIONS.INCIDENTE)).data ?? [],
        enabled,
    });

    const { data: tiposGuia } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tiposGuia(),
        queryFn: async () => (await maestroApi.getSelect('', TIPO_MAESTRO_SECTIONS.GUIA)).data ?? [],
        enabled,
    });

    const { data: monedas } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.monedas(),
        queryFn: async () => (await monedaApi.getSelect()).data ?? [],
        enabled,
    });

    const { data: estados } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.estados(),
        queryFn: async () => (await estadoApi.getSelect('', 20, ESTADO_SECTIONS.VIAJE)).data ?? [],
        enabled,
    });

    return {
        tiposMedida,
        tiposPeso,
        tiposGasto,
        mercaderias,
        tiposIncidente,
        tiposGuia,
        monedas,
        estados,
    };
}
