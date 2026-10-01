import { useQuery } from '@tanstack/react-query';
import { PROFILE_QUERY_KEYS, profileApi } from '@entities/profile/api/profile.api';

interface UseMyProfileOptions {
    enabled?: boolean;
}

export function useMyProfile(options?: UseMyProfileOptions) {
    return useQuery({
        queryKey: PROFILE_QUERY_KEYS.me(),
        queryFn: () => profileApi.getMe(),
        enabled: options?.enabled ?? true,
    });
}
