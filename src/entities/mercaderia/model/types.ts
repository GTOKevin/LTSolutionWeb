export interface Mercaderia {
    mercaderiaID: number;
    nombre: string;
    activo?: boolean;
    fechaRegistro: string;
    usuarioRegistro: number;
}

export interface MercaderiaDto {
    mercaderiaID: number;
    nombre: string;
    activo?: boolean;
}

export interface CreateMercaderiaDto {
    nombre: string;
    activo?: boolean;
}

export interface MercaderiaParams {
    search?: string;
    page?: number;
    size?: number;
}
