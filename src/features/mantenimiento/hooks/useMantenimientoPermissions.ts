import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { isMantenimientoCompletado } from '@entities/mantenimiento/model/status';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@/shared/constants/permissions';

export function useMantenimientoPermissions() {
    const canManageMantenimientos = usePermission(PERMISSIONS.MANTENIMIENTOS.GESTIONAR);
    const canReopenMantenimientos = usePermission(PERMISSIONS.MANTENIMIENTOS.REABRIR);

    const isCompleted = (item: Mantenimiento | null | undefined): boolean => {
        if (!item) return false;
        return isMantenimientoCompletado(item);
    };

    const isClosed = (item: Mantenimiento | null | undefined): boolean => {
        if (!item) return false;
        return isCompleted(item) && Boolean(item.cerrado);
    };

    const canReopen = (item: Mantenimiento | null | undefined): boolean => {
        if (!isClosed(item)) return false;
        return canReopenMantenimientos;
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
