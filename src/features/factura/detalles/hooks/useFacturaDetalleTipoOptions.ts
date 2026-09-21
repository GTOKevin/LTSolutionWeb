import { useQuery } from '@tanstack/react-query';
import { maestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { findSelectItem, getSelectItemId } from '@entities/master-data/lib/catalog-utils';
import { SECCION_MAESTRO } from '@entities/master-data/model/constants';
import { TIPO_DETALLE_CODES, type TipoDetalleCodigo } from '@entities/factura/model/constants';
import type { SelectItem } from '@shared/model/types';

const TIPO_DETALLE_STALE_TIME = 5 * 60 * 1000;


function useTipoDetalleQuery(codigo: TipoDetalleCodigo) {
    return useQuery({
        queryKey: ['factura', 'tipo-detalle', codigo],
        queryFn: () => maestroApi.getSelect(
            undefined,
            SECCION_MAESTRO.TIPO_DETALLE_FACTURA,
            codigo,
            5,
        ),
        staleTime: TIPO_DETALLE_STALE_TIME,
        retry: false,
    });
}


export function useFacturaDetalleTipoOptions() {
    const flete = useTipoDetalleQuery(TIPO_DETALLE_CODES.FLETE);
    const sobrestadia = useTipoDetalleQuery(TIPO_DETALLE_CODES.SOBRESTADIA);

    const getItems = (codigo: TipoDetalleCodigo): SelectItem[] | undefined =>
        codigo === TIPO_DETALLE_CODES.SOBRESTADIA ? sobrestadia.data : flete.data;

    const resolveTipoDetalleId = (codigo: TipoDetalleCodigo): number | undefined =>
        getSelectItemId(getItems(codigo), [codigo]);

    /** Label del catálogo maestro; `undefined` mientras no cargue o no exista la fila. */
    const getTipoDetalleLabel = (codigo: TipoDetalleCodigo): string | undefined =>
        findSelectItem(getItems(codigo), [codigo])?.text;

    return {
        resolveTipoDetalleId,
        getTipoDetalleLabel,
        isLoading: flete.isLoading || sobrestadia.isLoading,
        isError: flete.isError || sobrestadia.isError,
    };
}
