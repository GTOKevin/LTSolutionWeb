import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';

interface CrudApi<TDto> {
    create: (viajeId: number, data: TDto) => Promise<any>;
    update: (id: number, data: TDto) => Promise<any>;
    delete: (id: number) => Promise<any>;
}

export function createViajeSubresourceHooks<TDto>(
    api: CrudApi<TDto>,
    entityName: string,
    queryKeyFactory: (viajeId: number) => readonly unknown[]
) {
    const genericApi = {
        create: (args: { viajeId: number; data: TDto }) => api.create(args.viajeId, args.data),
        update: (args: { id: number; data: TDto; viajeId: number }) => api.update(args.id, args.data),
        delete: (args: { id: number; viajeId: number }) => api.delete(args.id)
    };

    return createGenericCrudHooks(
        genericApi,
        entityName,
        (args: { viajeId: number }) => [queryKeyFactory(args.viajeId)]
    );
}
