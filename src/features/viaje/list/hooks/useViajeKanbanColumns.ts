import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estadoApi } from '@entities/estado/api/estado.api';
import { ESTADO_SECTIONS } from '@entities/master-data/model/constants';
import type { ViajeListItem } from '@/entities/viaje/model/types';
import { VIAJE_QUERY_KEYS } from '@features/viaje/model/query-keys';
import { resolveViajeKanbanColumns } from '../model/kanban';

export function useViajeKanbanColumns(viajes: ViajeListItem[] | undefined, enabled: boolean) {
    const { data: viajeEstados } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.estados(),
        queryFn: async () => (await estadoApi.getSelect('', 20, ESTADO_SECTIONS.VIAJE)) ?? [],
        enabled,
    });

    return useMemo(
        () => resolveViajeKanbanColumns(viajes, viajeEstados),
        [viajes, viajeEstados],
    );
}
