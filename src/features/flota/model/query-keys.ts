export const FLOTA_QUERY_KEYS = {
    all: ['flotas'] as const,
    list: (
        page: number,
        rowsPerPage: number,
        search?: string,
        estadoOperativo?: string,
        estadoDocumental?: string,
        tipoFlota?: number | null,
    ) =>
        [
            ...FLOTA_QUERY_KEYS.all,
            'list',
            page,
            rowsPerPage,
            search ?? '',
            estadoOperativo ?? '',
            estadoDocumental ?? '',
            tipoFlota ?? 'all',
        ] as const,
    resumen: () => [...FLOTA_QUERY_KEYS.all, 'resumen'] as const,
    detail: (flotaId: number) => ['flota', flotaId] as const,
    expediente: (flotaId: number) => [...FLOTA_QUERY_KEYS.all, 'expediente', flotaId] as const,
    historialViajes: (flotaId: number, page: number, size: number) =>
        [...FLOTA_QUERY_KEYS.all, 'historial-viajes', flotaId, page, size] as const,
    /** Prefijo de todas las páginas de documentos de una unidad (para invalidar). */
    documentosAll: (flotaId: number) => [...FLOTA_QUERY_KEYS.all, 'documentos', flotaId] as const,
    documentos: (flotaId: number, page: number, size: number) =>
        [...FLOTA_QUERY_KEYS.documentosAll(flotaId), page, size] as const,
    taller: (flotaId: number, page: number, size: number) =>
        [...FLOTA_QUERY_KEYS.all, 'taller', flotaId, page, size] as const,
    configuracionesEjes: () => ['configuraciones-ejes'] as const,
};
