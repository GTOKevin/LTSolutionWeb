import type { Estado } from '@shared/model/estado.types';
import type { RolUsuario } from '@entities/rol-usuario/model/types';
import type { Colaborador } from '@entities/colaborador/model/types';

export interface Usuario {
    usuarioID: number;
    nombre: string;
    email?: string;
    claveHash: string;
    rolUsuarioID: number;
    estadoID: number;
    ultimoAcceso?: string;
    intentosLogin?: number;
    bloqueado?: boolean;
    fechaBloqueo?: string;
    colaboradorID?: number;
    fechaRegistro: string;
    fechaModificacion?: string;
    usuarioRegistro?: number;
    usuarioModificacion?: number;
    eliminado: boolean;
    
    colaborador?: Colaborador;
    estado: Estado;
    rolUsuario: RolUsuario;
}

export interface CreateUsuarioDto {
    nombre: string;
    email?: string;
    clave: string;
    rolUsuarioID: number;
    estadoID: number;
    colaboradorID?: number;
}

export interface UsuarioParams {
    search?: string;
    page?: number;
    size?: number;
}
