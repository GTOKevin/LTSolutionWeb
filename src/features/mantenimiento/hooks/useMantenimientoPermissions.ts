import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { ESTADO_MANTENIMIENTO_ID } from '@/shared/constants/constantes';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';

export function useMantenimientoPermissions() {
    const canManageMantenimientos = usePermission(PERMISSIONS.MANTENIMIENTOS.GESTIONAR);

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
        return canManageMantenimientos;
    };

    const canEdit = (item: Mantenimiento | null | undefined): boolean => {
        return canManageMantenimientos && !isClosed(item);
    };

    const canDelete = (item: Mantenimiento | null | undefined): boolean => {
        return canManageMantenimientos && !isClosed(item);
    };

    const canExport = (item: Mantenimiento | null | undefined): boolean => {
        return canManageMantenimientos && isClosed(item);
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
