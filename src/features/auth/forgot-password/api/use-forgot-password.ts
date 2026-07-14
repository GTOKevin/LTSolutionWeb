import { useMutation } from '@tanstack/react-query';
import { httpClient } from '@shared/api/http';

export interface ForgotPasswordResponse {
    message?: string;
}

export const useForgotPassword = () => {
    return useMutation<ForgotPasswordResponse, unknown, string>({
        mutationFn: async (email: string) => {
            const response = await httpClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
            return response.data;
        },
    });
};
