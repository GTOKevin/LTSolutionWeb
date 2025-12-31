import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@entities/auth/api/auth.api';
import { useAuthStore } from '@shared/store/auth.store';
import type { ApiError } from '@shared/api/http';

export function useLogin() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: ({ name, password }: { name: string; password: string }) =>
            authApi.login(name, password),
        onSuccess: (data) => {
            setAuth(data.token, data.refreshToken);
            navigate('/app');
        },
        onError: (error: ApiError) => {
            console.error('Login failed:', error);
        },
    });
}
