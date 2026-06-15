import { httpClient } from '@shared/api/http';
import type { MyProfileDto } from '../model/types';

export const PROFILE_QUERY_KEYS = {
    all: ['profile'] as const,
    me: () => [...PROFILE_QUERY_KEYS.all, 'me'] as const,
};

export const profileApi = {
    getMe: async () => {
        const { data } = await httpClient.get<MyProfileDto>('/Profile/me');
        return data;
    },
};

