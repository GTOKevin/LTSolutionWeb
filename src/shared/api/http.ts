import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '@entities/auth/api/auth.api';

export interface ApiError {
    message: string;
    success: boolean;
    data: any;
    errors?: any;
    detail?: string; // Kept for backwards compatibility
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
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

interface FailedRequest {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
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
    (response) => {
        // Unwrap the new ApiResponse format if it exists
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            const apiResponse = response.data;
            if (apiResponse.success) {
                // Overwrite response.data with the actual data payload
                response.data = apiResponse.data;
            } else {
                return Promise.reject(new Error(apiResponse.message || 'API Error'));
            }
        }
        return response;
    },
    async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Handle 401 Unauthorized - attempt refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
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

            const { token, setAuth } = useAuthStore.getState();

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
                processQueue(refreshError, null);
                // Optional: Logout user on refresh failure
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
