import { useEffect, useMemo } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/shared/store/auth.store';
import { VIAJE_QUERY_KEYS } from '@/features/viaje/model/query-keys';
import { NOTIFICACION_KEYS } from '@/entities/notificacion/api/notificacion.api';
import { logger } from '../utils/logger';

export function useSignalR() {
    const queryClient = useQueryClient();
    const token = useAuthStore(state => state.token);

    const connection = useMemo<HubConnection | null>(() => {
        if (!token) {
            return null;
        }

        return new HubConnectionBuilder()
            .withUrl(`${env.imgUrlBase}/hubs/dispatch`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();
    }, [token]);

    useEffect(() => {
        if (!connection) return;

        const handleViajeActualizado = (data: { ViajeId: number, EstadoId: number, Message: string }) => {
            // Invalidate queries to fetch the latest state
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.detail(data.ViajeId) });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.edit(data.ViajeId) });
        };

        const handleReceiveNotification = () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICACION_KEYS.lists() });
        };

        connection.on('ViajeActualizado', handleViajeActualizado);
        connection.on('ReceiveNotification', handleReceiveNotification);

        if (connection.state === 'Disconnected') {
            void connection.start()
                .then(() => {
                    logger.log('SignalR Connected!');
                })
                .catch((error: unknown) => logger.error('Connection failed: ', error));
        }

        return () => {
            connection.off('ViajeActualizado', handleViajeActualizado);
            connection.off('ReceiveNotification', handleReceiveNotification);
            void connection.stop();
        };
    }, [connection, queryClient]);

    return connection;
}
