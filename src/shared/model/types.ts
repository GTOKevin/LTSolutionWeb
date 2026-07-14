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

export interface SelectItem {
    id: number;
    text: string;
    extra?:string;
    extraTwo?: string;
}

export interface SelectStringItem {
    id: string;
    text: string;
    extra?: string;
}

