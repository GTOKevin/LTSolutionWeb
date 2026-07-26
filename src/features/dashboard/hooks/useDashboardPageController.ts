import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estadoApi } from '@entities/estado/api/estado.api';
import { ESTADO_SECTIONS } from '@entities/master-data/model/constants';
import {
    resolveViajeAgendadoId,
    resolveViajeCompletadoId,
    resolveViajeDescargandoId,
    resolveViajeTransitoId,
} from '@entities/viaje/model/status';
import { PERMISSIONS } from '@shared/constants/permissions';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { useLayoutStore } from '@shared/store/layout.store';
import { useDashboardOverview } from './useDashboardOverview';

export function useDashboardPageController() {
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const overview = useDashboardOverview();
    const canViewViajes = usePermission(PERMISSIONS.VIAJES.VER);
    const canViewFacturas = usePermission(PERMISSIONS.FACTURAS.VER);
    const canViewFlota = usePermission(PERMISSIONS.FLOTA.VER);
    const canViewColaboradores = usePermission(PERMISSIONS.COLABORADORES.VER);
    const canViewMantenimientos = usePermission(PERMISSIONS.MANTENIMIENTOS.VER);
    const canViewClientes = usePermission(PERMISSIONS.CLIENTES.VER);
    const canViewUsuarios = usePermission(PERMISSIONS.SISTEMA.USUARIOS.VER);
    const canViewSecurityAlerts =
        canViewFacturas ||
        canViewFlota ||
        canViewColaboradores ||
        canViewMantenimientos ||
        canViewClientes ||
        canViewUsuarios;
    const { data: viajeEstados = [] } = useQuery({
        queryKey: ['dashboard', 'viaje-estados'],
        queryFn: async () => (await estadoApi.getSelect('', 20, ESTADO_SECTIONS.VIAJE)) ?? [],
        enabled: canViewViajes,
    });
    const viajeStatusIds = useMemo(() => ({
        agendadoId: resolveViajeAgendadoId(viajeEstados),
        transitoId: resolveViajeTransitoId(viajeEstados),
        descargandoId: resolveViajeDescargandoId(viajeEstados),
        completadoId: resolveViajeCompletadoId(viajeEstados),
    }), [viajeEstados]);

    useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

    return {
        ...overview,
        permissions: {
            canViewViajes,
            canViewFacturas,
            canViewFlota,
            canViewColaboradores,
            canViewMantenimientos,
            canViewClientes,
            canViewUsuarios,
            canViewSecurityAlerts,
        },
        viajeStatusIds,
    };
}
