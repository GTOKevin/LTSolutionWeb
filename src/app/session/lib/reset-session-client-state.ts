import type { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@shared/store/auth.store';

export function clearSessionQueryCache(queryClient: QueryClient) {
    queryClient.clear();
}

export function resetSessionClientState(queryClient: QueryClient) {
    clearSessionQueryCache(queryClient);
    useAuthStore.getState().logout();
}
