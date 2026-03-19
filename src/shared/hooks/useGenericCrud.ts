import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/components/ui/Toast';
import { notifyMutationError, type ApiMutationError } from '@/shared/utils/api-errors';

export interface CrudApi<TCreateArgs, TUpdateArgs, TDeleteArgs> {
    create: (args: TCreateArgs) => Promise<any>;
    update: (args: TUpdateArgs) => Promise<any>;
    delete: (args: TDeleteArgs) => Promise<any>;
}

export function createGenericCrudHooks<TCreateArgs, TUpdateArgs, TDeleteArgs>(
    api: CrudApi<TCreateArgs, TUpdateArgs, TDeleteArgs>,
    entityName: string,
    queryKeyFactory?: (args: any) => (readonly unknown[])[]
) {
    const useCreate = () => {
        const queryClient = useQueryClient();
        const { showToast } = useToast();

        return useMutation({
            mutationFn: (args: TCreateArgs) => api.create(args),
            onSuccess: (_, args) => {
                if (queryKeyFactory) {
                    queryKeyFactory(args).forEach(key => {
                        queryClient.invalidateQueries({ queryKey: key });
                    });
                }
                showToast({ entity: entityName, action: 'create' });
            },
            onError: (error: ApiMutationError) => {
                notifyMutationError(showToast, entityName, 'create', error);
            }
        });
    };

    const useUpdate = () => {
        const queryClient = useQueryClient();
        const { showToast } = useToast();

        return useMutation({
            mutationFn: (args: TUpdateArgs) => api.update(args),
            onSuccess: (_, args) => {
                if (queryKeyFactory) {
                    queryKeyFactory(args).forEach(key => {
                        queryClient.invalidateQueries({ queryKey: key });
                    });
                }
                showToast({ entity: entityName, action: 'update' });
            },
            onError: (error: ApiMutationError) => {
                notifyMutationError(showToast, entityName, 'update', error);
            }
        });
    };

    const useDelete = () => {
        const queryClient = useQueryClient();
        const { showToast } = useToast();

        return useMutation({
            mutationFn: (args: TDeleteArgs) => api.delete(args),
            onSuccess: (_, args) => {
                if (queryKeyFactory) {
                    queryKeyFactory(args).forEach(key => {
                        queryClient.invalidateQueries({ queryKey: key });
                    });
                }
                showToast({ entity: entityName, action: 'delete' });
            },
            onError: (error: ApiMutationError) => {
                notifyMutationError(showToast, entityName, 'delete', error);
            }
        });
    };

    return { useCreate, useUpdate, useDelete };
}
