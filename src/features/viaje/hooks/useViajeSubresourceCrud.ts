import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/ui/Toast';
import { notifyMutationError, type ViajeMutationError } from './mutation-error';

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
    const useCreate = () => {
        const queryClient = useQueryClient();
        const { showToast } = useToast();

        return useMutation({
            mutationFn: ({ viajeId, data }: { viajeId: number; data: TDto }) => 
                api.create(viajeId, data),
            onSuccess: (_, { viajeId }) => {
                queryClient.invalidateQueries({ queryKey: queryKeyFactory(viajeId) });
                showToast({ entity: entityName, action: 'create' });
            },
            onError: (error: ViajeMutationError) => {
                notifyMutationError(showToast, entityName, 'create', error);
            }
        });
    };

    const useUpdate = () => {
        const queryClient = useQueryClient();
        const { showToast } = useToast();

        return useMutation({
            mutationFn: ({ id, data }: { id: number; data: TDto; viajeId: number }) => 
                api.update(id, data),
            onSuccess: (_, { viajeId }) => {
                queryClient.invalidateQueries({ queryKey: queryKeyFactory(viajeId) });
                showToast({ entity: entityName, action: 'update' });
            },
            onError: (error: ViajeMutationError) => {
                notifyMutationError(showToast, entityName, 'update', error);
            }
        });
    };

    const useDelete = () => {
        const queryClient = useQueryClient();
        const { showToast } = useToast();

        return useMutation({
            mutationFn: ({ id }: { id: number; viajeId: number }) => 
                api.delete(id),
            onSuccess: (_, { viajeId }) => {
                queryClient.invalidateQueries({ queryKey: queryKeyFactory(viajeId) });
                showToast({ entity: entityName, action: 'delete' });
            },
            onError: (error: ViajeMutationError) => {
                notifyMutationError(showToast, entityName, 'delete', error);
            }
        });
    };

    return { useCreate, useUpdate, useDelete };
}
