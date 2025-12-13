import { useMutation } from '@tanstack/react-query';
import { httpClient } from '@shared/api/http';

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: async (email: string) => {
            const response = await httpClient.post('/auth/forgot-password', { email });
            return response.data;
        },
    });
};
