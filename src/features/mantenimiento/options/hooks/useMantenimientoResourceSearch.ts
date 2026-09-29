import { flotaApi } from '@entities/flota/api/flota.api';
import { tipoProductoApi } from '@entities/tipo-producto/api/tipo-producto.api';
import type { SelectItem, SelectStringItem } from '@/shared/model/types';

/** Claves estables compartidas entre los loaders y el cache de labels. */
export const MANTENIMIENTO_SELECT_KEYS = {
    flotas: 'mantenimiento.flotas',
    categorias: 'mantenimiento.categorias',
    tiposProducto: 'mantenimiento.tiposProducto',
} as const;

const SELECT_LIMIT = 20;

const loadFlotas = async (search: string): Promise<SelectItem[]> =>
    (await flotaApi.getSelect(search || undefined, SELECT_LIMIT)) ?? [];

/**
 * El endpoint de categorías no expone búsqueda remota (devuelve el catálogo
 * completo), por lo que se memoiza la primera carga y se filtra localmente.
 */
let categoriasMemo: Promise<SelectStringItem[]> | null = null;

const fetchCategorias = (): Promise<SelectStringItem[]> => {
    if (!categoriasMemo) {
        categoriasMemo = (async () => (await tipoProductoApi.getSelectCategoria()) ?? [])().catch(
            (error) => {
                categoriasMemo = null;
                throw error;
            },
        );
    }
    return categoriasMemo;
};

export const loadCategorias = async (search: string): Promise<SelectStringItem[]> => {
    const categorias = await fetchCategorias();
    const term = search.trim().toLowerCase();
    if (!term) return categorias;
    return categorias.filter((categoria) => categoria.text.toLowerCase().includes(term));
};

export const createTiposProductoLoader =
    (categoria: string) =>
    async (search: string): Promise<SelectItem[]> =>
        (await tipoProductoApi.getSelect(search || undefined, SELECT_LIMIT, categoria)) ?? [];

export const mantenimientoResourceLoaders = {
    loadFlotas,
    loadCategorias,
    createTiposProductoLoader,
} as const;
