import type { TipoMaestro } from '@shared/model/maestro.types';

export interface TipoDocumento {
    tipoDocumentoID: number;
    nombre: string;
    activo: boolean;
}

export interface FlotaDocumento {
    flotaDocumentoID: number;
    flotaID: number;
    tipoDocumentoID: number;
    numeroDocumento: string;
    rutaArchivo?: string;
    fechaEmision: string; // DateOnly -> string
    fechaVencimiento: string; // DateOnly -> string
    estado: boolean;
    tipoDocumento?: TipoDocumento;
}

export interface Flota {
    flotaID: number;
    tipoFlota: number;
    marca?: string;
    modelo?: string;
    placa: string;
    anio: number;
    color?: string;
    ejes: number;
    tipoPesoID: number;
    pesoBruto?: number;
    pesoNeto?: number;
    cargaUtil?: number;
    tipoMedidaID: number;
    largo?: number;
    alto?: number;
    ancho?: number;
    tipoCombustible: string;
    estado: boolean;
    flotaDocumentos: FlotaDocumento[];
    // mantenimientos: Mantenimiento[]; // Omitted for now as not in scope yet
    tipoFlotaNavigation?: TipoMaestro;
    tipoMedida?: TipoMaestro;
    tipoPeso?: TipoMaestro;
}

export interface CreateFlotaDto {
    tipoFlota: number;
    marca?: string;
    modelo?: string;
    placa: string;
    anio: number;
    color?: string;
    ejes: number;
    tipoPesoID: number;
    pesoBruto?: number;
    pesoNeto?: number;
    cargaUtil?: number;
    tipoMedidaID: number;
    largo?: number;
    alto?: number;
    ancho?: number;
    tipoCombustible: string;
    activo: boolean;
}

export interface CreateFlotaDocumentoDto {
    tipoDocumentoID: number;
    numeroDocumento: string;
    rutaArchivo?: string;
    fechaEmision: string;
    fechaVencimiento: string;
    activo: boolean;
}

export interface FlotaParams {
    search?: string;
    tipoFlota?: number;
    activo?: boolean;
    page?: number;
    size?: number;
}

export interface FlotaDocumentoParams {
    flotaId?: number;
    tipoDocumentoId?: number;
    numeroDocumento?: string;
    activo?: boolean;
    page?: number;
    size?: number;
}
