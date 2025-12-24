export interface TipoDocumento {
    id: number;
    nombre: string;
}

export interface ColaboradorDocumento {
    colaboradorDocumentoID: number;
    colaboradorID: number;
    tipoDocumentoID: number;
    numeroDocumento?: string;
    rutaArchivo?: string;
    fechaEmision: string; // DateOnly -> string
    fechaVencimiento: string; // DateOnly -> string
    estado: boolean;
    tipoDocumento?: { id: number; nombre: string; }; // Mapped from backend TipoDocumento
}

export interface CreateColaboradorDocumentoDto {
    colaboradorID: number;
    tipoDocumentoID: number;
    numeroDocumento?: string;
    rutaArchivo?: string;
    fechaEmision: string;
    fechaVencimiento: string;
    estado: boolean;
}

export interface ColaboradorDocumentoParams {
    colaboradorID?: number;
    tipoDocumentoID?: number;
    numeroDocumento?: string;
    activo?: boolean;
    page?: number;
    size?: number;
}
