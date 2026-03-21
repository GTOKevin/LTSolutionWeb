import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import type { CreateContactoSchema } from '../model/schema';

// Adapt the API to match the CrudApi interface
const contactosApiAdapter = {
    create: ({ clienteId, data }: { clienteId: number; data: CreateContactoSchema }) => 
        clienteApi.addContacto(clienteId, data),
    update: ({ id, data }: { id: number; data: CreateContactoSchema }) => 
        clienteApi.updateContacto(id, data),
    delete: (id: number) => 
        clienteApi.removeContacto(id)
};

export const { 
    useCreate: useCreateClienteContacto, 
    useUpdate: useUpdateClienteContacto, 
    useDelete: useDeleteClienteContacto 
} = createGenericCrudHooks(
    contactosApiAdapter,
    'Contacto',
    // Invalidate the specific cliente's contactos query
    (args) => {
        if (args && typeof args === 'object' && 'clienteId' in args) {
            return [['cliente-contactos', args.clienteId]];
        }
        // For update and delete, we might not have clienteId directly in args,
        // but typically invalidating all 'cliente-contactos' or just letting it be 
        // handles it. For safety, invalidate base key:
        return [['cliente-contactos']];
    }
);