import { getMantenimientoEstadoColorCandidates } from '@entities/mantenimiento/model/status';
import { matchesEstado } from '@entities/master-data/lib/catalog-utils';
import type { Estado } from '@/shared/model/estado.types';

export const getMantenimientoStatusColor = (estado?: Estado | null): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (!estado) return 'default';

    const candidates = getMantenimientoEstadoColorCandidates();

    if (matchesEstado(estado, candidates.AGENDADO)) return 'default';
    if (matchesEstado(estado, candidates.TALLER)) return 'warning';
    if (matchesEstado(estado, candidates.COMPLETADO)) return 'success';

    return 'default';
};
