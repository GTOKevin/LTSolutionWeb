import { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/shared/store/auth.store';
import { useToast } from '@/shared/components/ui/Toast';
import { VIAJE_QUERY_KEYS } from '@/features/viaje/model/query-keys';
import { NOTIFICACION_KEYS } from '@/entities/notificacion/api/notificacion.api';
import { logger } from '../utils/logger';

export function useSignalR() {
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const queryClient = useQueryClient();
    const token = useAuthStore(state => state.token);
    const { showToast } = useToast();

    useEffect(() => {
        if (!token) return;

        const newConnection = new HubConnectionBuilder()
            .withUrl(`${env.imgUrlBase}/hubs/dispatch`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        setConnection(newConnection);

        return () => {
            newConnection.stop();
        };
    }, [token]);

    useEffect(() => {
        if (!connection) return;

        const handleViajeActualizado = (data: { ViajeId: number, EstadoId: number, Message: string }) => {
            // Invalidate queries to fetch the latest state
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.detail(data.ViajeId) });
        };

        const handleReceiveNotification = () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICACION_KEYS.lists() });
        };

        connection.on('ViajeActualizado', handleViajeActualizado);
        connection.on('ReceiveNotification', handleReceiveNotification);

        if (connection.state === 'Disconnected') {
            connection.start()
                .then(() => {
                    logger.log('SignalR Connected!');
                })
                .catch(e => logger.error('Connection failed: ', e));
        }

        return () => {
            connection.off('ViajeActualizado', handleViajeActualizado);
            connection.off('ReceiveNotification', handleReceiveNotification);
        };
    }, [connection, queryClient, showToast]);

    return connection;
}