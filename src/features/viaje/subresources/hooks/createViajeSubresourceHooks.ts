import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';

interface CrudApi<TDto, TCreateResult = unknown, TUpdateResult = unknown, TDeleteResult = unknown> {
    create: (viajeId: number, data: TDto) => Promise<TCreateResult>;
    update: (id: number, data: TDto) => Promise<TUpdateResult>;
    delete: (id: number) => Promise<TDeleteResult>;
}

export function createViajeSubresourceHooks<TDto, TCreateResult = unknown, TUpdateResult = unknown, TDeleteResult = unknown>(
    api: CrudApi<TDto, TCreateResult, TUpdateResult, TDeleteResult>,
    entityName: string,
    queryKeyFactory: (viajeId: number) => readonly unknown[],
) {
    const genericApi = {
        create: (args: { viajeId: number; data: TDto }) => api.create(args.viajeId, args.data),
        update: (args: { id: number; data: TDto; viajeId: number }) => api.update(args.id, args.data),
        delete: (args: { id: number; viajeId: number }) => api.delete(args.id),
    };

    return createGenericCrudHooks(
        genericApi,
        entityName,
        (args: { viajeId: number }) => [queryKeyFactory(args.viajeId)],
    );
}
