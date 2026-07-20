import type { PagedResponse } from '@shared/model/types';

export interface MiPagoDto {
    colaboradorPagoId: number;
    tipoPagoId: number;
    tipoPagoNombre: string;
    monedaId: number;
    monedaCodigo: string;
    monedaSimbolo: string;
    monto: number;
    fechaInicio: string;
    fechaCierre: string;
    fechaPago: string;
    observaciones: string | null;
    confirmadoPago: boolean | null;
    fechaConfirmacion: string | null;
    usuarioConfirmacionId: number | null;
    estadoConfirmacion: string;
}

export interface MiPagoFilters {
    tipoPagoID?: number;
    monedaID?: number;
    desde?: string;
    hasta?: string;
    page: number;
    size: number;
}

export interface MiLicenciaDto {
    colaboradorLicenciaId: number;
    tipoLicenciaId: number;
    tipoLicenciaNombre: string;
    descripcion: string | null;
    fechaInicial: string;
    fechaFinal: string | null;
    aceptado: boolean | null;
    usuarioAceptaId: number | null;
    fechaAceptacion: string | null;
    estadoRevision: string;
}

export type MiLicenciaEstadoRevision = 'pendiente' | 'aprobada' | 'rechazada';

export interface MiLicenciaFilters {
    tipoLicenciaID?: number;
    estadoRevision?: MiLicenciaEstadoRevision;
    desde?: string;
    hasta?: string;
    page: number;
    size: number;
}

export interface CreateMiLicenciaRequestDto {
    tipoLicenciaID: number;
    descripcion?: string;
    fechaInicial: string;
    fechaFinal?: string;
}

export interface MiDocumentoDto {
    colaboradorDocumentoId: number;
    tipoDocumentoId: number;
    tipoDocumentoNombre: string;
    numeroDocumento: string | null;
    rutaArchivo: string | null;
    fechaEmision: string;
    fechaVencimiento: string;
    activo: boolean;
    vigenciaEstado: string;
    tieneSolicitudPendiente: boolean;
}

export interface DocumentoActualizacionSolicitudDto {
    solicitudId: number;
    colaboradorDocumentoId: number;
    colaboradorId: number;
    numeroDocumentoPropuesto: string | null;
    rutaArchivoPropuesta: string | null;
    fechaEmisionPropuesta: string | null;
    fechaVencimientoPropuesta: string | null;
    motivoSolicitud: string | null;
    aprobada: boolean | null;
    usuarioRevisionId: number | null;
    fechaRevision: string | null;
    comentarioRevision: string | null;
    fechaRegistro: string;
    estadoRevision: string;
}

export interface MiDocumentoFilters {
    tipoDocumentoID?: number;
    activo?: boolean;
    page: number;
    size: number;
}

export interface MiDocumentoSolicitudesFilters {
    colaboradorDocumentoID?: number;
    aprobada?: boolean;
    page: number;
    size: number;
}

export interface CreateDocumentoActualizacionSolicitudDto {
    colaboradorDocumentoID: number;
    numeroDocumentoPropuesto?: string;
    rutaArchivoPropuesta?: string;
    fechaEmisionPropuesta?: string;
    fechaVencimientoPropuesta?: string;
    motivoSolicitud?: string;
}

export interface MiViajeListItemDto {
    viajeId: number;
    codigo: string;
    fechaCarga: string;
    clienteRazonSocial: string;
    origenDescripcion: string;
    destinoDescripcion: string;
    tractoPlaca: string;
    carretaPlaca: string | null;
    estadoId: number;
    estadoNombre: string;
    cerrado: boolean;
    facturado: boolean;
}

export interface MiViajeDetailDto extends MiViajeListItemDto {
    fechaPartida: string | null;
    fechaLlegada: string | null;
    fechaDescarga: string | null;
    fechaLlegadaBase: string | null;
    kmInicio: number | null;
    kmLlegada: number | null;
    kmLlegadaBase: number | null;
}

export interface UpdateMiViajeKmsDto {
    kmInicio: number | null;
    kmLlegada: number | null;
    kmLlegadaBase: number | null;
}

export interface MiViajeFilters {
    estadoID?: number;
    desde?: string;
    hasta?: string;
    search?: string;
    page: number;
    size: number;
}

export type MiPagosResponse = PagedResponse<MiPagoDto>;
export type MiLicenciasResponse = PagedResponse<MiLicenciaDto>;
export type MiDocumentosResponse = PagedResponse<MiDocumentoDto>;
export type MiDocumentoSolicitudesResponse = PagedResponse<DocumentoActualizacionSolicitudDto>;
export type MiViajesResponse = PagedResponse<MiViajeListItemDto>;
