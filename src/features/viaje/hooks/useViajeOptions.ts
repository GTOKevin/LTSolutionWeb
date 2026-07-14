import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '@/entities/cliente/api/cliente.api';
import { colaboradorApi } from '@/entities/colaborador/api/colaborador.api';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { flotaApi } from '@entities/flota/api/flota.api';
import { monedaApi } from '@entities/moneda/api/moneda.api';
import { gastoApi } from '@entities/gasto/api/gasto.api';
import { mercaderiaApi } from '@entities/mercaderia/api/mercaderia.api';
import { estadoApi } from '@entities/estado/api/estado.api';
import { TIPO_FLOTA_CODES } from '@entities/flota/model/constants';
import { ESTADO_SECTIONS, TIPO_MAESTRO_SECTIONS } from '@entities/master-data/model/constants';
import { getSelectItemId } from '@entities/master-data/lib/catalog-utils';
import {
    resolveViajeAgendadoId,
    resolveViajeCompletadoId,
    resolveViajeDescargandoId,
    resolveViajeTransitoId,
} from '@entities/viaje/model/status';
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
            const response = await flotaApi.getSelectTipo(TIPO_FLOTA_CODES.CAMIONES, 50);
            return response.data ?? [];
        },
        enabled
    });

    const { data: carretas } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.carretas(),
        queryFn: async () => {
            const response = await flotaApi.getSelectTipo(TIPO_FLOTA_CODES.CARRETAS, 50);
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
            const response = await maestroApi.getSelect('', TIPO_MAESTRO_SECTIONS.MEDIDA);
            return response.data ?? [];
        },
        enabled
    });

    const { data: tiposPeso } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tiposPeso(),
        queryFn: async () => {
            const response = await maestroApi.getSelect('', TIPO_MAESTRO_SECTIONS.PESO);
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
            const response = await maestroApi.getSelect('', TIPO_MAESTRO_SECTIONS.INCIDENTE);
            return response.data ?? [];
        },
        enabled
    });

    const { data: tiposGuia } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.tiposGuia(),
        queryFn: async () => {
            const response = await maestroApi.getSelect('', TIPO_MAESTRO_SECTIONS.GUIA);
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
            const response = await estadoApi.getSelect('', 20, ESTADO_SECTIONS.VIAJE);
            return response.data ?? [];
        },
        enabled
    });

    const { data: flotaDisponibilidad } = useQuery({
        queryKey: ['flota', 'disponibilidad'],
        queryFn: async () => {
            const response = await flotaApi.getDisponibilidad();
            return response.data;
        },
        enabled
    });

    const defaultTipoMedidaId = getSelectItemId(tiposMedida, ['metro']);
    const defaultTipoPesoId = getSelectItemId(tiposPeso, ['kilogramo']);
    const defaultMonedaId = getSelectItemId(monedas, ['pen', 'sol', 'soles']);
    const viajeEstadoAgendadoId = resolveViajeAgendadoId(estados);
    const viajeEstadoTransitoId = resolveViajeTransitoId(estados);
    const viajeEstadoDescargandoId = resolveViajeDescargandoId(estados);
    const viajeEstadoCompletadoId = resolveViajeCompletadoId(estados);
    const allowedEstadoIds = [
        viajeEstadoAgendadoId,
        viajeEstadoTransitoId,
    ].filter((value): value is number => typeof value === 'number');

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
        flotaDisponibilidad: flotaDisponibilidad,
        defaultTipoMedidaId,
        defaultTipoPesoId,
        defaultMonedaId,
        allowedEstadoIds,
        viajeEstadoAgendadoId,
        viajeEstadoTransitoId,
        viajeEstadoDescargandoId,
        viajeEstadoCompletadoId,
    };
}
