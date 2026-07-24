import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import { getSelectItemId } from '@entities/master-data/lib/catalog-utils';
import {
    resolveViajeAgendadoId,
    resolveViajeCompletadoId,
    resolveViajeDescargandoId,
    resolveViajeTransitoId,
} from '@entities/viaje/model/status';
import { VIAJE_QUERY_KEYS } from '../../model/query-keys';
import type { useViajeCatalogOptions } from './useViajeCatalogOptions';

type CatalogOptionsResult = ReturnType<typeof useViajeCatalogOptions>;

export function useViajeOperationalOptions(
    enabled: boolean = true,
    catalogs?: Pick<CatalogOptionsResult, 'tiposMedida' | 'tiposPeso' | 'monedas' | 'estados'>,
) {
    const { data: flotaDisponibilidad } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.flotaDisponibilidad(),
        queryFn: async () => flotaApi.getDisponibilidad(),
        enabled,
    });

    const defaultTipoMedidaId = useMemo(
        () => getSelectItemId(catalogs?.tiposMedida, ['metro']),
        [catalogs?.tiposMedida],
    );
    const defaultTipoPesoId = useMemo(
        () => getSelectItemId(catalogs?.tiposPeso, ['kilogramo']),
        [catalogs?.tiposPeso],
    );
    const defaultMonedaId = useMemo(
        () => getSelectItemId(catalogs?.monedas, ['pen', 'sol', 'soles']),
        [catalogs?.monedas],
    );
    const viajeEstadoAgendadoId = useMemo(
        () => resolveViajeAgendadoId(catalogs?.estados),
        [catalogs?.estados],
    );
    const viajeEstadoTransitoId = useMemo(
        () => resolveViajeTransitoId(catalogs?.estados),
        [catalogs?.estados],
    );
    const viajeEstadoDescargandoId = useMemo(
        () => resolveViajeDescargandoId(catalogs?.estados),
        [catalogs?.estados],
    );
    const viajeEstadoCompletadoId = useMemo(
        () => resolveViajeCompletadoId(catalogs?.estados),
        [catalogs?.estados],
    );
    const allowedEstadoIds = useMemo(
        () =>
            [viajeEstadoAgendadoId, viajeEstadoTransitoId].filter(
                (value): value is number => typeof value === 'number',
            ),
        [viajeEstadoAgendadoId, viajeEstadoTransitoId],
    );

    return {
        flotaDisponibilidad,
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
