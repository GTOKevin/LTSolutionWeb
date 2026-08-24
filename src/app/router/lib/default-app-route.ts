import type { User } from '@entities/auth/model/types';
import { APP_DEFAULT_ROUTE_PRIORITY, APP_PATHS } from '../model/navigation';
import { hasPermission } from '@shared/lib/permissions/hasPermission';

const DEFAULT_APP_ROUTE = APP_PATHS.profile;

export function getDefaultAppRoute(user: User | null, isEmployee = false): string {
    const matchedRoute = APP_DEFAULT_ROUTE_PRIORITY.find(
        ({ permission, requiresEmployee }) =>
            (requiresEmployee ? isEmployee : true) && hasPermission(user, permission),
    );
    return matchedRoute?.route ?? DEFAULT_APP_ROUTE;
}
