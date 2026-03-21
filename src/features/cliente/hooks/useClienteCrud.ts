import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import type { CreateClienteSchema } from '../model/schema';

const clienteCrudApi = {
    create: (data: CreateClienteSchema) => clienteApi.create(data),
    update: (args: { id: number; data: CreateClienteSchema }) => clienteApi.update(args.id, args.data),
    delete: (id: number) => clienteApi.delete(id)
};

// Create standardized CRUD hooks for the Cliente module
export const { 
    useCreate: useCreateCliente, 
    useUpdate: useUpdateCliente, 
    useDelete: useDeleteCliente 
} = createGenericCrudHooks(
    clienteCrudApi,
    'Cliente',
    () => [['clientes']] // Invalidate 'clientes' list on success
);