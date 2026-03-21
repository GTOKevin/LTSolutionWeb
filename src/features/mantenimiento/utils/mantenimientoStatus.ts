import { ESTADO_MANTENIMIENTO_ID } from '@/shared/constants/constantes';
import type { Estado } from '@/shared/model/estado.types';

export const getMantenimientoStatusColor = (estado?: Estado | null): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (!estado) return 'default';
    
    const id = estado.estadoID;
    
    if (ESTADO_MANTENIMIENTO_ID.AGENDADO == id) return 'default';
    if (ESTADO_MANTENIMIENTO_ID.TALLER == id) return 'warning';
    if (ESTADO_MANTENIMIENTO_ID.COMPLETADO == id) return 'success';

    return 'default';
};