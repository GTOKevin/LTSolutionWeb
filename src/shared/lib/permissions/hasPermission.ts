import type { User } from '@entities/auth/model/types';

export type PermissionCheckMode = 'any' | 'all';

export function hasPermission(
    user: User | null,
    requiredPermission?: string | string[],
    mode: PermissionCheckMode = 'any',
): boolean {
    if (!requiredPermission) {
        return true;
    }

    if (!user?.permissions) {
        return false;
    }

    if (Array.isArray(requiredPermission)) {
        return mode === 'all'
            ? requiredPermission.every((permission) => user.permissions.includes(permission))
            : requiredPermission.some((permission) => user.permissions.includes(permission));
    }

    return user.permissions.includes(requiredPermission);
}
