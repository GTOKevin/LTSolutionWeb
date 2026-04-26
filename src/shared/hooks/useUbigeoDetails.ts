import { useQuery } from '@tanstack/react-query';
import { ubigeoApi } from '@/shared/api/ubigeo.api';

export function useUbigeoDetails(ubigeoId?: number) {
    return useQuery({
        queryKey: ['ubigeo-details', ubigeoId],
        queryFn: async () => {
            if (!ubigeoId) return null;
            const res = await ubigeoApi.getById(ubigeoId);
            return res.data;
        },
        enabled: !!ubigeoId,
        staleTime: 1000 * 60 * 60, // 1 hour (ubigeo data rarely changes)
        gcTime: 1000 * 60 * 60 * 2 // 2 hours
    });
}
