import { httpClient } from '@shared/api/http';

export const healthApi = {
    check: async () => {
        await httpClient.get('/health');
        return true;
    },
};
