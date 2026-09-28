import { clienteApi } from '@/entities/cliente/api/cliente.api';
import { colaboradorApi } from '@/entities/colaborador/api/colaborador.api';
import { flotaApi } from '@entities/flota/api/flota.api';
import { TIPO_FLOTA_CODES } from '@entities/flota/model/constants';
import type { SelectItem } from '@/shared/model/types';

/** Claves estables compartidas entre los loaders y el cache de labels (M5). */
export const VIAJE_SELECT_KEYS = {
    clientes: 'viaje.clientes',
    colaboradores: 'viaje.colaboradores',
    tractos: 'viaje.tractos',
    carretas: 'viaje.carretas',
} as const;

const SELECT_LIMIT = 20;

const loadClientes = async (search: string): Promise<SelectItem[]> =>
    (await clienteApi.getSelect(search || undefined, SELECT_LIMIT)) ?? [];

const loadColaboradores = async (search: string): Promise<SelectItem[]> =>
    (await colaboradorApi.getSelect(search || undefined, SELECT_LIMIT)) ?? [];

const loadTractos = async (search: string): Promise<SelectItem[]> =>
    (await flotaApi.getSelectTipo(TIPO_FLOTA_CODES.CAMIONES, SELECT_LIMIT, search || undefined)) ?? [];

const loadCarretas = async (search: string): Promise<SelectItem[]> =>
    (await flotaApi.getSelectTipo(TIPO_FLOTA_CODES.CARRETAS, SELECT_LIMIT, search || undefined)) ?? [];

export const viajeResourceLoaders = {
    loadClientes,
    loadColaboradores,
    loadTractos,
    loadCarretas,
} as const;