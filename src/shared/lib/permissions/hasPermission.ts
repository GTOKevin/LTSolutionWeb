import type { User } from '@entities/auth/model/types';

export function hasPermission(user: User | null, requiredPermission?: string | string[]): boolean {
    if (!requiredPermission) {
        return true;
    }

    if (!user?.permissions) {
        return false;
    }

    if (Array.isArray(requiredPermission)) {
        return requiredPermission.some((permission) => user.permissions.includes(permission));
    }

    return user.permissions.includes(requiredPermission);
}
