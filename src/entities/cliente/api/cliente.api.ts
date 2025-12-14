import  { httpClient } from '@shared/api/http';
import type { Cliente, ClienteContacto, CreateClienteDto, CreateClienteContactoDto, ClienteParams } from '../model/types';
import type { PagedResponse } from '@shared/api/types';

export const clienteApi = {
    getById: (id: number) => httpClient.get<Cliente>(`/Cliente/${id}`),

    getAll: (params: ClienteParams) => 
        httpClient.get<PagedResponse<Cliente>>('/Cliente', { params }),

    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<Cliente[]>('/Cliente/select', { params: { search, limit } }),

    getContactos: (clienteId?: number, search?: string, activo?: boolean, page: number = 1, size: number = 20) =>
        httpClient.get<PagedResponse<ClienteContacto>>('/Cliente/contactos', { 
            params: { clienteId, search, activo, page, size } 
        }),

    create: (data: CreateClienteDto) => httpClient.post<number>('/Cliente', data),

    addContacto: (clienteId: number, data: CreateClienteContactoDto) => 
        httpClient.post<number>(`/Cliente/${clienteId}/contactos`, data),

    update: (id: number, data: CreateClienteDto) => httpClient.put<void>(`/Cliente/${id}`, data),

    updateContacto: (contactoId: number, data: CreateClienteContactoDto) => 
        httpClient.put<void>(`/Cliente/contactos/${contactoId}`, data),

    removeContacto: (contactoId: number) => httpClient.delete<void>(`/Cliente/contactos/${contactoId}`),

    delete: (id: number) => httpClient.delete<void>(`/Cliente/${id}`),
};
