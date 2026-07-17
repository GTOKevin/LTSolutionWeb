export const COLABORADOR_QUERY_KEYS = {
    all: ['colaboradores'] as const,
    list: (page: number, rowsPerPage: number, search?: string) =>
        [...COLABORADOR_QUERY_KEYS.all, page, rowsPerPage, search ?? ''] as const,
    detail: (colaboradorId: number) => ['colaborador', colaboradorId] as const,
};
