export interface RolUsuario {
    rolUsuarioID: number;
    nombre: string;
    descripcion?: string;
    estado: boolean;
    permisosIds?: number[];
}

export interface CreateRolUsuarioDto {
    nombre: string;
    descripcion?: string;
    estado: boolean;
    permisosIds?: number[];
}
