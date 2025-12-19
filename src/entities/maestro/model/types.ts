export interface TipoMaestro {
    tipoMaestroID: number;
    nombre: string;
    codigo?: string;
    seccion?: string;
    activo: boolean;
}

export interface CreateTipoMaestroDto {
    nombre: string;
    codigo?: string;
    seccion?: string;
    activo: boolean;
}

export interface TipoMaestroParams {
    search?: string;
    seccion?: string;
    page?: number;
    size?: number;
}
