import type { User } from '@entities/auth/model/types';
import { PERMISSIONS } from '@shared/constants/permissions';

const DEFAULT_APP_ROUTE = '/app/perfil';

export function hasPermission(user: User | null, requiredPermission?: string | string[]): boolean {
    if (!requiredPermission) return true;
    if (!user?.permissions) return false;

    if (Array.isArray(requiredPermission)) {
        return requiredPermission.some((permission) => user.permissions.includes(permission));
    }

    return user.permissions.includes(requiredPermission);
}

export function getDefaultAppRoute(user: User | null): string {
    const routeByPriority: Array<{ route: string; permission: string | string[] }> = [
        { route: '/app/dashboard', permission: PERMISSIONS.DASHBOARD.VER },
        {
            route: '/app/mis-viajes',
            permission: [PERMISSIONS.EMPLOYEE.VIAJES.VER, PERMISSIONS.EMPLOYEE.VIAJES.GESTIONAR],
        },
        {
            route: '/app/mis-pagos',
            permission: [PERMISSIONS.EMPLOYEE.PAGOS.VER, PERMISSIONS.EMPLOYEE.PAGOS.CONFIRMAR],
        },
        {
            route: '/app/mis-licencias',
            permission: [PERMISSIONS.EMPLOYEE.LICENCIAS.VER, PERMISSIONS.EMPLOYEE.LICENCIAS.SOLICITAR],
        },
        {
            route: '/app/mis-documentos',
            permission: [
                PERMISSIONS.EMPLOYEE.DOCUMENTOS.VER,
                PERMISSIONS.EMPLOYEE.DOCUMENTOS.SOLICITAR_ACTUALIZACION,
            ],
        },
        { route: '/app/clientes', permission: PERMISSIONS.CLIENTES.VER },
        { route: '/app/viajes', permission: PERMISSIONS.VIAJES.VER },
        { route: '/app/gasto', permission: PERMISSIONS.CATALOGOS.GASTO.VER },
        { route: '/app/flota', permission: PERMISSIONS.FLOTA.VER },
        { route: '/app/colaboradores', permission: PERMISSIONS.COLABORADORES.VER },
    ];

    const matchedRoute = routeByPriority.find(({ permission }) => hasPermission(user, permission));
    return matchedRoute?.route ?? DEFAULT_APP_ROUTE;
}
