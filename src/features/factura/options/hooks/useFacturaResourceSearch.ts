import { clienteApi } from '@/entities/cliente/api/cliente.api';
import { facturaApi } from '@/entities/factura/api/factura.api';
import type { SelectItem } from '@/shared/model/types';

/** Claves estables compartidas entre los loaders y el cache de labels. */
export const FACTURA_SELECT_KEYS = {
    clientes: 'factura.clientes',
    flotas: 'factura.flotas',
} as const;

const SELECT_LIMIT = 20;

const loadClientes = async (search: string): Promise<SelectItem[]> =>
    (await clienteApi.getSelect(search || undefined, SELECT_LIMIT)) ?? [];

const loadFlotas = async (search: string): Promise<SelectItem[]> =>
    ((await facturaApi.getDetalleFlotas({ search: search || undefined, limit: SELECT_LIMIT })) ?? [])
        .map((flota) => ({
            id: flota.flotaID,
            text: flota.tipoFlotaNombre ? `${flota.placa} · ${flota.tipoFlotaNombre}` : flota.placa,
            extra: flota.tipoFlotaCodigo ?? undefined,
        }));

export const facturaResourceLoaders = {
    loadClientes,
    loadFlotas,
} as const;
