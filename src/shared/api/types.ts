export interface ApiError {
    title: string;
    status: number;
    detail?: string;
    errors?: Record<string, string[]>;
}

export interface PagedResponse<T> {
    items: T[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
}

export interface SelectItem {
    value: number;
    label: string;
}

export interface SelectStringItem {
    value: string;
    label: string;
}
