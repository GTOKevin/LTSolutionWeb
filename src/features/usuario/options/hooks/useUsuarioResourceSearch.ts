import { colaboradorApi } from '@entities/colaborador/api/colaborador.api';
import type { SelectItem } from '@/shared/model/types';

/** Claves estables compartidas entre los loaders y el cache de labels. */
export const USUARIO_SELECT_KEYS = {
    colaboradores: 'usuario.colaboradores',
} as const;

const SELECT_LIMIT = 20;

/**
 * Loader de colaboradores vinculables. Depende del colaborador ya asociado
 * (para excluirlo de la búsqueda) por lo que se expone como factory.
 */
export const createUsuarioColaboradorLoader =
    (currentColaboradorId?: number) =>
    async (search: string): Promise<SelectItem[]> =>
        (await colaboradorApi.getSelectAvailable(
            currentColaboradorId,
            search || undefined,
            SELECT_LIMIT,
        )) ?? [];
