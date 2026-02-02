export const EstadoUsuarioEnum = {
    Activo: 1,
    Suspendido: 2,
    Licencia: 3,
    Eliminado: 4
} as const;

export type EstadoUsuarioEnum = typeof EstadoUsuarioEnum[keyof typeof EstadoUsuarioEnum];

export const RolUsuarioEnum = {
    Admin: 1,
    Asistente: 2,
    RRHH: 3,
    Conductor: 4
} as const;

export type RolUsuarioEnum = typeof RolUsuarioEnum[keyof typeof RolUsuarioEnum];
