// Authentication types matching backend DTOs
export interface LoginRequest {
    nombre: string;
    clave: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    expiresAt: string;
}

export interface RefreshTokenRequest {
    token: string;
    refreshToken: string;
}

export interface User {
    userId: string;
    roleId: string;
    role: string;
    name: string | null;
    email: string | null;
}
