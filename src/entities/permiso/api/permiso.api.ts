import { httpClient } from '@shared/api/http';
import type { PermisoGroup } from '../model/types';

export const permisoApi = {
    getGrouped: () =>
        httpClient.get<PermisoGroup[]>('/Permiso').then(res => res.data),
        
    getGroupedByRol: (rolId: number) =>
        httpClient.get<PermisoGroup[]>(`/Permiso/rol/${rolId}`).then(res => res.data),
        
    updateRolPermisos: (rolId: number, permisosIds: number[]) =>
        httpClient.put(`/Permiso/rol/${rolId}`, permisosIds).then(res => res.data),
};