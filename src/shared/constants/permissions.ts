export const PERMISSIONS = {
    DASHBOARD: {
        VER: 'DASHBOARD_VER',
    },
    CLIENTES: {
        VER: 'CLIENTES_VER',
        GESTIONAR: 'CLIENTES_GESTIONAR',
    },
    COTIZACIONES: {
        VER: 'COTIZACIONES_VER',
        GESTIONAR: 'COTIZACIONES_GESTIONAR',
    },
    FACTURAS: {
        VER: 'FACTURAS_VER',
        GESTIONAR: 'FACTURAS_GESTIONAR',
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
        GESTIONAR: 'COLABORADORES_GESTIONAR',
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
    },
    CATALOGOS: {
        TIPO_PRODUCTO: { VER: 'TIPO_PRODUCTO_VER' },
        MERCADERIA: { VER: 'MERCADERIA_VER' },
        GASTO: { VER: 'GASTO_VER' },
    }
} as const;
