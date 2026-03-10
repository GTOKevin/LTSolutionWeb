import { httpClient } from './http';

export interface UploadResponse {
    url: string;
}

export const archivoApi = {
    upload: async (file: File, folder: string = 'general'): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await httpClient.post<UploadResponse>(`/Archivo/upload?folder=${folder}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    
    delete: async (url: string): Promise<void> => {
        await httpClient.delete(`/Archivo/delete`, {
            params: { url }
        });
    }
};
