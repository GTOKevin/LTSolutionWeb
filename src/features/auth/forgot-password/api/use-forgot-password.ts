import { useMutation } from '@tanstack/react-query';
import { authApi } from '@entities/auth/api/auth.api';
import type { ForgotPasswordResponse } from '@entities/auth/model/types';

export const useForgotPassword = () => {
    return useMutation<ForgotPasswordResponse, unknown, string>({
        mutationFn: async (email: string) => authApi.forgotPassword({ email }),
    });
};
