import { httpClient } from '@/shared/api/http';
import type { DeleteLog, DeleteLogParams, PurgeDeleteLogResult } from '../model/types';
import type { PagedResponse } from '@/shared/model/types';

export const deleteLogApi = {
    getAll: async (params: DeleteLogParams) => {
        const { data } = await httpClient.get<PagedResponse<DeleteLog>>('/DeleteLog', { params });
        return data;
    },
    purge: async () => {
        const { data } = await httpClient.delete<PurgeDeleteLogResult>('/DeleteLog/purge');
        return data;
    },
};
