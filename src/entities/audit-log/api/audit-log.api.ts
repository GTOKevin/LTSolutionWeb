import { httpClient } from '@/shared/api/http';
import type { AuditLog, AuditLogParams, PurgeAuditLogResult } from '../model/types';
import type { PagedResponse } from '@/shared/model/types';

export const auditLogApi = {
    getAll: async (params: AuditLogParams) => {
        const { data } = await httpClient.get<PagedResponse<AuditLog>>('/AuditLog', { params });
        return data;
    },
    purge: async () => {
        const { data } = await httpClient.delete<PurgeAuditLogResult>('/AuditLog/purge');
        return data;
    },
};
