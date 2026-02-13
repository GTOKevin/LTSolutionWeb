import { useAuthStore } from '@shared/store/auth.store';

/**
 * Hook to check if current user has specific permissions
 * @param requiredPermission Single permission code or array of codes
 * @returns boolean true if user has required permission(s)
 */
export function usePermission(requiredPermission?: string | string[]): boolean {
    const user = useAuthStore((state) => state.user);

    if (!requiredPermission) return true;
    if (!user || !user.permissions) return false;

    // Admin role bypass (optional, but good for safety net)
    if (user.role === 'Administrador') return true;

    if (Array.isArray(requiredPermission)) {
        // If array, check if user has AT LEAST ONE of the permissions (OR logic)
        // Change to .every() if you need AND logic
        return requiredPermission.some(p => user.permissions.includes(p));
    }

    return user.permissions.includes(requiredPermission);
}
