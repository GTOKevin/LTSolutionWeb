import { useAuthStore } from '@/shared/store/auth.store';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { ESTADO_MANTENIMIENTO_ID, ROL_USUARIO_ID } from '@/shared/constants/constantes';

export function useMantenimientoPermissions() {
    const user = useAuthStore((state) => state.user);

    const isCompleted = (item: Mantenimiento | null | undefined): boolean => {
        if (!item) return false;
        if (item.estadoID) {
            return item.estadoID === ESTADO_MANTENIMIENTO_ID.COMPLETADO;
        }
        return false;
    };

    const isClosed = (item: Mantenimiento | null | undefined): boolean => {
        if (!item) return false;
        return isCompleted(item) && Boolean(item.cerrado);
    };

    const canReopen = (item: Mantenimiento | null | undefined): boolean => {
        if (!isClosed(item)) return false;
        if (!user) return false;
        
        const roleId = Number(user.roleId);
        return roleId === ROL_USUARIO_ID.ADMINISTRADOR || roleId === ROL_USUARIO_ID.GERENTE_GENERAL;
    };

    const canEdit = (item: Mantenimiento | null | undefined): boolean => {
        return !isClosed(item);
    };

    const canDelete = (item: Mantenimiento | null | undefined): boolean => {
        return !isClosed(item);
    };

    const canExport = (item: Mantenimiento | null | undefined): boolean => {
        return isClosed(item);
    };

    return {
        isCompleted,
        isClosed,
        canReopen,
        canEdit,
        canDelete,
        canExport
    };
}
