import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { getSelectItemId } from '@entities/master-data/lib/catalog-utils';
import { TIPO_DETALLE_CODES, type TipoDetalleCodigo } from '@entities/factura/model/constants';

const TIPO_DETALLE_STALE_TIME = 5 * 60 * 1000;


function useTipoDetalleQuery(codigo: TipoDetalleCodigo) {
    return useQuery({
        queryKey: ['factura', 'tipo-detalle', codigo],
        queryFn: () => maestroApi.getSelect(undefined, undefined, codigo, 5),
        staleTime: TIPO_DETALLE_STALE_TIME,
        retry: false,
    });
}


export function useFacturaDetalleTipoOptions() {
    const flete = useTipoDetalleQuery(TIPO_DETALLE_CODES.FLETE);
    const sobrestadia = useTipoDetalleQuery(TIPO_DETALLE_CODES.SOBRESTADIA);

    const resolveTipoDetalleId = (codigo: TipoDetalleCodigo): number | undefined => {
        const items = codigo === TIPO_DETALLE_CODES.SOBRESTADIA ? sobrestadia.data : flete.data;
        return getSelectItemId(items, [codigo]);
    };

    return {
        resolveTipoDetalleId,
        isLoading: flete.isLoading || sobrestadia.isLoading,
    };
}
