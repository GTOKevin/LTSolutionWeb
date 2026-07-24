import { useAuthStore } from '@shared/store/auth.store';
import { hasPermission, type PermissionCheckMode } from '@shared/lib/permissions/hasPermission';

/**
 * Hook to check if current user has specific permissions
 * @param requiredPermission Single permission code or array of codes
 * @param mode Use `all` when every permission is required
 * @returns boolean true if user has required permission(s)
 */
export function usePermission(requiredPermission?: string | string[], mode: PermissionCheckMode = 'any'): boolean {
    const user = useAuthStore((state) => state.user);
    return hasPermission(user, requiredPermission, mode);
}
