import type { QueryKey } from '@tanstack/react-query';
import { createGenericCrudHooks as createFlotaDocumentosHooks } from '@/shared/hooks/useGenericCrud';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { CreateFlotaDocumentoSchema } from '../model/schema';
import { FLOTA_QUERY_KEYS } from '../model/query-keys';

const FlotaDocumentoCrudApi = {
    create: (args: { flotaId: number; data: CreateFlotaDocumentoSchema }) =>
        flotaApi.addDocumento(args.flotaId, args.data),
    update: (args: { id: number; data: CreateFlotaDocumentoSchema }) =>
        flotaApi.updateDocumento(args.id, args.data),
    delete: (id: number) => flotaApi.removeDocumento(id),
};

/**
 * Invalida la caché de flota al mutar documentos. `FLOTA_QUERY_KEYS.all`
 * (`['flotas']`) cubre por prefijo listado, KPIs, expediente, documentos y taller;
 * se agregan explícitamente las keys de documentos/expediente de la unidad cuando
 * el argumento la expone (crear), garantizando refresco de `documentoCritico`/KPIs.
 */
function buildFlotaDocumentoInvalidationKeys(
    args: { flotaId: number; data: CreateFlotaDocumentoSchema } | { id: number; data: CreateFlotaDocumentoSchema } | number,
): QueryKey[] {
    const keys: QueryKey[] = [FLOTA_QUERY_KEYS.all];

    if (args && typeof args === 'object' && 'flotaId' in args && typeof args.flotaId === 'number') {
        keys.push(FLOTA_QUERY_KEYS.documentosAll(args.flotaId));
        keys.push(FLOTA_QUERY_KEYS.expediente(args.flotaId));
    }

    return keys;
}

export const {
    useCreate: useCreateFlotaDocumento,
    useUpdate: useUpdateFlotaDocumento,
    useDelete: useDeleteFlotaDocumento,
} = createFlotaDocumentosHooks(
    FlotaDocumentoCrudApi,
    'Documento de Flota',
    buildFlotaDocumentoInvalidationKeys,
);
