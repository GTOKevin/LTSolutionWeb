interface JWTPayload {
    sub: string; // UserId
    roleId: string;
    role: string;
    exp: number;
    iss?: string;
    aud?: string;
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

    return {
        userId: payload.sub,
        roleId: payload.roleId,
        role: payload.role,
    };
}
