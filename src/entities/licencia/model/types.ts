import type { TipoMaestro } from '@shared/model/maestro.types';

export interface Licencia {
    licenciaID: number;
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
