import { httpClient } from '@shared/api/http';
import type { LoginRequest, LoginResponse, RefreshTokenRequest } from '../model/types';

export const authApi = {
    login: async (nombre: string, clave: string): Promise<LoginResponse> => {
        const request: LoginRequest = { nombre, clave };
        const response = await httpClient.post<LoginResponse>('/auth/login', request);
        return response.data;
    },

    refreshToken: async (request: RefreshTokenRequest): Promise<LoginResponse> => {
        const response = await httpClient.post<LoginResponse>('/auth/refresh-token', request);
        return response.data;
    }
};
