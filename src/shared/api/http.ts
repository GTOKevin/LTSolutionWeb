import axios from 'axios';
import { env } from '../config/env';

export type { ApiError } from '@/shared/model/types';

export const httpClient = axios.create({
    baseURL: env.apiUrl,
    withCredentials: true, // Allow cookies to be sent/received
    headers: {
        'Content-Type': 'application/json',
    },
});
