import axios, { AxiosError } from 'axios';
import { env } from '../config/env';
import { useAuthStore } from '../store/auth.store';
import type { ApiError } from './types';

export const httpClient = axios.create({
    baseURL: env.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
httpClient.interceptors.request.use(
    (config) => {
        const { token } = useAuthStore.getState();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
httpClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
        // Handle 401 Unauthorized - trigger logout
        if (error.response?.status === 401) {
            const { logout } = useAuthStore.getState();
            logout();

            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Normalize error response
        const apiError: ApiError = {
            title: error.response?.data?.title || 'Error',
            status: error.response?.status || 500,
            detail: error.response?.data?.detail || error.message,
            errors: error.response?.data?.errors,
        };

        return Promise.reject(apiError);
    }
);

export type { ApiError };
