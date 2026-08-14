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

export interface ColaboradorDocumentoSolicitud {
    solicitudId: number;
    colaboradorDocumentoId: number;
    colaboradorId: number;
    colaboradorNombre: string;
    tipoDocumentoId: number;
    tipoDocumentoNombre: string;
    numeroDocumentoActual?: string | null;
    fechaEmisionActual?: string | null;
    fechaVencimientoActual?: string | null;
    numeroDocumentoPropuesto?: string | null;
    rutaArchivoPropuesta?: string | null;
    fechaEmisionPropuesta?: string | null;
    fechaVencimientoPropuesta?: string | null;
    motivoSolicitud?: string | null;
    aprobada: boolean | null;
    comentarioRevision?: string | null;
    fechaRegistro: string;
    fechaRevision?: string | null;
    estadoRevision: string;
}

export interface ReviewDocumentoActualizacionSolicitudDto {
    comentarioRevision?: string;
}

export interface ColaboradorDocumentoSolicitudesParams {
    colaboradorID?: number;
    tipoDocumentoID?: number;
    aprobada?: boolean;
    search?: string;
    page: number;
    size: number;
}
