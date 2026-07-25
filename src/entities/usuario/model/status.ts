import type { SelectItem } from '@shared/model/types';
import type { Usuario } from './types';
import { getSelectItemId, matchesEstado } from '@entities/master-data/lib/catalog-utils';

const USUARIO_STATUS = {
    ACTIVO: ['activo', 'habilitado'],
} as const;

export function isUsuarioActivo(usuario: Usuario | null | undefined) {
    if (!usuario) {
        return false;
    }

    return matchesEstado(usuario.estado, USUARIO_STATUS.ACTIVO);
}

export function resolveUsuarioActivoId(items: SelectItem[] | undefined) {
    return getSelectItemId(items, USUARIO_STATUS.ACTIVO);
}
