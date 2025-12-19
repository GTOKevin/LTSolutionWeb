import { httpClient } from './http';

export interface UploadResponse {
    url: string;
}

export const archivoApi = {
    upload: (file: File, folder: string = 'general') => {
        const formData = new FormData();
        formData.append('file', file);
        
        return httpClient.post<UploadResponse>(`/Archivo/upload?folder=${folder}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    delete: (url: string) => {
        return httpClient.delete<void>(`/Archivo/delete`, {
            params: { url }
        });
    }
};
