import { httpClient } from './http';
import type { SelectItem } from '@/shared/model/types';

export interface UbigeoAncestors {
    departamentoId: string;
    provinciaId: string;
    distritoId: string;
}

export const ubigeoApi = {
    getDepartamentos: () => httpClient.get<SelectItem[]>('/Ubigeo/departamentos/select'),
    getProvincias: (departamentoId: string) => httpClient.get<SelectItem[]>('/Ubigeo/provincias/select', { params: { departamentoInei: departamentoId } }),
    getDistritos: (provinciaId: string) => httpClient.get<SelectItem[]>('/Ubigeo/distritos/select', { params: { provinciaInei: provinciaId } }),
    // For simple select if backend supports flat search
    getSelect: (search?: string) => httpClient.get<SelectItem[]>('/Ubigeo/select', { params: { search } }),
    
    // New method to get ancestors
    getAncestors: (ubigeoId: number) => httpClient.get<UbigeoAncestors>(`/Ubigeo/${ubigeoId}/ancestors`)
};
