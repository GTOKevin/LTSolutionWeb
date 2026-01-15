import { httpClient } from '@shared/api/http';
import type { PagedResponse, SelectItem } from '@shared/api/types';
import type { Usuario, CreateUsuarioDto, UsuarioParams } from '../model/types';

export interface UsuariosPagedResponse extends PagedResponse<Usuario> {
    activos: number;
    inactivos: number;
    bloqueados: number;
}

export const usuarioApi = {
    getAll: async (params: UsuarioParams) => {
        const { data } = await httpClient.get<UsuariosPagedResponse>('/Usuario', { params });
        return data;
    },

    getById: async (id: number) => {
        const { data } = await httpClient.get<Usuario>(`/Usuario/${id}`);
        return data;
    },

    getSelect: async (search?: string, limit: number = 20) => {
        const { data } = await httpClient.get<SelectItem[]>('/Usuario/select', { params: { search, limit } });
        return data;
    },

    create: async (dto: CreateUsuarioDto) => {
        const { data } = await httpClient.post<number>('/Usuario', dto);
        return data;
    },

    update: async (id: number, dto: CreateUsuarioDto) => {
        await httpClient.put(`/Usuario/${id}`, dto);
    },

    updatePassword: async (id: number, nuevaClave: string) => {
        await httpClient.put(`/Usuario/${id}/password`, JSON.stringify(nuevaClave));
    },

    delete: async (id: number) => {
        await httpClient.delete(`/Usuario/${id}`);
    }
};
