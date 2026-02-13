interface JWTPayload {
    sub: string; // UserId
    roleId: string;
    role: string;
    permissions?: string; // JWT usually sends this as JSON string if serialized
    exp: number;
    iss?: string;
    aud?: string;
    name?: string;
    email?: string;
}

export function parseJWT(token: string): JWTPayload | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to parse JWT:', error);
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const payload = parseJWT(token);
    if (!payload || !payload.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
}

export function getUserFromToken(token: string) {
    const payload = parseJWT(token);
    if (!payload) return null;

    let permissions: string[] = [];
    if (payload.permissions) {
        try {
            // It might come as a JSON string from backend or array depending on claim type
            permissions = typeof payload.permissions === 'string' 
                ? JSON.parse(payload.permissions) 
                : payload.permissions;
        } catch {
            permissions = [];
        }
    }

    return {
        userId: payload.sub,
        roleId: payload.roleId,
        role: payload.role,
        permissions,
        name: payload.name || null,
        email: payload.email || null
    };
}
