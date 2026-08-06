import { httpClient } from '@shared/api/http';
import type {
    ChangeOwnPasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    ResetPasswordRequest,
} from '../model/types';

export const authApi = {
    login: async (nombre: string, clave: string): Promise<LoginResponse> => {
        const request: LoginRequest = { nombre, clave };
        const response = await httpClient.post<LoginResponse>('/auth/login', request);
        return response.data;
    },

    refreshToken: async (request: RefreshTokenRequest = {}): Promise<LoginResponse> => {
        const response = await httpClient.post<LoginResponse>('/auth/refresh-token', request);
        return response.data;
    },

    changeOwnPassword: async (request: ChangeOwnPasswordRequest): Promise<void> => {
        await httpClient.put('/auth/change-password', request);
    },

    logout: async (): Promise<void> => {
        await httpClient.post('/auth/logout');
    },

    forgotPassword: async (request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
        const response = await httpClient.post<ForgotPasswordResponse>('/auth/forgot-password', request);
        return response.data;
    },

    resetPassword: async (request: ResetPasswordRequest): Promise<void> => {
        await httpClient.post('/auth/reset-password', request);
    },
};
