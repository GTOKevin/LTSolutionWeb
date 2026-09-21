import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { facturaApi } from '@/entities/factura/api/factura.api';
import { getErrorMessage } from '@shared/utils/api-errors';
import type { SelectItem } from '@/shared/model/types';

const FLOTA_OPTIONS_STALE_TIME = 5 * 60 * 1000;



export function useFacturaDetalleFlotaOptions(enabled: boolean) {
    const detalleFlotas = useQuery({
        queryKey: ['factura', 'detalle-flotas'],
        queryFn: () => facturaApi.getDetalleFlotas({ limit: 99 }),
        enabled,
        retry: false,
        staleTime: FLOTA_OPTIONS_STALE_TIME,
    });

    const options = useMemo<SelectItem[]>(
        () => (detalleFlotas.data ?? []).map((flota) => ({
            id: flota.flotaID,
            text: flota.tipoFlotaNombre ? `${flota.placa} · ${flota.tipoFlotaNombre}` : flota.placa,
            extra: flota.tipoFlotaCodigo ?? undefined,
        })),
        [detalleFlotas.data],
    );

    const errorMessage = detalleFlotas.isError
        ? getErrorMessage(detalleFlotas.error, 'No se pudieron cargar las unidades disponibles.')
        : null;

    return {
        options,
        isLoading: detalleFlotas.isLoading,
        errorMessage,
    };
}
