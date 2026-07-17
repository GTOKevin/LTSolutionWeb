export const FLOTA_QUERY_KEYS = {
    all: ['flotas'] as const,
    list: (page: number, rowsPerPage: number, search?: string) =>
        [...FLOTA_QUERY_KEYS.all, page, rowsPerPage, search ?? ''] as const,
    detail: (flotaId: number) => ['flota', flotaId] as const,
};
