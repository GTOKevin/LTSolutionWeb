export const env = {
    apiUrl: import.meta.env.VITE_API_URL || 'https://localhost:44332/api/v1',
    imgUrlBase: (import.meta.env.VITE_IMG_URL_BASE || import.meta.env.VITE_API_URL || '').replace(/\/api(?:\/v\d+)?\/?$/, ''),
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
} as const;

if (!env.apiUrl) {
    throw new Error('VITE_API_URL is required');
}

if (!env.imgUrlBase) {
    throw new Error('VITE_IMG_URL_BASE or VITE_API_URL is required');
}

export const buildInternalFileUrl = (path?: string | null) => {
    if (!path) return '';

    const normalizedPath = path.trim();
    if (!normalizedPath) return '';

    try {
        if (/^https?:\/\//i.test(normalizedPath)) {
            const resourceUrl = new URL(normalizedPath);
            const allowedOrigins = new Set([
                new URL(env.imgUrlBase).origin,
                new URL(env.apiUrl).origin
            ]);

            return allowedOrigins.has(resourceUrl.origin) ? resourceUrl.toString() : '';
        }

        const baseUrl = env.imgUrlBase.replace(/\/+$/, '');
        const relativePath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
        return `${baseUrl}${relativePath}`;
    } catch {
        return '';
    }
};
