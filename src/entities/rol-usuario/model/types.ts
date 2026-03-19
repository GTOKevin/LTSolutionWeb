export interface RolUsuario {
    rolUsuarioID: number;
    nombre: string;
    descripcion?: string;
    estado: boolean;
}

export interface CreateRolUsuarioDto {
    nombre: string;
    descripcion?: string;
    estado: boolean;
}
