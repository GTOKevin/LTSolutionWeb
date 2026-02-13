export const PERMISSIONS = {
    DASHBOARD: {
        VER: 'DASHBOARD_VER',
    },
    CLIENTES: {
        VER: 'CLIENTES_VER',
        EDITAR: 'CLIENTES_EDITAR',
    },
    COTIZACIONES: {
        VER: 'COTIZACIONES_VER',
        EDITAR: 'COTIZACIONES_EDITAR',
    },
    FACTURAS: {
        VER: 'FACTURAS_VER',
    },
    VIAJES: {
        VER: 'VIAJES_VER',
        GESTIONAR: 'VIAJES_GESTIONAR',
    },
    FLOTA: {
        VER: 'FLOTA_VER',
        GESTIONAR: 'FLOTA_GESTIONAR',
    },
    COLABORADORES: {
        VER: 'COLABORADORES_VER',
    },
    MANTENIMIENTOS: {
        VER: 'MANTENIMIENTOS_VER',
        GESTIONAR: 'MANTENIMIENTOS_GESTIONAR',
    },
    SISTEMA: {
        USUARIOS: {
            VER: 'USUARIOS_VER',
            GESTIONAR: 'USUARIOS_GESTIONAR',
        },
        ROLES: {
            VER: 'ROLES_VER',
            GESTIONAR: 'ROLES_GESTIONAR',
        },
        MAESTROS: {
            VER: 'MAESTROS_VER',
        }
    }
} as const;
