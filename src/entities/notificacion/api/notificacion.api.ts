import { httpClient } from '@shared/api/http';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PagedResponse } from '@/shared/model/types';

export interface NotificacionDto {
    notificacionID: number;
    titulo: string;
    mensaje: string;
    tipoNotificacion: string;
    leido: boolean;
    urlAccion?: string;
    fechaRegistro: string;
}

export const NOTIFICACION_KEYS = {
    all: ['notificaciones'] as const,
    lists: () => [...NOTIFICACION_KEYS.all, 'list'] as const,
};

export const notificacionApi = {
    getNotificaciones: async (page = 1, size = 10) => {
        
        const res = await httpClient.get<PagedResponse<NotificacionDto>>('/Notificaciones', { params: { page, size } });
        return res.data;
    },
    marcarLeida: async (id: number) => {
        const res = await httpClient.put<boolean>(`/Notificaciones/${id}/leida`);
        return res.data;
    },
    marcarTodasLeidas: async () => {
        const res = await httpClient.put<boolean>('/Notificaciones/leidas');
        return res.data;
    }
};

export const useNotificaciones = () => {
    return useQuery({
        queryKey: NOTIFICACION_KEYS.lists(),
        queryFn: () => notificacionApi.getNotificaciones(1, 10),
    });
};

export const useMarcarNotificacionLeida = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificacionApi.marcarLeida,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICACION_KEYS.lists() });
        }
    });
};

export const useMarcarTodasNotificacionesLeidas = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificacionApi.marcarTodasLeidas,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICACION_KEYS.lists() });
        }
    });
};