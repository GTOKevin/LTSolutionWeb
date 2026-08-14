export const APP_PATHS = {
    root: '/',
    login: '/login',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    appRoot: '/app',
    dashboard: '/app/dashboard',
    profile: '/app/perfil',
    misViajes: '/app/mis-viajes',
    misPagos: '/app/mis-pagos',
    misLicencias: '/app/mis-licencias',
    misDocumentos: '/app/mis-documentos',
    clientes: '/app/clientes',
    facturas: '/app/facturas',
    viajes: '/app/viajes',
    flotas: '/app/flotas',
    colaboradores: '/app/colaboradores',
    colaboradorSolicitudesDocumentos: '/app/colaboradores/solicitudes-documentos',
    solicitudesLicencias: '/app/colaboradores/solicitudes-licencias',
    mantenimientos: '/app/mantenimientos',
    usuarios: '/app/usuarios',
    rolesUsuario: '/app/roles-usuario',
    rolesColaborador: '/app/roles-colaborador',
    maestros: '/app/maestros',
    gasto: '/app/gasto',
    mercaderia: '/app/mercaderia',
    tipoProducto: '/app/tipo-producto',
} as const;

export const APP_ROUTE_SEGMENTS = {
    dashboard: 'dashboard',
    profile: 'perfil',
    misViajes: 'mis-viajes',
    misPagos: 'mis-pagos',
    misLicencias: 'mis-licencias',
    misDocumentos: 'mis-documentos',
    clientes: 'clientes',
    facturas: 'facturas',
    viajes: 'viajes',
    flotas: 'flotas',
    colaboradores: 'colaboradores',
    colaboradorSolicitudesDocumentos: 'colaboradores/solicitudes-documentos',
    solicitudesLicencias: 'colaboradores/solicitudes-licencias',
    mantenimientos: 'mantenimientos',
    usuarios: 'usuarios',
    rolesUsuario: 'roles-usuario',
    rolesColaborador: 'roles-colaborador',
    maestros: 'maestros',
    gasto: 'gasto',
    mercaderia: 'mercaderia',
    tipoProducto: 'tipo-producto',
} as const;

export function buildAppCreatePath(basePath: string) {
    return `${basePath}/nuevo`;
}

export function buildAppDetailPath(basePath: string, id: string | number) {
    return `${basePath}/${id}`;
}

export function buildAppViewPath(basePath: string, id: string | number) {
    return `${buildAppDetailPath(basePath, id)}/ver`;
}
