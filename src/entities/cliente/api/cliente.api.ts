import  { httpClient } from '@shared/api/http';
import type { Cliente, ClienteContacto, CreateClienteDto, CreateClienteContactoDto, ClienteParams } from '../model/types';
import type { PagedResponse, SelectItem } from '@/shared/model/types';

export const clienteApi = {
    getById: async (id: number) => {
        const { data } = await httpClient.get<Cliente>(`/Cliente/${id}`);
        return data;
    },

    getAll: async (params: ClienteParams) => {
        const { data } = await httpClient.get<PagedResponse<Cliente>>('/Cliente', { params });
        return data;
    },

    getSelect: async (search?: string, limit: number = 20) => {
        const { data } = await httpClient.get<SelectItem[]>('/Cliente/select', { params: { search, limit } });
        return data;
    },

    getContactos: async (clienteId?: number, search?: string, activo?: boolean, page: number = 1, size: number = 20) => {
        const { data } = await httpClient.get<PagedResponse<ClienteContacto>>('/Cliente/contactos', {
            params: { clienteId, search, activo, page, size } 
        });
        return data;
    },

    create: async (data: CreateClienteDto) => {
        const response = await httpClient.post<number>('/Cliente', data);
        return response.data;
    },

    addContacto: async (clienteId: number, data: CreateClienteContactoDto) => {
        const response = await httpClient.post<number>(`/Cliente/${clienteId}/contactos`, data);
        return response.data;
    },

    update: (id: number, data: CreateClienteDto) => httpClient.put<void>(`/Cliente/${id}`, data),

    updateContacto: (contactoId: number, data: CreateClienteContactoDto) => 
        httpClient.put<void>(`/Cliente/contactos/${contactoId}`, data),

    removeContacto: (contactoId: number) => httpClient.delete<void>(`/Cliente/contactos/${contactoId}`),

    delete: (id: number) => httpClient.delete<void>(`/Cliente/${id}`),
};
