export interface ValidationError {
    field: string;
    message: string;
}

export interface ApiError {
    title: string;
    status: number;
    detail?: string;
    errors?: ValidationError[];
}

export interface PagedResponse<T> {
    items: T[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
}

export interface SelectItem {
    id: number;
    text: string;
    extra:string;
}

export interface SelectStringItem {
    value: string;
    label: string;
}
