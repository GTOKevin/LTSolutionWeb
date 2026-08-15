import type { CreateMiViajeGuiaDto, CreateMiViajeIncidenteDto } from '@entities/employee/model/types';
import { buildIncidenteImagesPayload } from '@entities/viaje/model/incidente-images';
import { getCurrentEmployeeViajeDateInput, getCurrentEmployeeViajeTimeInput } from './view-helpers';

export interface EmployeeViajeIncidenteFormValues {
    tipoIncidenteID: number;
    ubigeoID: number;
    fecha: string;
    hora: string;
    lugar: string;
    descripcion: string;
    rutasFoto: string[];
}

export interface EmployeeViajeGuiaFormValues {
    tipoGuiaID: number;
    serie: string;
    numero: string;
    rutaArchivo: string;
}

export function getCreateMisViajeIncidenteDefaultValues(): EmployeeViajeIncidenteFormValues {
    return {
        tipoIncidenteID: 0,
        ubigeoID: 0,
        fecha: getCurrentEmployeeViajeDateInput(),
        hora: getCurrentEmployeeViajeTimeInput(),
        lugar: '',
        descripcion: '',
        rutasFoto: [],
    };
}

export function getCreateMisViajeGuiaDefaultValues(): EmployeeViajeGuiaFormValues {
    return {
        tipoGuiaID: 0,
        serie: '',
        numero: '',
        rutaArchivo: '',
    };
}

export function buildCreateMisViajeIncidentePayload(
    values: EmployeeViajeIncidenteFormValues,
): CreateMiViajeIncidenteDto {
    return {
        tipoIncidenteID: values.tipoIncidenteID,
        ubigeoID: values.ubigeoID,
        fechaHora: `${values.fecha}T${values.hora}:00`,
        lugar: values.lugar.trim(),
        descripcion: values.descripcion.trim(),
        ...buildIncidenteImagesPayload(values.rutasFoto),
    };
}

export function buildCreateMisViajeGuiaPayload(
    values: EmployeeViajeGuiaFormValues,
): CreateMiViajeGuiaDto {
    return {
        tipoGuiaID: values.tipoGuiaID,
        serie: values.serie.trim(),
        numero: values.numero.trim(),
        rutaArchivo: values.rutaArchivo || undefined,
    };
}
