import { useMutation } from '@tanstack/react-query';
import { authApi } from '@entities/auth/api/auth.api';
import type { ResetPasswordRequest } from '@entities/auth/model/types';

export const useResetPassword = () => {
    return useMutation<void, unknown, ResetPasswordRequest>({
        mutationFn: async (request) => authApi.resetPassword(request),
    });
};
