import { APP_PATHS, buildAppViewPath } from '@app/router/model/navigation';

export function normalizeNotificationActionUrl(url?: string) {
    if (!url) return null;
    if (url.startsWith(APP_PATHS.appRoot)) return url;

    const cleaned = url.startsWith('/') ? url : `/${url}`;
    const segments = cleaned.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    const [resource, id] = segments;

    switch (resource.toLowerCase()) {
        case 'viajes':
        case 'viaje':
            return id ? buildAppViewPath(APP_PATHS.viajes, id) : APP_PATHS.viajes;
        case 'facturas':
        case 'factura':
            return id ? buildAppViewPath(APP_PATHS.facturas, id) : APP_PATHS.facturas;
        case 'flotas':
        case 'flota':
            return id ? buildAppViewPath(APP_PATHS.flotas, id) : APP_PATHS.flotas;
        case 'colaboradores':
        case 'colaborador':
            return id ? buildAppViewPath(APP_PATHS.colaboradores, id) : APP_PATHS.colaboradores;
        case 'mantenimientos':
        case 'mantenimiento':
            return id ? buildAppViewPath(APP_PATHS.mantenimientos, id) : APP_PATHS.mantenimientos;
        case 'clientes':
        case 'cliente':
            return id ? buildAppViewPath(APP_PATHS.clientes, id) : APP_PATHS.clientes;
        case 'usuarios':
        case 'usuario':
            return APP_PATHS.usuarios;
        default:
            return null;
    }
}
