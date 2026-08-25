export interface FacturaDocumento {
    facturaDocumentoID: number;
    facturaID: number;
    descripcion?: string | null;
    rutaArchivo: string;
    activo: boolean;
}

export interface CreateFacturaDocumentoDto {
    facturaID: number;
    descripcion?: string;
    rutaArchivo: string;
}

export interface UpdateFacturaDocumentoDto {
    descripcion?: string;
    rutaArchivo: string;
}

export interface FacturaDocumentoParams {
    facturaID: number;
    page?: number;
    size?: number;
}