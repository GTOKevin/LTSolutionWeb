import { httpClient } from '@/shared/api/http';
import type { TempFilesInfo, TempCleanResult } from '../model/types';

export const sistemaMantenimientoApi = {
    getTempInfo: async () => {
        const { data } = await httpClient.get<TempFilesInfo>('/MantenimientoSistema/temp');
        return data;
    },
    cleanTemp: async () => {
        const { data } = await httpClient.delete<TempCleanResult>('/MantenimientoSistema/temp');
        return data;
    },
};
