export const env = {
    apiUrl: import.meta.env.VITE_API_URL || 'https://localhost:44332/api/v1',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
} as const;

// Validate required environment variables
if (!env.apiUrl) {
    throw new Error('VITE_API_URL is required');
}
