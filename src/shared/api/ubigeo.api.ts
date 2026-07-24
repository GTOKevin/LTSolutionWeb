import { httpClient } from '@shared/api/http';
import type { SelectItem } from '@shared/model/types';

export interface UbigeoAncestors {
    departamentoId: string;
    provinciaId: string;
    distritoId: string;
}

export interface UbigeoDetail {
    ubigeoID: number;
    departamento: string;
    provincia: string;
    distrito: string;
    latitud: number | null;
    longitud: number | null;
}

export const ubigeoApi = {
    getDepartamentos: async () => {
        const { data } = await httpClient.get<SelectItem[]>('/Ubigeo/departamentos/select');
        return data;
    },
    getProvincias: async (departamentoId: string) => {
        const { data } = await httpClient.get<SelectItem[]>('/Ubigeo/provincias/select', {
            params: { departamentoInei: departamentoId },
        });
        return data;
    },
    getDistritos: async (provinciaId: string) => {
        const { data } = await httpClient.get<SelectItem[]>('/Ubigeo/distritos/select', {
            params: { provinciaInei: provinciaId },
        });
        return data;
    },
    getSelect: async (search?: string) => {
        const { data } = await httpClient.get<SelectItem[]>('/Ubigeo/select', { params: { search } });
        return data;
    },
    getById: async (ubigeoId: number) => {
        const { data } = await httpClient.get<UbigeoDetail>(`/Ubigeo/${ubigeoId}`);
        return data;
    },
    getAncestors: async (ubigeoId: number) => {
        const { data } = await httpClient.get<UbigeoAncestors>(`/Ubigeo/${ubigeoId}/ancestors`);
        return data;
    },
};
