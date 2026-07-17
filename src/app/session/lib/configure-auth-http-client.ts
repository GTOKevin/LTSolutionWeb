import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authApi } from '@entities/auth/api/auth.api';
import { httpClient } from '@shared/api/http';
import { useAuthStore } from '@shared/store/auth.store';
import type { ApiError } from '@shared/model/types';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

interface FailedRequest {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

let isConfigured = false;
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
            return;
        }

        promise.resolve(token ?? '');
    });

    failedQueue = [];
}

export function configureAuthHttpClient() {
    if (isConfigured) {
        return;
    }

    isConfigured = true;

    httpClient.interceptors.request.use(
        (config) => {
            const { token } = useAuthStore.getState();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error),
    );

    httpClient.interceptors.response.use(
        (response) => {
            if (response.data && typeof response.data === 'object' && 'success' in response.data) {
                const apiResponse = response.data as { success: boolean; data?: unknown; message?: string };

                if (apiResponse.success) {
                    response.data = apiResponse.data;
                } else {
                    return Promise.reject(new Error(apiResponse.message || 'API Error'));
                }
            }

            return response;
        },
        async (error: AxiosError<ApiError>) => {
            const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

            if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
                return Promise.reject(error);
            }

            if (originalRequest.url?.includes('/auth/refresh-token') || originalRequest.url?.includes('/auth/login')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return httpClient(originalRequest);
                    })
                    .catch((refreshError) => Promise.reject(refreshError));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const { token, setAuth, setSessionExpired } = useAuthStore.getState();

            try {
                const response = await authApi.refreshToken({ token: token || '', refreshToken: '' });

                setAuth(response.token, response.refreshToken);
                processQueue(null, response.token);
                originalRequest.headers.Authorization = `Bearer ${response.token}`;

                return httpClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                setSessionExpired(true);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        },
    );
}
