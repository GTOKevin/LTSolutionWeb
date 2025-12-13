// Authentication types matching backend DTOs
export interface LoginRequest {
    nombre: string;
    clave: string;
}

export interface LoginResponse {
    token: string;
    expiresAt: string;
}

export interface User {
    userId: string;
    roleId: string;
    role: string;
}
