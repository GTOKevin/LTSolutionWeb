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

export function useViajeOptions() {
    const { data: clientes } = useQuery({
        queryKey: ['clientes-select'],
        queryFn: async () => {
            const response = await clienteApi.getSelect();
            return response.data ?? [];
        }
    });

    const { data: tractos } = useQuery({
        queryKey: ['flota-select-tracto'],
        queryFn: async () => {
            const response = await flotaApi.getSelectTipo(TIPO_FLOTA.CAMIONES, 20);
            return response.data ?? [];
        }
    });

    const { data: carretas } = useQuery({
        queryKey: ['flota-select-carreta'],
        queryFn: async () => {
            const response = await flotaApi.getSelectTipo(TIPO_FLOTA.CARRETAS, 20);
            return response.data ?? [];
        }
    });

    const { data: colaboradores } = useQuery({
        queryKey: ['colaboradores-select'],
        queryFn: async () => {
            const response = await colaboradorApi.getSelect();
            return response.data ?? [];
        }
    });

    // Maestros
    const { data: tiposMedida } = useQuery({
        queryKey: ['maestro-tipo-medida'],
        queryFn: async () => {
            const response = await maestroApi.getSelect('', TIPO_MAESTRO.TIPO_MEDIDA);
            return response.data ?? [];
        }
    });

    const { data: tiposPeso } = useQuery({
        queryKey: ['maestro-tipo-peso'],
        queryFn: async () => {
            const response = await maestroApi.getSelect('', TIPO_MAESTRO.TIPO_PESO);
            return response.data ?? [];
        }
    });

    const { data: tiposGasto } = useQuery({
        queryKey: ['gasto-select'],
        queryFn: async () => {
            const response = await gastoApi.getSelect('', 50);
            return response.data ?? [];
        }
    });

    const { data: mercaderias } = useQuery({
        queryKey: ['mercaderia-select'],
        queryFn: async () => {
            const response = await mercaderiaApi.getSelect('', 50);
            return response.data ?? [];
        }
    });

    const { data: tiposIncidente } = useQuery({
        queryKey: ['maestro-tipo-incidente'],
        queryFn: async () => {
            const response = await maestroApi.getSelect('', TIPO_MAESTRO.TIPO_INCIDENTE);
            return response.data ?? [];
        }
    });

    const { data: tiposGuia } = useQuery({
        queryKey: ['maestro-tipo-guia'],
        queryFn: async () => {
            const response = await maestroApi.getSelect('', TIPO_MAESTRO.TIPO_GUIA);
            return response.data ?? [];
        }
    });
    
    const { data: monedas } = useQuery({
        queryKey: ['maestro-moneda'], 
        queryFn: async () => {
            const response = await monedaApi.getSelect();
            return response.data ?? [];
        }
    });

    const { data: estados } = useQuery({
        queryKey: ['estado-select-viaje'],
        queryFn: async () => {
            const response = await estadoApi.getSelect('', 20, ESTADO_SECCIONES.VIAJE);
            return response.data ?? [];
        }
    });

    return {
        clientes: clientes,
        tractos: tractos,
        carretas: carretas,
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
