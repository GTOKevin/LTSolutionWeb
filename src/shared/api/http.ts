import axios, { AxiosError } from 'axios';
import { env } from '../config/env';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '@entities/auth/api/auth.api';

export interface ApiError {
    title: string;
    status: number;
    detail: string;
    errors?: Record<string, string[]>;
}

export const httpClient = axios.create({
    baseURL: env.apiUrl,
    withCredentials: true, // Allow cookies to be sent/received
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

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// Response interceptor for error handling
httpClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as any;

        // Handle 401 Unauthorized - attempt refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent infinite loop: if the refresh token request itself fails with 401, 
            // do not attempt to refresh again.
            if (originalRequest.url?.includes('/auth/refresh-token')) {
                return Promise.reject(error);
            }

            // Do NOT attempt refresh on login failure (401)
            if (originalRequest.url?.includes('/auth/login')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return httpClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const { token, setAuth, setSessionExpired, logout } = useAuthStore.getState();

            // Note: We don't check for refreshToken here anymore because it's in a cookie
            
            try {
                // Call refresh API - send empty tokens or current invalid token just to satisfy DTO if needed
                // But typically for cookie flow, DTO might not be needed or we send empty string
                // The backend will prioritize the cookie
                const res = await authApi.refreshToken({ token: token || '', refreshToken: '' });
                
                // Update store with new access token (refresh token is handled by cookie)
                setAuth(res.token, res.refreshToken); // res.refreshToken might be empty string from backend now
                
                // Process queue
                processQueue(null, res.token);
                
                // Retry original request
                originalRequest.headers['Authorization'] = 'Bearer ' + res.token;
                return httpClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed
                processQueue(refreshError, null);
                
                // Trigger Session Expired Modal
                setSessionExpired(true);
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
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
