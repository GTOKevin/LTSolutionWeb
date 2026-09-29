export interface ValidationError {
    field: string;
    message: string;
}

export interface ApiError {
    data?: unknown;
    errors?: ValidationError[] | string | unknown;
    success?: boolean;
    title?: string;
    status?: number;
    message?: string;
    detail?: string;
    errorType?: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
    detail?: string;
    errorType?: string;
    errors?: ApiError['errors'];
}

export interface PagedResponse<T> {
    items: T[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
}

export interface PagedFilters {
    page: number;
    size: number;
    search?: string;
}

/**
 * Opción de catálogo genérica. `TId` permite reutilizar los mismos componentes
 * de selección tanto para entidades con id numérico como para catálogos con id
 * string (p. ej. categorías de tipo de producto).
 */
export interface SelectOption<TId extends string | number = number> {
    id: TId;
    text: string;
    extra?: string;
    extraTwo?: string;
}

export type SelectItem = SelectOption<number>;

export type SelectStringItem = SelectOption<string>;

