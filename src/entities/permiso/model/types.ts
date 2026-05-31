export interface Permiso {
    permisoID: number;
    nombre: string;
    codigo: string;
    modulo: string;
    descripcion?: string;
    activo: boolean;
    asignado?: boolean;
}

export interface PermisoGroup {
    modulo: string;
    permisos: Permiso[];
}