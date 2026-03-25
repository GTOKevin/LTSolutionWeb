export interface TipoProducto {
    tipoProductoID: number;
    nombre: string;
    tipo: string;
    categoria: string;
    activo: boolean;
}

export interface TipoProductoDto {
    tipoProductoID: number;
    nombre: string;
    tipo: string;
    categoria: string;
    activo: boolean;
}

export interface CreateTipoProductoDto {
    nombre: string;
    tipo: string;
    categoria: string;
    activo: boolean;
}

export interface TipoProductoParams {
    search?: string;
    categoria?: string;
    page?: number;
    size?: number;
}