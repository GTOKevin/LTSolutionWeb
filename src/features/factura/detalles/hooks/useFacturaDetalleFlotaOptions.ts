import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { facturaApi } from '@/entities/factura/api/factura.api';
import { flotaApi } from '@entities/flota/api/flota.api';
import { TIPO_FLOTA_CODES } from '@entities/flota/model/constants';
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

    const detalleFlotasOptions = useMemo<SelectItem[]>(
        () => (detalleFlotas.data ?? []).map((flota) => ({
            id: flota.flotaID,
            text: flota.tipoFlotaNombre ? `${flota.placa} · ${flota.tipoFlotaNombre}` : flota.placa,
            extra: flota.tipoFlotaCodigo ?? undefined,
        })),
        [detalleFlotas.data],
    );

    const shouldUseFallback = enabled
        && (detalleFlotas.isError || (detalleFlotas.isSuccess && detalleFlotasOptions.length === 0));

    const tractos = useQuery({
        queryKey: ['flota', 'select-tipo', TIPO_FLOTA_CODES.CAMIONES],
        queryFn: () => flotaApi.getSelectTipo(TIPO_FLOTA_CODES.CAMIONES, 100),
        enabled: shouldUseFallback,
        staleTime: FLOTA_OPTIONS_STALE_TIME,
    });

    const carretas = useQuery({
        queryKey: ['flota', 'select-tipo', TIPO_FLOTA_CODES.CARRETAS],
        queryFn: () => flotaApi.getSelectTipo(TIPO_FLOTA_CODES.CARRETAS, 100),
        enabled: shouldUseFallback,
        staleTime: FLOTA_OPTIONS_STALE_TIME,
    });

    const options = useMemo<SelectItem[]>(() => {
        if (!shouldUseFallback) {
            return detalleFlotasOptions;
        }

        return [
            ...(tractos.data ?? []).map((option) => ({ ...option, text: `Tracto · ${option.text}` })),
            ...(carretas.data ?? []).map((option) => ({ ...option, text: `Carreta · ${option.text}` })),
        ];
    }, [shouldUseFallback, detalleFlotasOptions, tractos.data, carretas.data]);

    return {
        options,
        isLoading: detalleFlotas.isLoading
            || (shouldUseFallback && (tractos.isLoading || carretas.isLoading)),
    };
}
