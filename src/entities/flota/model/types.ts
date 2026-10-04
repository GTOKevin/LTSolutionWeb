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
    entidadEmisora?: string;
    rutaArchivo?: string;
    fechaEmision: string; // DateOnly -> string
    fechaVencimiento: string; // DateOnly -> string
    estado: boolean;
    tipoDocumento?: TipoDocumento;
}

/** Estado operativo derivado del backend. No se almacena. */
export type FlotaEstadoOperativo = 'DISPONIBLE' | 'EN_VIAJE' | 'EN_MANTENIMIENTO' | 'INACTIVO';

/** Estado de vigencia derivado del documento crítico. */
export type FlotaEstadoVigencia = 'AL_DIA' | 'POR_VENCER' | 'VENCIDO';

export interface FlotaDocumentoCritico {
    tipoDocumentoNombre: string;
    numeroDocumento: string;
    fechaVencimiento: string;
    diasRestantes: number;
    estadoVigencia: FlotaEstadoVigencia;
}

export interface Flota {
    flotaID: number;
    tipoFlota: number;
    vin?: string;
    homologacionMtc?: string;
    configuracionEjesID?: number;
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
    tipoCombustibleID: number;
    estado: boolean;
    flotaDocumentos: FlotaDocumento[];
    tipoFlotaNavigation?: TipoMaestro;
    configuracionEjes?: TipoMaestro;
    tipoCombustibleNavigation?: TipoMaestro;
    tipoMedida?: TipoMaestro;
    tipoPeso?: TipoMaestro;
    // Derivados (calculados en backend)
    codigoInterno?: string;
    estadoOperativo?: FlotaEstadoOperativo;
    conductorAsignado?: string;
    odometroActual?: number;
    viajeActivoCodigo?: string;
    documentoCritico?: FlotaDocumentoCritico;
}

export interface CreateFlotaDto {
    tipoFlota: number;
    vin?: string;
    homologacionMtc?: string;
    configuracionEjesID?: number | null;
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
    tipoCombustibleID: number;
    activo: boolean;
}

export interface CreateFlotaDocumentoDto {
    tipoDocumentoID: number;
    numeroDocumento: string;
    entidadEmisora?: string;
    rutaArchivo?: string;
    fechaEmision: string;
    fechaVencimiento: string;
    activo: boolean;
}

export interface FlotaParams {
    search?: string;
    tipoFlota?: number;
    activo?: boolean;
    estadoOperativo?: string;
    estadoDocumental?: string;
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

export interface FlotaParamsSelect {
    search?: string;
    limit?: number;
}

export interface FlotaHistorialViajesParams {
    page?: number;
    size?: number;
}

export interface FlotaDisponibilidad {
    totalTractos: number;
    tractosLibres: number;
    porcentajeActiva: number;
}

export interface FlotaVencimientoTipo {
    tipoDocumentoNombre: string;
    cantidad: number;
}

export interface FlotaResumen {
    totalParque: number;
    totalTractos: number;
    totalCarretas: number;
    totalRigidos: number;
    totalEscoltas: number;
    disponibilidadTractos: FlotaDisponibilidad;
    unidadesEnRuta: number;
    vencimientosProximos: number;
    vencimientosPorTipo: FlotaVencimientoTipo[];
}

export interface FlotaHistorialViaje {
    viajeID: number;
    codigo: string;
    origenNombre: string;
    destinoNombre: string;
    conductorNombre?: string;
    fechaPartida?: string;
    estadoID: number;
    estadoNombre: string;
    peso?: number;
    kmLlegada?: number;
}

/**
 * Forma real de paginado del backend (`PagedResult<T>`):
 * `{ items, page, size, total }` (sin `totalPages`).
 */
export interface FlotaHistorialViajesPaged {
    items: FlotaHistorialViaje[];
    page: number;
    size: number;
    total: number;
}

export interface FlotaTallerResumen {
    gastoAcumulado: number;
    totalOrdenes: number;
    ultimaFechaServicio?: string;
    proximoMantenimientoKm?: number;
}

export interface FlotaExpediente {
    flota: Flota;
    documentos: FlotaDocumento[];
    viajes: FlotaHistorialViajesPaged;
    taller: FlotaTallerResumen;
    odometroActual?: number;
}
