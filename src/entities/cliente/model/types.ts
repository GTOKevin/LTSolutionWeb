export interface Cliente {
    clienteID: number;
    ruc: string;
    razonSocial: string;
    direccionLegal?: string;
    direccionFiscal?: string;
    contactoPrincipal: string;
    telefono?: string;
    email?: string;
    activo: boolean;
    clienteContactos: ClienteContacto[];
}

export interface ClienteContacto {
    clienteContactoID: number;
    clienteID: number;
    nombreCompleto: string;
    email?: string;
    telefonoPrincipal: string;
    telefonoSecundario?: string;
    rol?: string;
    activo: boolean;
    fechaRegistro: string;
    fechaModificacion?: string;
    usuarioRegistro: number;
    usuarioModificacion?: number;
}

export interface CreateClienteDto {
    ruc: string;
    razonSocial: string;
    direccionLegal?: string;
    direccionFiscal?: string;
    contactoPrincipal: string;
    telefono?: string;
    email?: string;
    activo: boolean;
}

export interface CreateClienteContactoDto {
    nombreCompleto: string;
    email?: string;
    telefonoPrincipal: string;
    telefonoSecundario?: string;
    rol?: string;
    activo: boolean;
}

export interface ClienteParams {
    search?: string;
    page?: number;
    size?: number;
}

