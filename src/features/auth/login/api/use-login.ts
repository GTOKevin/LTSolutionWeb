import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { APP_PATHS } from '@shared/config/app-routes';
import { authApi } from '@entities/auth/api/auth.api';
import { useAuthStore } from '@shared/store/auth.store';
import type { ApiMutationError } from '@/shared/utils/api-errors';
import type { LoginResponse } from '@entities/auth/model/types';

interface LoginCredentials {
    name: string;
    password: string;
}

export function useLogin() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation<LoginResponse, ApiMutationError, LoginCredentials>({
        mutationFn: ({ name, password }) =>
            authApi.login(name, password),
        onSuccess: (data) => {
            setAuth(data.token);
            navigate(APP_PATHS.appRoot);
        }
    });
}
