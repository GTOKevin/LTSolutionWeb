import { useQuery } from '@tanstack/react-query';
import { PROFILE_QUERY_KEYS, profileApi } from '@entities/profile/api/profile.api';

export function useMyProfile() {
    return useQuery({
        queryKey: PROFILE_QUERY_KEYS.me(),
        queryFn: () => profileApi.getMe(),
    });
}
