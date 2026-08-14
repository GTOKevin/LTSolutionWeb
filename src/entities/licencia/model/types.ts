import type { TipoMaestro } from '@shared/model/maestro.types';

export interface Licencia {
    colaboradorLicenciaID: number;
    colaboradorID: number;
    tipoLicenciaID: number;
    descripcion?: string;
    fechaInicial: string;
    fechaFinal?: string;
    activo: boolean;
    tipoLicencia?: TipoMaestro;
}

export interface CreateLicenciaDto {
    colaboradorID: number;
    tipoLicenciaID: number;
    descripcion?: string;
    fechaInicial: string;
    fechaFinal?: string;
    activo: boolean;
}

export interface LicenciaParams {
    colaboradorID?: number;
    tipoLicenciaID?: number;
    desde?: string;
    hasta?: string;
    page?: number;
    size?: number;
}

export interface ColaboradorLicenciasReportDto {
    nombreCompleto: string;
    cargo: string;
    tipoDocumento: string;
    numeroDocumento: string;
    licencias: ColaboradorLicenciaDetailDto[];
}

export interface ColaboradorLicenciaDetailDto {
    tipoLicencia: string;
    fechaInicio: string;
    fechaFin?: string;
    comentario: string;
}

export type LicenciaEstadoRevision = 'pendiente' | 'aprobada' | 'rechazada';
export type LicenciaEstadoRevisionFilter = '' | LicenciaEstadoRevision;

export interface LicenciaSolicitudDto {
    colaboradorLicenciaId: number;
    colaboradorId: number;
    colaboradorNombre: string;
    tipoLicenciaId: number;
    tipoLicenciaNombre: string;
    descripcion: string | null;
    fechaInicial: string;
    fechaFinal: string | null;
    aceptado: boolean | null;
    usuarioAceptaId: number | null;
    fechaAceptacion: string | null;
    comentarioRevision: string | null;
    estadoRevision: LicenciaEstadoRevision;
    fechaRegistro: string;
    rutasFoto: string[];
}

export interface LicenciaSolicitudParams {
    search?: string;
    tipoLicenciaID?: number;
    estadoRevision?: LicenciaEstadoRevisionFilter;
    desde?: string;
    hasta?: string;
    page: number;
    size: number;
}

export interface ReviewLicenciaDto {
    comentarioRevision?: string;
}
